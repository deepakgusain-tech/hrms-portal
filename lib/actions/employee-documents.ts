"use server";

import { auth } from "@/auth";
import {
  Prisma,
  ExperienceType,
  Status,
} from "@prisma/client";
import { EmployeeDocument } from "@/types";
import { revalidatePath } from "next/cache";
import type { DocumentReviewStatus } from "../document-review";
import { isHrJobRoleName } from "../employee-job-role";
import { prisma } from "../prisma";
import { formatError } from "../utils";
import { employeeDocumentSchema } from "../validators";

type ActionResponse = {
  success: boolean;
  message: string;
};

type EducationEntry = {
  degree?: string;
  college?: string;
  year?: string;
  marks?: number;
  marksheetFileUrl?: string;
};

type ExperienceEntry = {
  totalExperience?: string;
  previousCompanyName?: string;
  experienceLetterFileUrl?: string;
  salarySlip1FileUrl?: string;
  salarySlip2FileUrl?: string;
  salarySlip3FileUrl?: string;
};

type EmployeeDocumentOwner = {
  id: string;
  employeeName: string;
  employeeCode: string;
};

type EmployeeDocumentAccess = {
  isEmployee: boolean;
  isHrEmployee: boolean;
  owner: EmployeeDocumentOwner | null;
};

async function getCurrentEmployeeAccess(): Promise<EmployeeDocumentAccess> {
  const session = await auth();
  const isEmployee = session?.user?.role?.toLowerCase() === "employee";

  if (!isEmployee || !session?.user?.email) {
    return {
      isEmployee,
      isHrEmployee: false,
      owner: null,
    };
  }

  const owner = await prisma.employeeProfile.findFirst({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      employeeName: true,
      employeeCode: true,
      jobRole: {
        select: {
          name: true,
        },
      },
    },
  });

  const isHrEmployee = isHrJobRoleName(owner?.jobRole?.name);

  return {
    isEmployee,
    isHrEmployee,
    owner: owner
      ? {
          id: owner.id,
          employeeName: owner.employeeName,
          employeeCode: owner.employeeCode,
        }
      : null,
  };
}

async function getCurrentEmployeeOwner(): Promise<EmployeeDocumentOwner | null> {
  const access = await getCurrentEmployeeAccess();
  return access.owner;
}

export async function getCurrentEmployeeDocumentOwner() {
  return getCurrentEmployeeOwner();
}

function normalizeEducationEntries(
  value: Prisma.JsonValue | null | undefined,
): EducationEntry[] {
  if (!Array.isArray(value)) return [];

  return value.map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;

    return {
      degree:
        typeof record.degree === "string"
          ? record.degree
          : "",

      college:
        typeof record.college === "string"
          ? record.college
          : "",

      year:
        typeof record.year === "string"
          ? record.year
          : "",

      marks:
        typeof record.marks === "number"
          ? record.marks
          : undefined,

      marksheetFileUrl:
        typeof record.marksheetFileUrl === "string"
          ? record.marksheetFileUrl
          : "",
    };
  });
}

function normalizeExperienceEntries(
  value: Prisma.JsonValue | null | undefined,
): ExperienceEntry[] {
  if (!Array.isArray(value)) return [];

  return value.map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;

    return {
      totalExperience:
        typeof record.totalExperience === "string"
          ? record.totalExperience
          : "",

      previousCompanyName:
        typeof record.previousCompanyName === "string"
          ? record.previousCompanyName
          : "",

      experienceLetterFileUrl:
        typeof record.experienceLetterFileUrl === "string"
          ? record.experienceLetterFileUrl
          : "",

      salarySlip1FileUrl:
        typeof record.salarySlip1FileUrl === "string"
          ? record.salarySlip1FileUrl
          : "",

      salarySlip2FileUrl:
        typeof record.salarySlip2FileUrl === "string"
          ? record.salarySlip2FileUrl
          : "",

      salarySlip3FileUrl:
        typeof record.salarySlip3FileUrl === "string"
          ? record.salarySlip3FileUrl
          : "",
    };
  });
}

