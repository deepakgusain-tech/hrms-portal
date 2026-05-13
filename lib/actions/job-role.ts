"use server";

import { JobRole } from "@/types";
import { revalidatePath } from "next/cache";

import { jobRoleSchema } from "../validators";
import { prisma } from "../prisma";
import { formatError } from "../utils";

type ActionResponse = {
  success: boolean;
  message: string;
};

type PrismaJobRole = Awaited<ReturnType<typeof prisma.jobRole.findFirst>>;

function mapJobRole(jobRole: NonNullable<PrismaJobRole>): JobRole {
  return {
    id: jobRole.id,
    name: jobRole.name,
    code: jobRole.code,
    description: jobRole.description,
    remark: jobRole.remark,
    status: jobRole.status,
    createdAt: jobRole.createdAt.toISOString(),
    updatedAt: jobRole.updatedAt.toISOString(),
  };
}

function revalidateJobRolePaths(id?: string) {
  revalidatePath("/job-roles");
  revalidatePath("/employee-profiles");
  revalidatePath("/employee-profiles/create");

  if (id) {
    revalidatePath(`/job-roles/edit/${id}`);
  }
}

export async function getJobRoles(): Promise<JobRole[]> {
  try {
    const jobRoles = await prisma.jobRole.findMany({
      orderBy: { createdAt: "desc" },
    });

    return jobRoles.map(mapJobRole);
  } catch {
    return [];
  }
}

export async function createJobRole(data: JobRole): Promise<ActionResponse> {
  try {
    const jobRole = jobRoleSchema.parse(data);

    await prisma.jobRole.create({
      data: {
        name: jobRole.name,
        code: jobRole.code,
        description: jobRole.description || null,
        remark: jobRole.remark || null,
        status: jobRole.status,
      },
    });

    revalidateJobRolePaths();

    return {
      success: true,
      message: "Job role created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getJobRoleById(id: string) {
  try {
    const jobRole = await prisma.jobRole.findUnique({
      where: { id },
    });

    if (!jobRole) {
      return {
        success: false,
        message: "Job role not found",
      };
    }

    return {
      success: true,
      data: mapJobRole(jobRole),
      message: "Job role fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateJobRole(
  data: JobRole,
  id: string,
): Promise<ActionResponse> {
  try {
    const jobRole = jobRoleSchema.parse(data);

    await prisma.jobRole.update({
      where: { id },
      data: {
        name: jobRole.name,
        code: jobRole.code,
        description: jobRole.description || null,
        remark: jobRole.remark || null,
        status: jobRole.status,
      },
    });

    revalidateJobRolePaths(id);

    return {
      success: true,
      message: "Job role updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteJobRole(id: string): Promise<ActionResponse> {
  try {
    const employeeCount = await prisma.employeeProfile.count({
      where: { jobRoleId: id },
    });

    if (employeeCount > 0) {
      return {
        success: false,
        message: "This job role is assigned to employees and cannot be deleted",
      };
    }

    await prisma.jobRole.delete({
      where: { id },
    });

    revalidateJobRolePaths();

    return {
      success: true,
      message: "Job role deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
