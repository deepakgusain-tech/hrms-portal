"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { formatError } from "../utils";
import { projectMemberSchema } from "../validators";
import z from "zod";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function getProjectMembers() {
  try {
    const records = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        members: {
          orderBy: {
            assignedAt: "asc",
          },
          include: {
            employee: true,
          },
        },
      },
    });

    return records
      .filter((project) => project.members.length > 0)
      .map((project) => ({
        id: project.members[0].id,
        projectId: project.id,
        projectName: project.name,
        assignedAt: project.members[0].assignedAt,
        employees: project.members.map((member) => ({
          id: member.employee.id,
          name: member.employee.employeeName,
          code: member.employee.employeeCode,
        })),
      }));
  } catch {
    return [];
  }
}

export async function getProjectMemberDetails(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        members: {
          orderBy: {
            assignedAt: "asc",
          },
          select: {
            id: true,
            assignedAt: true,
            employee: {
              select: {
                id: true,
                employeeName: true,
                employeeCode: true,
                email: true,
                phone: true,
                joiningDate: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      employees: project.members.map((member) => ({
        memberId: member.id,
        assignedAt: member.assignedAt,
        id: member.employee.id,
        name: member.employee.employeeName,
        code: member.employee.employeeCode,
        email: member.employee.email,
        phone: member.employee.phone,
        joiningDate: member.employee.joiningDate,
      })),
    };
  } catch {
    return null;
  }
}

type ProjectMemberInput = z.infer<typeof projectMemberSchema>;

export async function createProjectMember(data: ProjectMemberInput): Promise<ActionResponse> {
  try {
    const projectMember = projectMemberSchema.parse(data);
    const employeeIds = Array.from(
      new Set(projectMember.employeeIds?.length
        ? projectMember.employeeIds
        : projectMember.employeeId
          ? [projectMember.employeeId]
          : []),
    );

    await prisma.projectMember.createMany({
      data: employeeIds.map((employeeId) => ({
        projectId: projectMember.projectId,
        employeeId,
        assignedAt: projectMember.assignedAt || new Date().toISOString(),
      })),
      skipDuplicates: true,
    });

    revalidatePath("/project-members");
    revalidatePath("/projects");
    revalidatePath("/employee-dashboard");

    return {
      success: true,
      message:
        employeeIds.length === 1
          ? "Project member created successfully"
          : "Project members created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getProjectMemberById(id: string) {
  try {
    const record = await prisma.projectMember.findUnique({
      where: { id },
      select: {
        id: true,
        projectId: true,
        employeeId: true,
        assignedAt: true
      },
    });

    if (!record) {
      return {
        success: false,
        message: "Project member not found",
      };
    }

    return {
      success: true,
      data: record,
      message: "Project member fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateProjectMember(
  data: ProjectMemberInput,
  id: string,
): Promise<ActionResponse> {
  try {
    const projectMember = projectMemberSchema.parse(data);
    const employeeId = projectMember.employeeId || projectMember.employeeIds?.[0];

    if (!employeeId) {
      return {
        success: false,
        message: "Employee is required",
      };
    }

    await prisma.projectMember.update({
      where: { id },
      data: {
        projectId: projectMember.projectId,
        employeeId,
        assignedAt: projectMember.assignedAt || new Date().toISOString(),
      }
    });

    revalidatePath("/project-members");
    revalidatePath(`/project-members/edit/${id}`);
    revalidatePath("/projects");
    revalidatePath("/employee-dashboard");

    return {
      success: true,
      message: "Project member updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteProjectMember(id: string): Promise<ActionResponse> {
  try {
    await prisma.projectMember.delete({
      where: { id },
    });

    revalidatePath("/project-members");

    return {
      success: true,
      message: "Project member deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteProjectMembersByProject(
  projectId: string,
): Promise<ActionResponse> {
  try {
    await prisma.projectMember.deleteMany({
      where: { projectId },
    });

    revalidatePath("/project-members");
    revalidatePath("/projects");
    revalidatePath("/employee-dashboard");

    return {
      success: true,
      message: "Project members removed successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