function mapEmployeeDocument(record: {
  id: string;
  employeeId: string;
  employeeCode: string;

  aadhaarNumber: string;
  aadhaarFileUrl: string | null;

  panNumber: string;
  panFileUrl: string | null;

  educationEntries: Prisma.JsonValue | null;

  experienceType: ExperienceType;
  experienceEntries: Prisma.JsonValue | null;

  reviewStatus: DocumentReviewStatus;
  reviewRemark: string | null;
  reviewedAt: Date | null;
  reviewedBy?: {
    firstName: string;
    lastName: string;
  } | null;
  remark: string | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date;

  employee?: {
    employeeName: string;
  };
}): EmployeeDocument {
  return {
    id: record.id,
    employeeId: record.employeeId,
    employeeCode: record.employeeCode,

    aadhaarNumber: record.aadhaarNumber,
    aadhaarFileUrl: record.aadhaarFileUrl ?? "",

    panNumber: record.panNumber,
    panFileUrl: record.panFileUrl ?? "",

    educationEntries: normalizeEducationEntries(
      record.educationEntries,
    ),

    experienceType: record.experienceType,
    experienceEntries: normalizeExperienceEntries(
      record.experienceEntries,
    ),

    reviewStatus: record.reviewStatus,
    reviewRemark: record.reviewRemark ?? "",
    reviewedAt: record.reviewedAt?.toISOString() ?? "",
    reviewedByName: record.reviewedBy
      ? `${record.reviewedBy.firstName} ${record.reviewedBy.lastName}`.trim()
      : "",
    remark: record.remark ?? "",
    status: record.status,

    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),

    employeeName: record.employee?.employeeName ?? "",
  };
}

