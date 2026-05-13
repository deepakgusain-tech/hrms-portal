"use server";

import { AttendanceStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  canManageAllAttendance,
  getRoutePermissions,
} from "@/lib/rbac";
import { isHrJobRoleName } from "@/lib/employee-job-role";
import { formatError } from "@/lib/utils";

const ATTENDANCE_ROUTE = "/attendance";
const LATE_AFTER_HOUR = 9;
const LATE_AFTER_MINUTE = 30;
const HALF_DAY_HOURS = 4;

type ActionResponse<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

type AttendanceCalculation = {
  status: AttendanceStatus;
  workingHours: number | null;
  isLate: boolean;
  isHalfDay: boolean;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workingHours: number | null;
  status: AttendanceStatus;
  isLate: boolean;
  isHalfDay: boolean;
  remarks: string;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceGridRow = {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  days: Record<number, AttendanceStatus | "">;
  totals: {
    present: number;
    leaves: number;
    absents: number;
    halfDays: number;
    holidays: number;
  };
};

export type AttendanceMonthSheet = {
  year: number;
  month: number;
  daysInMonth: number;
  rows: AttendanceGridRow[];
};

export type AttendanceFilters = {
  year?: number;
  month?: number;
  employeeId?: string;
  departmentId?: string;
};

export type MarkAttendanceInput = {
  employeeId?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
};

export type UpdateAttendanceInput = {
  employeeId?: string;
  date?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status?: AttendanceStatus;
  remarks?: string | null;
};

function toDateOnly(value?: string | Date | null) {
  const source = value ? new Date(value) : new Date();
  return new Date(
    Date.UTC(source.getFullYear(), source.getMonth(), source.getDate()),
  );
}

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return { start, end, daysInMonth };
}

function calculateWorkingHours(checkIn?: Date | null, checkOut?: Date | null) {
  if (!checkIn || !checkOut || checkOut <= checkIn) return null;
  return Number(((checkOut.getTime() - checkIn.getTime()) / 36e5).toFixed(2));
}

function isLateCheckIn(checkIn?: Date | null) {
  if (!checkIn) return false;

  const threshold = new Date(checkIn);
  threshold.setHours(LATE_AFTER_HOUR, LATE_AFTER_MINUTE, 0, 0);

  return checkIn > threshold;
}

function resolveStatus(
  checkIn?: Date | null,
  checkOut?: Date | null,
  requestedStatus?: AttendanceStatus,
): AttendanceCalculation {
  const workingHours = calculateWorkingHours(checkIn, checkOut);

  if (requestedStatus === AttendanceStatus.HALF_DAY) {
    return {
      status: AttendanceStatus.HALF_DAY,
      workingHours,
      isLate: isLateCheckIn(checkIn),
      isHalfDay: true,
    };
  }

  if (
    requestedStatus &&
    requestedStatus !== AttendanceStatus.PRESENT
  ) {
    return {
      status: requestedStatus,
      workingHours,
      isLate: false,
      isHalfDay: false,
    };
  }

  const isHalfDay = workingHours !== null && workingHours < HALF_DAY_HOURS;

  return {
    status: isHalfDay ? AttendanceStatus.HALF_DAY : AttendanceStatus.PRESENT,
    workingHours,
    isLate: isLateCheckIn(checkIn),
    isHalfDay,
  };
}

