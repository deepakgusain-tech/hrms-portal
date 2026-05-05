"use server";

import {
  AttendanceStatus,
  LeaveRequestStatus,
  LeaveType,
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageAllAttendance } from "@/lib/rbac";
import { formatError } from "@/lib/utils";

const LEAVE_ROUTE = "/leave-requests";

type ActionResponse<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

export type LeaveRequestRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  reviewedByName: string;
  reviewedAt: string;
  reviewRemark: string;
  createdAt: string;
};

export type CreateLeaveRequestInput = {
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  reason?: string;
};

export type ReviewLeaveRequestInput = {
  status?: "APPROVED" | "REJECTED";
  reviewRemark?: string;
};

function toDateOnly(value?: string | Date | null) {
  if (!value) {
    throw new Error("Date is required");
  }

  const source = new Date(value);
  if (Number.isNaN(source.getTime())) {
    throw new Error("Invalid date");
  }

  return new Date(
    Date.UTC(source.getFullYear(), source.getMonth(), source.getDate()),
  );
}

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getInclusiveDays(startDate: Date, endDate: Date) {
  if (endDate < startDate) {
    throw new Error("End date cannot be before start date");
  }

  return Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
}

function eachDate(startDate: Date, endDate: Date) {
  const dates: Date[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: true,
    },
  });

  if (!user) {
    if (session.user.role?.toLowerCase() !== "employee") {
      throw new Error("Unauthorized");
    }

    const employeeProfile = await prisma.employeeProfile.findFirst({
      where: { email: session.user.email },
      select: {
        id: true,
        employeeName: true,
      },
    });

    if (!employeeProfile) {
      throw new Error("Employee profile not found for current user");
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: {
        name: "employee",
      },
      employeeProfile,
    };
  }

  const employeeProfile = await prisma.employeeProfile.findFirst({
    where: { email: user.email },
    select: {
      id: true,
      employeeName: true,
    },
  });

  return {
    ...user,
    employeeProfile,
  };
}

function mapLeaveRequest(
  request: Prisma.LeaveRequestGetPayload<{
    include: {
      employee: {
        include: {
          department: true;
        };
      };
      reviewedBy: true;
    };
  }>,
): LeaveRequestRecord {
  return {
    id: request.id,
    employeeId: request.employeeId,
    employeeName: request.employee.employeeName,
    employeeCode: request.employee.employeeCode,
    departmentName: request.employee.department?.name ?? "-",
    leaveType: request.leaveType,
    startDate: toDateInput(request.startDate),
    endDate: toDateInput(request.endDate),
    totalDays: request.totalDays,
    reason: request.reason,
    status: request.status,
    reviewedByName: request.reviewedBy
      ? `${request.reviewedBy.firstName} ${request.reviewedBy.lastName}`.trim()
      : "",
    reviewedAt: request.reviewedAt?.toISOString() ?? "",
    reviewRemark: request.reviewRemark ?? "",
    createdAt: request.createdAt.toISOString(),
  };
}

async function syncApprovedLeaveToAttendance(
  employeeId: string,
  startDate: Date,
  endDate: Date,
  reason: string,
) {
  await Promise.all(
    eachDate(startDate, endDate).map((date) =>
      prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId,
            date,
          },
        },
        update: {
          status: AttendanceStatus.LEAVE,
          checkIn: null,
          checkOut: null,
          workingHours: null,
          isLate: false,
          isHalfDay: false,
          remarks: `Leave approved: ${reason}`,
        },
        create: {
          employeeId,
          date,
          status: AttendanceStatus.LEAVE,
          remarks: `Leave approved: ${reason}`,
        },
      }),
    ),
  );
}

function revalidateLeavePaths() {
  revalidatePath(LEAVE_ROUTE);
  revalidatePath("/leave-requests/my");
  revalidatePath("/dashboard");
  revalidatePath("/employee-dashboard");
  revalidatePath("/attendance");
  revalidatePath("/attendance/my");
  revalidatePath("/attendance/sheet");
}

