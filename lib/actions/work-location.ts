"use server";

import { Status } from "@/app/generated/prisma/client";
import { WorkLocation } from "@/types";
import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { formatError } from "../utils";
import { workLocationSchema } from "../validators";

type ActionResponse = {
  success: boolean;
  message: string;
};

function mapWorkLocation(location: {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string | null;
  remark: string | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}): WorkLocation {
  return {
    id: location.id,
    name: location.name,
    code: location.code,
    address: location.address,
    city: location.city,
    state: location.state,
    country: location.country,
    postalCode: location.postalCode ?? "",
    remark: location.remark ?? "",
    status: location.status,
    createdAt: location.createdAt.toISOString(),
    updatedAt: location.updatedAt.toISOString(),
  };
}

export async function getWorkLocations() {
  try {
    const locations = await prisma.workLocation.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return locations.map(mapWorkLocation);
  } catch (error) {
    return [];
  }
}

export async function createWorkLocation(
  data: WorkLocation
): Promise<ActionResponse> {
  try {
    const location = workLocationSchema.parse(data);

    await prisma.workLocation.create({
      data: {
        name: location.name,
        code: location.code,
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country,
        postalCode: location.postalCode || null,
        remark: location.remark || null,
        status: location.status,
      },
    });

    revalidatePath("/work-location");

    return {
      success: true,
      message: "Work location created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getWorkLocationById(id: string) {
  try {
    const location = await prisma.workLocation.findUnique({
      where: { id },
    });

    if (!location) {
      return {
        success: false,
        message: "Work location not found",
      };
    }

    return {
      success: true,
      data: mapWorkLocation(location),
      message: "Work location fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateWorkLocation(
  data: WorkLocation,
  id: string
): Promise<ActionResponse> {
  try {
    const location = workLocationSchema.parse(data);

    const existingLocation = await prisma.workLocation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingLocation) {
      return {
        success: false,
        message: "Work location not found",
      };
    }

    await prisma.workLocation.update({
      where: { id },
      data: {
        name: location.name,
        code: location.code,
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country,
        postalCode: location.postalCode || null,
        remark: location.remark || null,
        status: location.status,
      },
    });

    revalidatePath("/work-location");
    revalidatePath(`/work-location/edit/${id}`);

    return {
      success: true,
      message: "Work location updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteWorkLocation(
  id: string
): Promise<ActionResponse> {
  try {
    await prisma.workLocation.delete({
      where: { id },
    });

    revalidatePath("/work-location");

    return {
      success: true,
      message: "Work location deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
