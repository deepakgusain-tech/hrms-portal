"use server";

import { auth } from "@/auth";
import { Priority, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { formatError } from "../utils";
import { taskSchema } from "../validators";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function getTaskAssignmentOptions() {
  try {
    return await prisma.project.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        members: {
          orderBy: { employee: { employeeName: "asc" } },
          select: {
            employee: {
              select: {
                id: true,
                employeeName: true,
                employeeCode: true,
              },
            },
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export async function createTask(data: unknown): Promise<ActionResponse> {
  try {
    const task = taskSchema.parse(data);

    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_employeeId: {
          projectId: task.projectId,
          employeeId: task.assignedToId,
        },
      },
    });

    if (!projectMember) {
      return {
        success: false,
        message: "Selected employee is not assigned to this project",
      };
    }

    await prisma.task.create({
      data: {
        projectId: task.projectId,
        assignedToId: task.assignedToId,
        title: task.title.trim(),
        description: task.description.trim(),
        status: task.status as TaskStatus,
        priority: task.priority as Priority,
        startDate: task.startDate ? new Date(task.startDate) : null,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      },
    });

    revalidatePath("/project-tracking");
    revalidatePath("/employee-task-tracking");
    revalidatePath(`/project-tracking/${task.projectId}`);

    return {
      success: true,
      message: "Task assigned successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function createProjectWorkspaceTask(
  projectId: string,
  data: unknown,
): Promise<ActionResponse> {
  return createTask({
    ...(typeof data === "object" && data ? data : {}),
    projectId,
  });
}

export async function getMyTaskTrackingRows() {
  const session = await auth();

  if (
    session?.user?.role?.toLowerCase() !== "employee" ||
    !session.user.id
  ) {
    return [];
  }

  try {
    return await prisma.task.findMany({
      where: {
        assignedToId: session.user.id,
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        submissions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });
  } catch {
    return [];
  }
}

export async function submitDailyTask(
  taskId: string,
  summary: string,
): Promise<ActionResponse> {
  const session = await auth();

  if (
    session?.user?.role?.toLowerCase() !== "employee" ||
    !session.user.id
  ) {
    return {
      success: false,
      message: "Only employees can submit daily task updates",
    };
  }

  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        assignedToId: session.user.id,
      },
      include: {
        assignedTo: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!task) {
      return {
        success: false,
        message: "Task not found for current employee",
      };
    }

    await prisma.$transaction([
      prisma.taskSubmission.create({
        data: {
          taskId,
          employeeId: session.user.id,
          workDate: new Date(),
          summary: summary.trim(),
          reviewerTag: task.assignedTo?.managerId
            ? "Manager Review"
            : "HR Review",
        },
      }),
      prisma.task.update({
        where: { id: taskId },
        data: task.status === "TODO" ? { status: "IN_PROGRESS" } : {},
      }),
    ]);

    revalidatePath("/employee-task-tracking");
    revalidatePath("/project-tracking");
    revalidatePath(`/project-tracking/${task.projectId}`);

    return {
      success: true,
      message: "Daily task update submitted for review",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function completeEmployeeTask(taskId: string): Promise<ActionResponse> {
  const session = await auth();

  if (
    session?.user?.role?.toLowerCase() !== "employee" ||
    !session.user.id
  ) {
    return {
      success: false,
      message: "Only employees can complete their assigned tasks",
    };
  }

  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        assignedToId: session.user.id,
      },
      include: {
        assignedTo: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!task) {
      return {
        success: false,
        message: "Task not found for current employee",
      };
    }

    if (task.status === "DONE") {
      return {
        success: true,
        message: "Task is already marked complete",
      };
    }

    await prisma.$transaction([
      prisma.taskSubmission.create({
        data: {
          taskId,
          employeeId: session.user.id,
          workDate: new Date(),
          summary: "Marked task as completed.",
          reviewerTag: task.assignedTo?.managerId
            ? "Manager Review"
            : "HR Review",
        },
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { status: "DONE" },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/employee-dashboard");
    revalidatePath("/employee-task-tracking");
    revalidatePath("/project-tracking");
    revalidatePath(`/project-tracking/${task.projectId}`);

    return {
      success: true,
      message: "Task marked complete",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

function canUseGlobalReview(role?: string | null) {
  const normalized = role?.toLowerCase() ?? "";
  return (
    normalized.includes("admin") ||
    normalized.includes("hr") ||
    normalized === "user"
  );
}

export async function getTaskSubmissionsForReview() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  try {
    return await prisma.taskSubmission.findMany({
      where: canUseGlobalReview(session.user.role)
        ? {}
        : {
            OR: [
              { employee: { managerId: session.user.id } },
              { task: { project: { createdById: session.user.id } } },
            ],
          },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        employee: {
          select: {
            employeeName: true,
            employeeCode: true,
          },
        },
        task: {
          select: {
            title: true,
            project: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export async function reviewTaskSubmission(
  submissionId: string,
  reviewStatus: "APPROVED" | "REJECTED",
  reviewRemark: string,
): Promise<ActionResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to review submissions",
    };
  }

  try {
    const submission = await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        reviewStatus,
        reviewRemark: reviewRemark.trim() || null,
        reviewedAt: new Date(),
      },
      select: {
        task: {
          select: {
            projectId: true,
          },
        },
      },
    });

    revalidatePath("/project-tracking/reviews");
    revalidatePath("/employee-task-tracking");
    revalidatePath(`/project-tracking/${submission.task.projectId}`);

    return {
      success: true,
      message: `Task update ${reviewStatus.toLowerCase()}`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