function mapAttendance(record: Prisma.AttendanceGetPayload<{
  include: {
    employee: {
      include: {
        department: true;
      };
    };
  };
}>): AttendanceRecord {
  return {
    id: record.id,
    employeeId: record.employeeId,
    employeeName: record.employee.employeeName,
    employeeCode: record.employee.employeeCode,
    departmentName: record.employee.department?.name ?? "-",
    date: toDateInput(record.date),
    checkIn: record.checkIn?.toISOString() ?? "",
    checkOut: record.checkOut?.toISOString() ?? "",
    workingHours: record.workingHours,
    status: record.status,
    isLate: record.isLate,
    isHalfDay: record.isHalfDay,
    remarks: record.remarks ?? "",
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  if (session.user.role?.toLowerCase() === "employee") {
    const employeeProfile = await prisma.employeeProfile.findFirst({
      where: { email: session.user.email },
      select: {
        id: true,
        employeeName: true,
        departmentId: true,
        jobRole: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!employeeProfile) {
      throw new Error("Employee profile not found for current user");
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: {
        name: isHrJobRoleName(employeeProfile.jobRole?.name)
          ? "HR"
          : "employee",
      },
      employeeProfile,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  const employeeProfile = await prisma.employeeProfile.findFirst({
    where: { email: user.email },
    select: {
      id: true,
      employeeName: true,
      departmentId: true,
    },
  });

  return {
    ...user,
    employeeProfile,
  };
}

async function requireAttendancePermission(
  action: "view" | "create" | "edit" | "delete",
) {
  const currentUser = await getCurrentUser();
  const permissions = await getRoutePermissions(ATTENDANCE_ROUTE);
  const canManageFromJobRole = canManageAllAttendance(currentUser.role?.name);
  const allowed =
    action === "view"
      ? permissions.canView || canManageFromJobRole
      : action === "create"
        ? permissions.canCreate || canManageFromJobRole
        : action === "edit"
          ? permissions.canEdit || canManageFromJobRole
          : permissions.canDelete;

  if (!allowed) {
    throw new Error("Forbidden");
  }

  return currentUser;
}

function requireSelfScope(
  currentUser: Awaited<ReturnType<typeof getCurrentUser>>,
  employeeId?: string,
) {
  if (canManageAllAttendance(currentUser.role?.name)) {
    return employeeId;
  }

  if (!currentUser.employeeProfile?.id) {
    throw new Error("Employee profile not found for current user");
  }

  if (employeeId && employeeId !== currentUser.employeeProfile.id) {
    throw new Error("Employees can access only their own attendance");
  }

  return currentUser.employeeProfile.id;
}

export async function getAttendanceOptions() {
  const currentUser = await requireAttendancePermission("view");
  const employeeScoped = !canManageAllAttendance(currentUser.role?.name);

  if (employeeScoped && !currentUser.employeeProfile?.id) {
    throw new Error("Employee profile not found for current user");
  }

  const scopedEmployeeId = employeeScoped
    ? currentUser.employeeProfile?.id
    : undefined;
  const scopedDepartmentId = employeeScoped
    ? currentUser.employeeProfile?.departmentId
    : undefined;

  const [employees, departments] = await Promise.all([
    prisma.employeeProfile.findMany({
      where: scopedEmployeeId ? { id: scopedEmployeeId } : undefined,
      orderBy: [{ employeeName: "asc" }, { employeeCode: "asc" }],
      select: {
        id: true,
        employeeName: true,
        employeeCode: true,
        departmentId: true,
      },
    }),
    prisma.department.findMany({
      where: scopedDepartmentId ? { id: scopedDepartmentId } : undefined,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return { employees, departments };
}

export async function markAttendance(
  input: MarkAttendanceInput,
): Promise<ActionResponse<AttendanceRecord>> {
  try {
    const currentUser = await requireAttendancePermission("create");
    const employeeId = requireSelfScope(currentUser, input.employeeId);
    if (!employeeId) {
      throw new Error("Employee is required");
    }
    const date = toDateOnly(input.date);
    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date } },
    });

    const now = new Date();
    const checkIn = input.checkIn
      ? new Date(input.checkIn)
      : existing?.checkIn ?? now;
    const checkOut = input.checkOut
      ? new Date(input.checkOut)
      : existing?.checkIn
        ? now
        : null;
    const calculated = resolveStatus(checkIn, checkOut);

    const attendance = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date } },
      update: {
        checkIn,
        checkOut,
        workingHours: calculated.workingHours,
        status: calculated.status,
        isLate: calculated.isLate,
        isHalfDay: calculated.isHalfDay,
        remarks: input.remarks || existing?.remarks || null,
      },
      create: {
        employeeId,
        date,
        checkIn,
        checkOut,
        workingHours: calculated.workingHours,
        status: calculated.status,
        isLate: calculated.isLate,
        isHalfDay: calculated.isHalfDay,
        remarks: input.remarks || null,
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    });

    revalidatePath(ATTENDANCE_ROUTE);
    revalidatePath("/attendance/my");
    revalidatePath("/attendance/mark");
    revalidatePath("/attendance/sheet");

    return {
      success: true,
      message: attendance.checkOut
        ? "Attendance updated successfully"
        : "Check-in recorded successfully",
      data: mapAttendance(attendance),
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMonthlyAttendance(
  filters: AttendanceFilters = {},
): Promise<AttendanceMonthSheet> {
  const currentUser = await requireAttendancePermission("view");
  const today = new Date();
  const year = filters.year ?? today.getFullYear();
  const month = filters.month ?? today.getMonth() + 1;
  const employeeId = requireSelfScope(currentUser, filters.employeeId);
  const { start, end, daysInMonth } = getMonthRange(year, month);

  const employees = await prisma.employeeProfile.findMany({
    where: {
      ...(employeeId ? { id: employeeId } : {}),
      ...(filters.departmentId && canManageAllAttendance(currentUser.role?.name)
        ? { departmentId: filters.departmentId }
        : {}),
    },
    orderBy: [{ employeeName: "asc" }, { employeeCode: "asc" }],
    select: {
      id: true,
      employeeName: true,
      employeeCode: true,
      department: {
        select: {
          name: true,
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
          date: true,
          status: true,
        },
      },
    },
  });

  return {
    year,
    month,
    daysInMonth,
    rows: employees.map((employee) => {
      const days: AttendanceGridRow["days"] = {};
      const totals = {
        present: 0,
        leaves: 0,
        absents: 0,
        halfDays: 0,
        holidays: 0,
      };

      for (let day = 1; day <= daysInMonth; day += 1) {
        days[day] = "";
      }

      employee.attendances.forEach((attendance) => {
        const day = attendance.date.getUTCDate();
        days[day] = attendance.status;

        if (attendance.status === AttendanceStatus.PRESENT) totals.present += 1;
        if (attendance.status === AttendanceStatus.LEAVE) totals.leaves += 1;
        if (attendance.status === AttendanceStatus.ABSENT) totals.absents += 1;
        if (attendance.status === AttendanceStatus.HALF_DAY) totals.halfDays += 1;
        if (attendance.status === AttendanceStatus.HOLIDAY) totals.holidays += 1;
      });

      return {
        employeeId: employee.id,
        employeeName: employee.employeeName,
        employeeCode: employee.employeeCode,
        departmentName: employee.department?.name ?? "-",
        days,
        totals,
      };
    }),
  };
}

export async function getEmployeeAttendanceRecords(
  employeeId: string,
): Promise<AttendanceRecord[]> {
  const currentUser = await requireAttendancePermission("view");
  const scopedEmployeeId = requireSelfScope(currentUser, employeeId);

  const records = await prisma.attendance.findMany({
    where: { employeeId: scopedEmployeeId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      employee: {
        include: {
          department: true,
        },
      },
    },
  });

  return records.map(mapAttendance);
}

export async function updateAttendance(
  id: string,
  input: UpdateAttendanceInput,
): Promise<ActionResponse<AttendanceRecord>> {
  try {
    const currentUser = await requireAttendancePermission("edit");
    requireSelfScope(currentUser, input.employeeId);

    if (!canManageAllAttendance(currentUser.role?.name)) {
      throw new Error("Only Admin or HR can edit attendance records directly");
    }

    const existing = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Attendance record not found");
    }

    const checkIn =
      input.checkIn === null
        ? null
        : input.checkIn
          ? new Date(input.checkIn)
          : existing.checkIn;
    const checkOut =
      input.checkOut === null
        ? null
        : input.checkOut
          ? new Date(input.checkOut)
          : existing.checkOut;
    const calculated = resolveStatus(checkIn, checkOut, input.status);

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        employeeId: input.employeeId ?? existing.employeeId,
        date: input.date ? toDateOnly(input.date) : existing.date,
        checkIn,
        checkOut,
        workingHours: calculated.workingHours,
        status: calculated.status,
        isLate: calculated.isLate,
        isHalfDay: calculated.isHalfDay,
        remarks: input.remarks === undefined ? existing.remarks : input.remarks,
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    });

    revalidatePath(ATTENDANCE_ROUTE);
    revalidatePath("/attendance/my");
    revalidatePath("/attendance/sheet");

    return {
      success: true,
      message: "Attendance record updated successfully",
      data: mapAttendance(attendance),
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteAttendance(id: string): Promise<ActionResponse> {
  try {
    const currentUser = await requireAttendancePermission("delete");

    if (!currentUser.role?.name?.toLowerCase().includes("admin")) {
      throw new Error("Only admins can delete attendance records");
    }

    await prisma.attendance.delete({
      where: { id },
    });

    revalidatePath(ATTENDANCE_ROUTE);
    revalidatePath("/attendance/my");
    revalidatePath("/attendance/sheet");

    return {
      success: true,
      message: "Attendance record deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getAttendanceDashboard() {
  const currentUser = await requireAttendancePermission("view");
  const today = toDateOnly(new Date());
  const scopedEmployeeId = requireSelfScope(currentUser);

  const [todayRecords, monthlySheet] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        date: today,
        ...(scopedEmployeeId ? { employeeId: scopedEmployeeId } : {}),
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    getMonthlyAttendance({
      year: today.getUTCFullYear(),
      month: today.getUTCMonth() + 1,
      employeeId: scopedEmployeeId,
    }),
  ]);

  const summary = monthlySheet.rows.reduce(
    (acc, row) => {
      acc.present += row.totals.present;
      acc.leaves += row.totals.leaves;
      acc.absents += row.totals.absents;
      acc.halfDays += row.totals.halfDays;
      return acc;
    },
    { present: 0, leaves: 0, absents: 0, halfDays: 0 },
  );

  return {
    summary,
    todayRecords: todayRecords.map(mapAttendance),
    currentEmployeeId: currentUser.employeeProfile?.id ?? "",
  };
}