export async function createLeaveRequest(
  input: CreateLeaveRequestInput,
): Promise<ActionResponse<LeaveRequestRecord>> {
  try {
    const currentUser = await getCurrentUser();
    const employeeId = currentUser.employeeProfile?.id;

    if (!employeeId) {
      throw new Error("Employee profile not found for current user");
    }

    const leaveType = input.leaveType;
    if (!leaveType || !Object.values(LeaveType).includes(leaveType)) {
      throw new Error("Leave type is required");
    }

    const startDate = toDateOnly(input.startDate);
    const endDate = toDateOnly(input.endDate);
    const totalDays = getInclusiveDays(startDate, endDate);
    const reason = input.reason?.trim();

    if (!reason) {
      throw new Error("Reason is required");
    }

    const overlappingRequest = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: {
          in: [LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED],
        },
        startDate: {
          lte: endDate,
        },
        endDate: {
          gte: startDate,
        },
      },
      select: {
        id: true,
      },
    });

    if (overlappingRequest) {
      throw new Error(
        "A pending or approved leave request already exists for these dates",
      );
    }

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
        reviewedBy: true,
      },
    });

    revalidateLeavePaths();

    return {
      success: true,
      message: "Leave request submitted successfully",
      data: mapLeaveRequest(request),
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getLeaveRequests(): Promise<LeaveRequestRecord[]> {
  const currentUser = await getCurrentUser();
  const canReview = canManageAllAttendance(currentUser.role?.name);

  if (!canReview && !currentUser.employeeProfile?.id) {
    throw new Error("Employee profile not found for current user");
  }

  const requests = await prisma.leaveRequest.findMany({
    where: canReview
      ? undefined
      : { employeeId: currentUser.employeeProfile?.id },
    orderBy: [{ createdAt: "desc" }],
    include: {
      employee: {
        include: {
          department: true,
        },
      },
      reviewedBy: true,
    },
  });

  return requests.map(mapLeaveRequest);
}

export async function getLeaveDashboard() {
  const currentUser = await getCurrentUser();
  const canReview = canManageAllAttendance(currentUser.role?.name);

  const employeeId = currentUser.employeeProfile?.id;

  // ✅ Safety check
  if (!canReview && !employeeId) {
    throw new Error("Employee profile not found for current user");
  }

  // ✅ Proper typed where builder
  const buildWhere = (
    status: LeaveRequestStatus
  ): Prisma.LeaveRequestWhereInput => {
    return canReview
      ? { status }
      : { employeeId: employeeId!, status };
  };

  // ✅ Parallel queries
  const [pending, approved, rejected] = await Promise.all([
    prisma.leaveRequest.count({
      where: buildWhere(LeaveRequestStatus.PENDING),
    }),
    prisma.leaveRequest.count({
      where: buildWhere(LeaveRequestStatus.APPROVED),
    }),
    prisma.leaveRequest.count({
      where: buildWhere(LeaveRequestStatus.REJECTED),
    }),
  ]);

  return { pending, approved, rejected };
}

export async function reviewLeaveRequest(
  id: string,
  input: ReviewLeaveRequestInput,
): Promise<ActionResponse<LeaveRequestRecord>> {
  try {
    const currentUser = await getCurrentUser();

    if (!canManageAllAttendance(currentUser.role?.name)) {
      throw new Error("Only Admin or HR can approve leave requests");
    }

    if (input.status !== "APPROVED" && input.status !== "REJECTED") {
      throw new Error("Review status must be approved or rejected");
    }

    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Leave request not found");
    }

    if (existing.status !== LeaveRequestStatus.PENDING) {
      throw new Error("Only pending leave requests can be reviewed");
    }

    const request = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: input.status,
        reviewedById: currentUser.id,
        reviewedAt: new Date(),
        reviewRemark: input.reviewRemark?.trim() || null,
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
        reviewedBy: true,
      },
    });

    if (request.status === LeaveRequestStatus.APPROVED) {
      await syncApprovedLeaveToAttendance(
        request.employeeId,
        request.startDate,
        request.endDate,
        request.reason,
      );
    }

    revalidateLeavePaths();

    return {
      success: true,
      message:
        request.status === LeaveRequestStatus.APPROVED
          ? "Leave request approved"
          : "Leave request rejected",
      data: mapLeaveRequest(request),
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
