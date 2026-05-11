"use server";

import { auth } from "@/auth";
import { TaskStatus } from "@prisma/client";
import { prisma } from "../prisma";

export type ProjectTrackingRow = {
  id: string;
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  members: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  taskOwners: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  taskCounts: Record<TaskStatus, number>;
  totalTasks: number;
  completionPercent: number;
  nextDueDate: Date | null;
};

const emptyTaskCounts: Record<TaskStatus, number> = {
  TODO: 0,
  IN_PROGRESS: 0,
  DONE: 0,
  BLOCKED: 0,
};

export async function getProjectTrackingRows(): Promise<ProjectTrackingRow[]> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          include: {
            employee: {
              select: {
                id: true,
                employeeName: true,
                employeeCode: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                employeeName: true,
              },
            },
          },
        },
      },
    });

    return projects.map((project) => {
      const taskCounts = { ...emptyTaskCounts };
      const ownerCounts = new Map<string, { id: string; name: string; count: number }>();
      let nextDueDate: Date | null = null;

      project.tasks.forEach((task) => {
        taskCounts[task.status] += 1;

        if (task.assignedTo) {
          const current = ownerCounts.get(task.assignedTo.id);
          ownerCounts.set(task.assignedTo.id, {
            id: task.assignedTo.id,
            name: task.assignedTo.employeeName,
            count: (current?.count ?? 0) + 1,
          });
        }

        if (
          task.dueDate &&
          task.status !== "DONE" &&
          (!nextDueDate || task.dueDate < nextDueDate)
        ) {
          nextDueDate = task.dueDate;
        }
      });

      const totalTasks = project.tasks.length;
      const completionPercent = totalTasks
        ? Math.round((taskCounts.DONE / totalTasks) * 100)
        : 0;

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        members: project.members.map((member) => ({
          id: member.employee.id,
          name: member.employee.employeeName,
          code: member.employee.employeeCode,
        })),
        taskOwners: Array.from(ownerCounts.values()),
        taskCounts,
        totalTasks,
        completionPercent,
        nextDueDate,
      };
    });
  } catch {
    return [];
  }
}

function canManageProjectWorkspace(role?: string | null) {
  const normalized = role?.toLowerCase() ?? "";
  return (
    normalized.includes("admin") ||
    normalized.includes("hr") ||
    normalized === "user"
  );
}

export async function getProjectInteraction(projectId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        createdBy: {
          select: {
            id: true,
            employeeName: true,
          },
        },
        members: {
          orderBy: { employee: { employeeName: "asc" } },
          include: {
            employee: {
              select: {
                id: true,
                employeeName: true,
                employeeCode: true,
                managerId: true,
              },
            },
          },
        },
        tasks: {
          orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
          include: {
            assignedTo: {
              select: {
                id: true,
                employeeName: true,
                employeeCode: true,
                managerId: true,
              },
            },
            submissions: {
              orderBy: { createdAt: "desc" },
              include: {
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
        },
      },
    });

    if (!project) {
      return null;
    }

    const isEmployee = session.user.role?.toLowerCase() === "employee";
    const isProjectMember = project.members.some(
      (member) => member.employeeId === session.user.id,
    );
    const managesMember = project.members.some(
      (member) => member.employee.managerId === session.user.id,
    );
    const canManage =
      canManageProjectWorkspace(session.user.role) ||
      project.createdById === session.user.id ||
      managesMember;

    if (isEmployee && !isProjectMember && !canManage) {
      return null;
    }

    return {
      project,
      currentEmployeeId: isEmployee ? session.user.id : "",
      canManage,
    };
  } catch {
    return null;
  }
}
