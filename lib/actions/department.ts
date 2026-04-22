"use server";

import { Department } from "@/types";
import { prisma } from "../prisma";
import { departmentSchema } from "../validators";
import { formatError } from "../utils";

type ActionResponse = {
  success: boolean;
  message: string;
};

type PrismaDepartment = Awaited<ReturnType<typeof prisma.department.findFirst>>;

function mapDepartment(department: NonNullable<PrismaDepartment>): Department {
  return {
    id: department.id,
    name: department.name,
    code: department.code,
    description: department.description,
    remark: department.remark,
    status: department.status,
    createdAt: department.createdAt.toISOString(),
    updatedAt: department.updatedAt.toISOString(),
  };
}

export async function getDepartments(): Promise<Department[]> {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: "desc" },
    });

    return departments.map(mapDepartment);
  } catch {
    return [];
  }
}

export async function createDepartment(
  data: Department,
): Promise<ActionResponse> {
  try {
    const department = departmentSchema.parse(data);

    await prisma.department.create({
      data: {
        name: department.name,
        code: department.code,
        description: department.description || null,
        remark: department.remark || null,
        status: department.status,
      },
    });

    return {
      success: true,
      message: "Department created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getDepartmentById(id: string) {
  try {
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return {
        success: false,
        message: "Department not found",
      };
    }

    return {
      success: true,
      data: mapDepartment(department),
      message: "Department fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateDepartment(
  data: Department,
  id: string,
): Promise<ActionResponse> {
  try {
    const department = departmentSchema.parse(data);

    await prisma.department.update({
      where: { id },
      data: {
        name: department.name,
        code: department.code,
        description: department.description || null,
        remark: department.remark || null,
        status: department.status,
      },
    });

    return {
      success: true,
      message: "Department updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteDepartment(id: string): Promise<ActionResponse> {
  try {
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return {
        success: false,
        message: "Department not found",
      };
    }

    await prisma.department.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Department deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