export async function getEmployeeDocuments(): Promise<EmployeeDocument[]> {
  try {
    const access = await getCurrentEmployeeAccess();

    if (access.isEmployee && !access.isHrEmployee && !access.owner) {
      return [];
    }

    const records = await prisma.employeeDocument.findMany({
      where: access.owner && !access.isHrEmployee
        ? {
            employeeId: access.owner.id,
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        employee: {
          select: {
            employeeName: true,
          },
        },
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return records.map(mapEmployeeDocument);
  } catch {
    return [];
  }
}

export async function createEmployeeDocument(
  data: EmployeeDocument,
): Promise<ActionResponse> {
  try {
    const access = await getCurrentEmployeeAccess();

    if (access.isEmployee && !access.isHrEmployee && !access.owner) {
      return {
        success: false,
        message: "Your employee profile is not linked yet",
      };
    }

    const record = employeeDocumentSchema.parse(
      access.owner && !access.isHrEmployee
        ? {
            ...data,
            employeeId: access.owner.id,
            employeeCode: access.owner.employeeCode,
          }
        : data,
    );

    if (
      access.owner &&
      !access.isHrEmployee &&
      record.employeeId !== access.owner.id
    ) {
      return {
        success: false,
        message: "You can only add documents for your own profile",
      };
    }

    await prisma.employeeDocument.create({
      data: {
        employeeId: record.employeeId,
        employeeCode: record.employeeCode,

        aadhaarNumber: record.aadhaarNumber,
        aadhaarFileUrl: record.aadhaarFileUrl || null,

        panNumber: record.panNumber,
        panFileUrl: record.panFileUrl || null,

        educationEntries:
          ((record.educationEntries ?? []) as Prisma.InputJsonValue),

        experienceType: record.experienceType,

        experienceEntries:
          record.experienceType === ExperienceType.EXPERIENCED
            ? ((record.experienceEntries ?? []) as Prisma.InputJsonValue)
            : Prisma.JsonNull,

        reviewStatus: "PENDING",
        reviewRemark: null,
        reviewedById: null,
        reviewedAt: null,
        remark: record.remark || null,
        status: record.status,
      },
    });
    revalidatePath("/employee-documents");
    revalidatePath("/employee-dashboard");

    return {
      success: true,
      message: "Employee document created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getEmployeeDocumentById(id: string) {
  try {
    const access = await getCurrentEmployeeAccess();
    const record =
      await prisma.employeeDocument.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              employeeName: true,
            },
          },
          reviewedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

    if (
      !record ||
      (access.isEmployee &&
        !access.isHrEmployee &&
        (!access.owner || record.employeeId !== access.owner.id))
    ) {
      return {
        success: false,
        message: "Employee document not found",
      };
    }

    return {
      success: true,
      data: mapEmployeeDocument(record),
      message: "Employee document fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateEmployeeDocument(
  data: EmployeeDocument,
  id: string,
): Promise<ActionResponse> {
  try {
    const access = await getCurrentEmployeeAccess();

    if (access.isEmployee && !access.isHrEmployee && !access.owner) {
      return {
        success: false,
        message: "Your employee profile is not linked yet",
      };
    }

    const record = employeeDocumentSchema.parse(
      access.owner && !access.isHrEmployee
        ? {
            ...data,
            employeeId: access.owner.id,
            employeeCode: access.owner.employeeCode,
          }
        : data,
    );

    const existing =
      await prisma.employeeDocument.findUnique({
        where: { id },
        select: { id: true, employeeId: true },
      });

    if (
      !existing ||
      (access.isEmployee &&
        !access.isHrEmployee &&
        (!access.owner || existing.employeeId !== access.owner.id))
    ) {
      return {
        success: false,
        message: "Employee document not found",
      };
    }

    await prisma.employeeDocument.update({
      where: { id },
      data: {
        employeeId: record.employeeId,
        employeeCode: record.employeeCode,

        aadhaarNumber: record.aadhaarNumber,
        aadhaarFileUrl: record.aadhaarFileUrl || null,

        panNumber: record.panNumber,
        panFileUrl: record.panFileUrl || null,

        educationEntries:
          ((record.educationEntries ?? []) as Prisma.InputJsonValue),

        experienceType: record.experienceType,

        experienceEntries:
          record.experienceType === ExperienceType.EXPERIENCED
            ? ((record.experienceEntries ?? []) as Prisma.InputJsonValue)
            : Prisma.JsonNull,

        reviewStatus: "PENDING",
        reviewRemark: null,
        reviewedById: null,
        reviewedAt: null,
        remark: record.remark || null,
        status: record.status,
      },
    });

    revalidatePath("/employee-documents");
    revalidatePath("/employee-dashboard");
    revalidatePath(`/employee-documents/edit/${id}`);

    return {
      success: true,
      message: "Employee document updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function reviewEmployeeDocument(
  id: string,
  input: { reviewStatus?: DocumentReviewStatus; reviewRemark?: string },
): Promise<ActionResponse> {
  try {
    const access = await getCurrentEmployeeAccess();

    if (!access.isHrEmployee) {
      return {
        success: false,
        message: "Only HR can review employee documents",
      };
    }

    if (
      input.reviewStatus !== "APPROVED" &&
      input.reviewStatus !== "REJECTED"
    ) {
      return {
        success: false,
        message: "Review status must be approved or rejected",
      };
    }

    const session = await auth();
    const reviewer = session?.user?.email
      ? await prisma.user.findFirst({
          where: { email: session.user.email },
          select: { id: true },
        })
      : null;

    const existing = await prisma.employeeDocument.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        message: "Employee document not found",
      };
    }

    const updated = await prisma.employeeDocument.update({
      where: { id },
      data: {
        reviewStatus: input.reviewStatus,
        reviewRemark: input.reviewRemark?.trim() || null,
        reviewedById: reviewer?.id ?? null,
        reviewedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            employeeName: true,
          },
        },
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    revalidatePath("/employee-documents");
    revalidatePath("/employee-dashboard");

    return {
      success: true,
      message:
        updated.reviewStatus === "APPROVED"
          ? "Document approved"
          : "Document rejected",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteEmployeeDocument(
  id: string,
): Promise<ActionResponse> {
  try {
    const access = await getCurrentEmployeeAccess();

    if (access.isEmployee) {
      return {
        success: false,
        message: "Employees cannot delete documents",
      };
    }

    await prisma.employeeDocument.delete({
      where: { id },
    });

    revalidatePath("/employee-documents");

    return {
      success: true,
      message: "Employee document deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
