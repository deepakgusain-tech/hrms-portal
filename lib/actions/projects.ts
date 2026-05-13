"use server";

import { Project } from "@/types";
import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { formatError } from "../utils";
import { projectSchema } from "../validators";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function getProjects() {
  try {
    const records = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: true,
        members: {
          include: {
            employee: true,
          },
        },
      }
    });

    return records;
  } catch {
    return [];
  }
}

export async function createProject(data: Project): Promise<ActionResponse> {
  try {
    const project = projectSchema.parse(data);

    await prisma.project.create({
      data: {
        name: project.name.trim(),
        description: project.description || null,
        startDate: project.startDate || "",
        endDate: project.endDate || null,
        status: project.status,
        createdBy: {
          connect: { id: project.createdById }
        }
      }
    });

    revalidatePath("/projects");

    return {
      success: true,
      message: "Project created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getProjectById(id: string) {
  try {
    const record = await prisma.project.findUnique({
      where: { id }
    });

    if (!record) {
      return {
        success: false,
        message: "Project not found",
      };
    }

    return {
      success: true,
      data: record,
      message: "Project fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateProject(
  data: Project,
  id: string,
): Promise<ActionResponse> {
  try {
    const project = projectSchema.parse(data);

    await prisma.project.update({
      where: { id },
      data: {
        name: project.name.trim(),
        description: project.description || null,
        startDate: project.startDate || "",
        endDate: project.endDate || null,
        status: project.status,
        createdBy: {
          connect: { id: project.createdById }
        }
      }
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/edit/${id}`);

    return {
      success: true,
      message: "Project updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteProject(id: string): Promise<ActionResponse> {
  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/projects");

    return {
      success: true,
      message: "Project deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
