"use server";

import { prisma } from "../prisma";
import { formatError } from "../utils";
import { moduleSchema } from "../validators";
import { Module } from "@/types";

type ActionResponse = {
  success: boolean;
  message: string;
};

type PrismaModule = Awaited<ReturnType<typeof prisma.module.findFirst>>;

function mapModule(m: NonNullable<PrismaModule>): Module {
  return {
    id: m.id,
    name: m.name,
    description: m.description,
    route: m.route,
    status: m.status,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt?.toISOString(),
  };
}

export async function getModules(): Promise<Module[]> {
  const modules = await prisma.module.findMany({
    orderBy: { createdAt: "desc" },
  });

  return modules.map(mapModule);
}

export async function createModule(data: any): Promise<ActionResponse> {
  try {
    const module = moduleSchema.parse(data);

    const route = `/${module.name.toLowerCase().replace(/\s+/g, "-").replace("&", "")}`;

    await prisma.module.create({
      data: {
        name: module.name,
        description: module.description,
        route,
        status: module.status,
      },
    });

    return {
      success: true,
      message: "Module created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getModuleById(id: string) {
  try {
    const module = await prisma.module.findUnique({
      where: { id },
    });

    if (!module) {
      return {
        success: false,
        message: "Module not found",
      };
    }

    return {
      success: true,
      data: mapModule(module),
      message: "Module fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateModule(
  data: any,
  id: string,
): Promise<ActionResponse> {
  try {
    const module = moduleSchema.parse(data);

    const route = `/${module.name.toLowerCase().replace(/\s+/g, "-").replace("&", "")}`;

    await prisma.module.update({
      where: { id },
      data: {
        name: module.name,
        description: module.description,
        route,
        status: module.status,
      },
    });

    return {
      success: true,
      message: "Module updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteModule(id: string): Promise<ActionResponse> {
  try {
    const module = await prisma.module.findUnique({
      where: { id },
    });

    if (!module) {
      return {
        success: false,
        message: "Module not found",
      };
    }

    if (module.route === "/admin") {
      return {
        success: false,
        message: "Core module cannot be deleted",
      };
    }

    await prisma.module.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Module deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
