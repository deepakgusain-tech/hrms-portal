"use server";

import { auth } from "@/auth";
import { isHrJobRoleName, isManagerJobRoleName } from "@/lib/employee-job-role";
import { prisma } from "@/lib/prisma";
import { formatError } from "@/lib/utils";
import { eodReportSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";
import { EodApprovalStatus, AttendanceStatus, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

type ActionResponse = {
  success: boolean;
  message: string;
};

type Actor = {
  email: string;
  employeeProfile: {
    id: string;
    employeeName: string;
    employeeCode: string;
    departmentName: string;
    managerName: string;
    jobRoleName: string;
  } | null;
  isEmployee: boolean;
  isManager: boolean;
  isHr: boolean;
  isAdmin: boolean;
};

export type EmployeeEodSection = {
  profile: {
    id: string;
    employeeName: string;
    employeeCode: string;
    departmentName: string;
    managerName: string;
    jobRoleName: string;
  };
  todayAttendance: {
    status: AttendanceStatus;
    checkIn: string;
    checkOut: string;
    workingHours: number | null;
  } | null;
  todayReport: {
    id: string;
    reportDate: string;
    linkedTaskIds: string[];
    linkedTaskTitles: string[];
    accomplishments: string;
    plans: string;
    blockers: string;
    managerStatus: EodApprovalStatus;
    managerRemark: string;
  } | null;
  availableTasks: Array<{
    id: string;
    title: string;
    projectName: string;
    status: TaskStatus;
    dueDate: string;
  }>;
  recentReports: Array<{
    id: string;
    reportDate: string;
    linkedTaskTitles: string[];
    accomplishments: string;
    plans: string;
    blockers: string;
    managerStatus: EodApprovalStatus;
    managerRemark: string;
    attendanceStatus: AttendanceStatus | null;
  }>;
  currentMonth: {
    submitted: number;
    approved: number;
    pending: number;
    rejected: number;
  };
};

export type MonthlyReviewSummary = {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  managerName: string;
  submittedReports: number;
  approvedReports: number;
  pendingReports: number;
  rejectedReports: number;
  attendance: {
    present: number;
    leave: number;
    absent: number;
    halfDay: number;
  };
  managerStatus: EodApprovalStatus;
  managerRemark: string;
  hrStatus: EodApprovalStatus;
  hrRemark: string;
};

export type ManagerEodSection = {
  pendingReports: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    departmentName: string;
    reportDate: string;
    linkedTaskTitles: string[];
    accomplishments: string;
    plans: string;
    blockers: string;
    attendanceStatus: AttendanceStatus | null;
  }>;
  monthlySummaries: MonthlyReviewSummary[];
};

export type HrPayrollSection = {
  monthlySummaries: MonthlyReviewSummary[];
};

export type EodWorkspaceData = {
  actor: {
    isEmployee: boolean;
    isManager: boolean;
    isHr: boolean;
    isAdmin: boolean;
    month: number;
    year: number;
  };
  employeeSection: EmployeeEodSection | null;
  managerSection: ManagerEodSection | null;
  hrSection: HrPayrollSection | null;
};

function toDateOnly(value?: string | Date) {
  const source = value ? new Date(value) : new Date();
  return new Date(Date.UTC(source.getFullYear(), source.getMonth(), source.getDate()));
}

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

async function getActor(): Promise<Actor> {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const email = session.user.email;
  const isEmployee = session.user.role?.toLowerCase() === "employee";

  const employeeProfile = await prisma.employeeProfile.findFirst({
    where: {
      email,
      status: "ACTIVE",
    },
    include: {
      department: {
        select: {
          name: true,
        },
      },
      manager: {
        select: {
          employeeName: true,
        },
      },
      jobRole: {
        select: {
          name: true,
        },
      },
    },
  });

  const directReportCount = employeeProfile
    ? await prisma.employeeProfile.count({
        where: {
          managerId: employeeProfile.id,
          status: "ACTIVE",
        },
      })
    : 0;

  const employeeJobRoleName = employeeProfile?.jobRole?.name || "";
  const isAdmin = !!session.user.role?.toLowerCase().includes("admin");
  const isHr = isAdmin || isHrJobRoleName(employeeJobRoleName) || !!session.user.role?.toLowerCase().includes("hr");
  const isManager =
    !!employeeProfile &&
    (directReportCount > 0 || isManagerJobRoleName(employeeJobRoleName));

  return {
    email,
    employeeProfile: employeeProfile
      ? {
          id: employeeProfile.id,
          employeeName: employeeProfile.employeeName,
          employeeCode: employeeProfile.employeeCode,
          departmentName: employeeProfile.department?.name || "-",
          managerName: employeeProfile.manager?.employeeName || "Top level",
          jobRoleName: employeeJobRoleName || "-",
        }
      : null,
    isEmployee,
    isManager,
    isHr,
    isAdmin,
  };
}

function mapMonthlySummary(input: {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  managerName: string;
  reports: Array<{ managerStatus: EodApprovalStatus }>;
  attendances: Array<{ status: AttendanceStatus }>;
  review?: {
    managerStatus: EodApprovalStatus;
    managerRemark: string | null;
    hrStatus: EodApprovalStatus;
    hrRemark: string | null;
  } | null;
}): MonthlyReviewSummary {
  const attendance = input.attendances.reduce(
    (acc, item) => {
      if (item.status === "PRESENT") acc.present += 1;
      if (item.status === "LEAVE") acc.leave += 1;
      if (item.status === "ABSENT") acc.absent += 1;
      if (item.status === "HALF_DAY") acc.halfDay += 1;
      return acc;
    },
    { present: 0, leave: 0, absent: 0, halfDay: 0 },
  );

  const approvedReports = input.reports.filter((item) => item.managerStatus === "APPROVED").length;
  const pendingReports = input.reports.filter((item) => item.managerStatus === "PENDING").length;
  const rejectedReports = input.reports.filter((item) => item.managerStatus === "REJECTED").length;

  return {
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    employeeCode: input.employeeCode,
    departmentName: input.departmentName,
    managerName: input.managerName,
    submittedReports: input.reports.length,
    approvedReports,
    pendingReports,
    rejectedReports,
    attendance,
    managerStatus: input.review?.managerStatus || "PENDING",
    managerRemark: input.review?.managerRemark || "",
    hrStatus: input.review?.hrStatus || "PENDING",
    hrRemark: input.review?.hrRemark || "",
  };
}

function groupByEmployeeId<T extends { employeeId: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!acc[item.employeeId]) {
      acc[item.employeeId] = [];
    }

    acc[item.employeeId].push(item);
    return acc;
  }, {});
}

function parseLinkedTaskIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function groupTaskTitlesByReportId(
  reports: Array<{ id: string; linkedTaskIds: unknown }>,
  tasks: Array<{ id: string; title: string }>,
) {
  const taskTitleById = new Map(tasks.map((task) => [task.id, task.title]));

  return reports.reduce<Record<string, string[]>>((acc, report) => {
    acc[report.id] = parseLinkedTaskIds(report.linkedTaskIds)
      .map((taskId) => taskTitleById.get(taskId))
      .filter((title): title is string => Boolean(title));

    return acc;
  }, {});
}

export async function getEodWorkspaceData(): Promise<EodWorkspaceData> {
  const actor = await getActor();
  const today = toDateOnly();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;
  const { start, end } = getMonthRange(year, month);

  let employeeSection: EmployeeEodSection | null = null;
  let managerSection: ManagerEodSection | null = null;
  let hrSection: HrPayrollSection | null = null;

  if (actor.employeeProfile) {
    const [todayAttendance, reports, availableTasks] = await Promise.all([
      prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId: actor.employeeProfile.id,
            date: today,
          },
        },
      }),
      prisma.eodReport.findMany({
        where: {
          employeeId: actor.employeeProfile.id,
          reportDate: {
            gte: start,
            lt: end,
          },
        },
        orderBy: {
          reportDate: "desc",
        },
        include: {
          attendance: {
            select: {
              status: true,
            },
          },
        },
      }),
      prisma.task.findMany({
        where: {
          assignedToId: actor.employeeProfile.id,
          OR: [
            { status: { not: "DONE" } },
            {
              submissions: {
                some: {
                  employeeId: actor.employeeProfile.id,
                  workDate: today,
                },
              },
            },
          ],
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const linkedTaskIds = Array.from(
      new Set(reports.flatMap((item) => parseLinkedTaskIds(item.linkedTaskIds))),
    );
    const linkedTasks = linkedTaskIds.length
      ? await prisma.task.findMany({
          where: {
            id: {
              in: linkedTaskIds,
            },
          },
          select: {
            id: true,
            title: true,
          },
        })
      : [];
    const taskTitlesByReportId = groupTaskTitlesByReportId(reports, linkedTasks);
    const todayReport = reports.find((item) => toDateInput(item.reportDate) === toDateInput(today)) || null;

    employeeSection = {
      profile: actor.employeeProfile,
      todayAttendance: todayAttendance
        ? {
            status: todayAttendance.status,
            checkIn: todayAttendance.checkIn?.toISOString() || "",
            checkOut: todayAttendance.checkOut?.toISOString() || "",
            workingHours: todayAttendance.workingHours,
          }
        : null,
      todayReport: todayReport
        ? {
            id: todayReport.id,
            reportDate: toDateInput(todayReport.reportDate),
            linkedTaskIds: parseLinkedTaskIds(todayReport.linkedTaskIds),
            linkedTaskTitles: taskTitlesByReportId[todayReport.id] || [],
            accomplishments: todayReport.accomplishments,
            plans: todayReport.plans || "",
            blockers: todayReport.blockers || "",
            managerStatus: todayReport.managerStatus,
            managerRemark: todayReport.managerRemark || "",
          }
        : null,
      availableTasks: availableTasks.map((task) => ({
        id: task.id,
        title: task.title,
        projectName: task.project.name,
        status: task.status,
        dueDate: task.dueDate ? toDateInput(task.dueDate) : "-",
      })),
      recentReports: reports.slice(0, 7).map((item) => ({
        id: item.id,
        reportDate: toDateInput(item.reportDate),
        linkedTaskTitles: taskTitlesByReportId[item.id] || [],
        accomplishments: item.accomplishments,
        plans: item.plans || "",
        blockers: item.blockers || "",
        managerStatus: item.managerStatus,
        managerRemark: item.managerRemark || "",
        attendanceStatus: item.attendance?.status || null,
      })),
      currentMonth: {
        submitted: reports.length,
        approved: reports.filter((item) => item.managerStatus === "APPROVED").length,
        pending: reports.filter((item) => item.managerStatus === "PENDING").length,
        rejected: reports.filter((item) => item.managerStatus === "REJECTED").length,
      },
    };
  }

  if (actor.isManager && actor.employeeProfile) {
    const directReports = await prisma.employeeProfile.findMany({
      where: {
        managerId: actor.employeeProfile.id,
        status: "ACTIVE",
      },
      orderBy: [{ employeeName: "asc" }, { employeeCode: "asc" }],
      include: {
        department: {
          select: {
            name: true,
          },
        },
        manager: {
          select: {
            employeeName: true,
          },
        },
        attendances: {
          where: {
            date: {
              gte: start,
              lt: end,
            },
          },
          select: {
            status: true,
          },
        },
      },
    });

    const directReportIds = directReports.map((employee) => employee.id);

    const [monthlyReports, monthlyReviews] = directReportIds.length
      ? await Promise.all([
          prisma.eodReport.findMany({
            where: {
              employeeId: {
                in: directReportIds,
              },
              reportDate: {
                gte: start,
                lt: end,
              },
            },
            select: {
              employeeId: true,
              managerStatus: true,
            },
          }),
          prisma.monthlyEodReview.findMany({
            where: {
              employeeId: {
                in: directReportIds,
              },
              year,
              month,
            },
            select: {
              employeeId: true,
              managerStatus: true,
              managerRemark: true,
              hrStatus: true,
              hrRemark: true,
            },
          }),
        ])
      : [[], []];

    const reportsByEmployeeId = groupByEmployeeId(monthlyReports);
    const reviewsByEmployeeId = monthlyReviews.reduce<Record<string, (typeof monthlyReviews)[number]>>(
      (acc, item) => {
        acc[item.employeeId] = item;
        return acc;
      },
      {},
    );

    const pendingReports = directReportIds.length
      ? await prisma.eodReport.findMany({
          where: {
            employeeId: {
              in: directReportIds,
            },
            managerStatus: "PENDING",
          },
          orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
          take: 20,
          include: {
            employee: {
              include: {
                department: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            attendance: {
              select: {
                status: true,
              },
            },
          },
        })
      : [];

    const pendingLinkedTaskIds = Array.from(
      new Set(pendingReports.flatMap((item) => parseLinkedTaskIds(item.linkedTaskIds))),
    );
    const pendingLinkedTasks = pendingLinkedTaskIds.length
      ? await prisma.task.findMany({
          where: {
            id: {
              in: pendingLinkedTaskIds,
            },
          },
          select: {
            id: true,
            title: true,
          },
        })
      : [];
    const pendingTaskTitlesByReportId = groupTaskTitlesByReportId(pendingReports, pendingLinkedTasks);

    managerSection = {
      pendingReports: pendingReports.map((item) => ({
        id: item.id,
        employeeId: item.employeeId,
        employeeName: item.employee.employeeName,
        employeeCode: item.employee.employeeCode,
        departmentName: item.employee.department?.name || "-",
        reportDate: toDateInput(item.reportDate),
        linkedTaskTitles: pendingTaskTitlesByReportId[item.id] || [],
        accomplishments: item.accomplishments,
        plans: item.plans || "",
        blockers: item.blockers || "",
        attendanceStatus: item.attendance?.status || null,
      })),
      monthlySummaries: directReports.map((employee) =>
        mapMonthlySummary({
          employeeId: employee.id,
          employeeName: employee.employeeName,
          employeeCode: employee.employeeCode,
          departmentName: employee.department?.name || "-",
          managerName: employee.manager?.employeeName || "Top level",
          reports: reportsByEmployeeId[employee.id] || [],
          attendances: employee.attendances,
          review: reviewsByEmployeeId[employee.id] || null,
        }),
      ),
    };
  }

  if (actor.isHr || actor.isAdmin) {
    const employees = await prisma.employeeProfile.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: [{ employeeName: "asc" }, { employeeCode: "asc" }],
      include: {
        department: {
          select: {
            name: true,
          },
        },
        manager: {
          select: {
            employeeName: true,
          },
        },
        attendances: {
          where: {
            date: {
              gte: start,
              lt: end,
            },
          },
          select: {
            status: true,
          },
        },
      },
    });

    const employeeIds = employees.map((employee) => employee.id);
    const [monthlyReports, monthlyReviews] = employeeIds.length
      ? await Promise.all([
          prisma.eodReport.findMany({
            where: {
              employeeId: {
                in: employeeIds,
              },
              reportDate: {
                gte: start,
                lt: end,
              },
            },
            select: {
              employeeId: true,
              managerStatus: true,
            },
          }),
          prisma.monthlyEodReview.findMany({
            where: {
              employeeId: {
                in: employeeIds,
              },
              year,
              month,
            },
            select: {
              employeeId: true,
              managerStatus: true,
              managerRemark: true,
              hrStatus: true,
              hrRemark: true,
            },
          }),
        ])
      : [[], []];

    const reportsByEmployeeId = groupByEmployeeId(monthlyReports);
    const reviewsByEmployeeId = monthlyReviews.reduce<Record<string, (typeof monthlyReviews)[number]>>(
      (acc, item) => {
        acc[item.employeeId] = item;
        return acc;
      },
      {},
    );

    hrSection = {
      monthlySummaries: employees.map((employee) =>
        mapMonthlySummary({
          employeeId: employee.id,
          employeeName: employee.employeeName,
          employeeCode: employee.employeeCode,
          departmentName: employee.department?.name || "-",
          managerName: employee.manager?.employeeName || "Top level",
          reports: reportsByEmployeeId[employee.id] || [],
          attendances: employee.attendances,
          review: reviewsByEmployeeId[employee.id] || null,
        }),
      ),
    };
  }

  return {
    actor: {
      isEmployee: actor.isEmployee,
      isManager: actor.isManager,
      isHr: actor.isHr,
      isAdmin: actor.isAdmin,
      month,
      year,
    },
    employeeSection,
    managerSection,
    hrSection,
  };
}

export async function submitEodReport(input: unknown): Promise<ActionResponse> {
  try {
    const actor = await getActor();

    if (!actor.employeeProfile) {
      throw new Error("Employee profile not found");
    }

    const record = eodReportSchema.parse(input);
    const reportDate = toDateOnly(record.reportDate);
    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: actor.employeeProfile.id,
          date: reportDate,
        },
      },
    });

    await prisma.eodReport.upsert({
      where: {
        employeeId_reportDate: {
          employeeId: actor.employeeProfile.id,
          reportDate,
        },
      },
      update: {
        linkedTaskIds: record.linkedTaskIds?.length
          ? record.linkedTaskIds
          : Prisma.JsonNull,
        accomplishments: record.accomplishments.trim(),
        plans: record.plans?.trim() || null,
        blockers: record.blockers?.trim() || null,
        attendanceId: attendance?.id || null,
        managerStatus: "PENDING",
        managerRemark: null,
        reviewedByManagerId: null,
      },
      create: {
        employeeId: actor.employeeProfile.id,
        attendanceId: attendance?.id || null,
        reportDate,
        linkedTaskIds: record.linkedTaskIds?.length
          ? record.linkedTaskIds
          : Prisma.JsonNull,
        accomplishments: record.accomplishments.trim(),
        plans: record.plans?.trim() || null,
        blockers: record.blockers?.trim() || null,
      },
    });

    revalidatePath("/eod-reporting");
    revalidatePath("/employee-dashboard");
    revalidatePath("/employee-task-tracking");

    return {
      success: true,
      message: "EOD report submitted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function reviewEodReport(
  reportId: string,
  reviewStatus: "APPROVED" | "REJECTED",
  reviewRemark: string,
): Promise<ActionResponse> {
  try {
    const actor = await getActor();

    const existing = await prisma.eodReport.findUnique({
      where: {
        id: reportId,
      },
      include: {
        employee: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new Error("EOD report not found");
    }

    const canReview =
      actor.isHr ||
      actor.isAdmin ||
      (actor.employeeProfile && existing.employee.managerId === actor.employeeProfile.id);

    if (!canReview) {
      throw new Error("You are not allowed to review this EOD report");
    }

    await prisma.eodReport.update({
      where: {
        id: reportId,
      },
      data: {
        managerStatus: reviewStatus,
        managerRemark: reviewRemark.trim() || null,
        reviewedByManagerId: actor.employeeProfile?.id || null,
      },
    });

    revalidatePath("/eod-reporting");
    revalidatePath("/employee-dashboard");
    revalidatePath("/employee-task-tracking");

    return {
      success: true,
      message: `EOD report ${reviewStatus.toLowerCase()}`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function reviewMonthlyEod(
  employeeId: string,
  year: number,
  month: number,
  stage: "manager" | "hr",
  reviewStatus: "APPROVED" | "REJECTED",
  reviewRemark: string,
): Promise<ActionResponse> {
  try {
    const actor = await getActor();
    const employee = await prisma.employeeProfile.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        id: true,
        managerId: true,
      },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (stage === "manager") {
      const canReview =
        actor.isHr ||
        actor.isAdmin ||
        (actor.employeeProfile && employee.managerId === actor.employeeProfile.id);

      if (!canReview) {
        throw new Error("You are not allowed to approve this monthly review");
      }
    }

    if (stage === "hr" && !(actor.isHr || actor.isAdmin)) {
      throw new Error("Only HR can approve salary readiness");
    }

    if (stage === "hr") {
      const existingReview = await prisma.monthlyEodReview.findUnique({
        where: {
          employeeId_year_month: {
            employeeId,
            year,
            month,
          },
        },
        select: {
          managerStatus: true,
        },
      });

      if (existingReview?.managerStatus !== "APPROVED") {
        throw new Error("Manager approval is required before HR payroll approval");
      }
    }

    await prisma.monthlyEodReview.upsert({
      where: {
        employeeId_year_month: {
          employeeId,
          year,
          month,
        },
      },
      update:
        stage === "manager"
          ? {
              managerStatus: reviewStatus,
              managerRemark: reviewRemark.trim() || null,
              reviewedByManagerId: actor.employeeProfile?.id || null,
            }
          : {
              hrStatus: reviewStatus,
              hrRemark: reviewRemark.trim() || null,
              reviewedByHrEmail: actor.email,
            },
      create:
        stage === "manager"
          ? {
              employeeId,
              year,
              month,
              managerStatus: reviewStatus,
              managerRemark: reviewRemark.trim() || null,
              reviewedByManagerId: actor.employeeProfile?.id || null,
            }
          : {
              employeeId,
              year,
              month,
              hrStatus: reviewStatus,
              hrRemark: reviewRemark.trim() || null,
              reviewedByHrEmail: actor.email,
            },
    });

    revalidatePath("/eod-reporting");
    revalidatePath("/employee-dashboard");
    revalidatePath("/employee-task-tracking");

    return {
      success: true,
      message:
        stage === "manager"
          ? `Monthly review ${reviewStatus.toLowerCase()}`
          : `Payroll approval ${reviewStatus.toLowerCase()}`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
