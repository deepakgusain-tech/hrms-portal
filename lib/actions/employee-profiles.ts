"use server";

import { Status } from "@prisma/client";
import { EmployeeProfile } from "@/types";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { formatError } from "../utils";
import { employeeProfileSchema } from "../validators";
import { getProjectById } from "./projects";

type ActionResponse = {
  success: boolean;
  message: string;
};

const EXISTING_PASSWORD_SENTINEL = "__KEEP__";

function toDate(value?: string | null) {
  return value ? new Date(value) : null;
}

function getNextEmployeeCode(codes: string[]) {
  const nextNumber =
    codes.reduce((max, code) => {
      const match = /^emp-(\d+)$/i.exec(code);
      const number = match ? Number(match[1]) : 0;
      return Number.isFinite(number) ? Math.max(max, number) : max;
    }, 0) + 1;

  return `emp-${String(nextNumber).padStart(3, "0")}`;
}

async function generateEmployeeCode() {
  const profiles = await prisma.employeeProfile.findMany({
    where: {
      employeeCode: {
        startsWith: "emp-",
        mode: "insensitive",
      },
    },
    select: {
      employeeCode: true,
    },
  });

  return getNextEmployeeCode(
    profiles.map((profile) => profile.employeeCode),
  );
}

export async function getNextEmployeeCodePreview() {
  try {
    return await generateEmployeeCode();
  } catch {
    return "emp-001";
  }
}

function mapEmployeeProfile(record: {
  id: string;
  employeeId: string | null;
  employeeName: string;
  employeeCode: string;
  email: string;
  companyId: string | null;
  phone: string;
  alternatePhone: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  joiningDate: Date;
  departmentId: string | null;
  jobRoleId: string | null;
  workLocationId: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  remark: string | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  employee?: { firstName: string; lastName: string } | null;
  company?: { companyName: string } | null;
  department?: { name: string } | null;
  jobRole?: { name: string } | null;
  workLocation?: { name: string } | null;
}): EmployeeProfile {
  return {
    id: record.id,
    employeeId: record.employeeId ?? "",
    email: record.email ?? "",
    employeeName:
      record.employeeName ||
      (record.employee
        ? `${record.employee.firstName} ${record.employee.lastName}`.trim()
        : ""),
    employeeCode: record.employeeCode,
    companyId: record.companyId ?? "",
    phone: record.phone,
    alternatePhone: record.alternatePhone ?? "",
    gender: record.gender ?? "",
    dateOfBirth: record.dateOfBirth?.toISOString().split("T")[0] ?? "",
    joiningDate: record.joiningDate.toISOString().split("T")[0],
    departmentId: record.departmentId ?? "",
    jobRoleId: record.jobRoleId ?? "",
    workLocationId: record.workLocationId ?? "",
    password: "",
    address: record.address ?? "",
    emergencyContactName: record.emergencyContactName ?? "",
    emergencyContactPhone: record.emergencyContactPhone ?? "",
    remark: record.remark ?? "",
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    companyName: record.company?.companyName ?? "",
    departmentName: record.department?.name ?? "",
    jobRoleName: record.jobRole?.name ?? "",
    workLocationName: record.workLocation?.name ?? "",
  };
}

const employeeProfileInclude = {
  employee: {
    select: {
      firstName: true,
      lastName: true,
    },
  },
  company: {
    select: {
      companyName: true,
    },
  },
  department: {
    select: {
      name: true,
    },
  },
  jobRole: {
    select: {
      name: true,
    },
  },
  workLocation: {
    select: {
      name: true,
    },
  },
};

export async function getEmployeeProfileOptions() {
  try {
    const [employees, companies, departments, jobRoles, workLocations, projects] =
      await Promise.all([
        prisma.user.findMany({
          orderBy: { firstName: "asc" },
          select: { id: true, firstName: true, lastName: true },
        }),
        prisma.company.findMany({
          orderBy: { companyName: "asc" },
          select: { id: true, companyName: true },
        }),
        prisma.department.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
        prisma.jobRole.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
        prisma.workLocation.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
        prisma.project.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
      ]);

    return {
      employees,
      companies,
      departments,
      jobRoles,
      workLocations,
      projects
    };
  } catch {
    return {
      employees: [],
      companies: [],
      departments: [],
      jobRoles: [],
      workLocations: [],
      projects: []
    };
  }
}

export async function getEmployeeProfileSelectOptions() {
  try {
    return await prisma.employeeProfile.findMany({
      orderBy: [{ employeeName: "asc" }, { employeeCode: "asc" }],
      select: {
        id: true,
        employeeId: true,
        employeeName: true,
        employeeCode: true,
        status: true,
      },
    });
  } catch {
    return [];
  }
}

export interface EmployeeFilters {
  employeeId?: string;
  employeeName?: string;
  email?: string;
  phone?: string;
  companyId?: string;
  departmentId?: string;
  jobRoleId?: string;
  workLocationId?: string;
  status?: string;
  joiningDateFrom?: string;
  joiningDateTo?: string;
  project?: string;
}

export async function getEmployeeProfiles(): Promise<EmployeeProfile[]> {
  try {
    const records = await prisma.employeeProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: employeeProfileInclude,
    });

    return records.map(mapEmployeeProfile);
  } catch {
    return [];
  }
}

export async function getFilteredEmployeeProfiles(
  filters: EmployeeFilters = {},
): Promise<EmployeeProfile[]> {
  try {
    const where: any = {};

    if (filters.employeeId) {
      where.employeeCode = {
        contains: filters.employeeId,
        mode: "insensitive",
      };
    }

    if (filters.project) {
      const project = await prisma.project.findFirst({
        where: {
          name: {
            equals: filters.project,
            mode: "insensitive",
          },
        },
      });

      if (project) {
        where.projectMembers = {
          some: {
            projectId: project.id,
          },
        };
      }
    }

    if (filters.employeeName) {
      where.employeeName = {
        contains: filters.employeeName,
        mode: "insensitive",
      };
    }

    if (filters.email) {
      where.employee = {
        email: {
          contains: filters.email,
          mode: "insensitive",
        },
      };
    }

    if (filters.phone) {
      where.phone = {
        contains: filters.phone,
        mode: "insensitive",
      };
    }

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters.jobRoleId) {
      where.jobRoleId = filters.jobRoleId;
    }

    if (filters.workLocationId) {
      where.workLocationId = filters.workLocationId;
    }

    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters.joiningDateFrom || filters.joiningDateTo) {
      where.joiningDate = {};

      if (filters.joiningDateFrom) {
        where.joiningDate.gte = new Date(filters.joiningDateFrom);
      }
      if (filters.joiningDateTo) {
        where.joiningDate.lte = new Date(filters.joiningDateTo);
      }
    }

    const records = await prisma.employeeProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        ...employeeProfileInclude,
        projectMembers: true,
      }
    });

    console.log(records);


    return records.map(mapEmployeeProfile);
  } catch (error) {
    console.error("Error fetching filtered employee profiles:", error);
    return [];
  }
}

export async function createEmployeeProfile(
  data: EmployeeProfile,
): Promise<ActionResponse> {
  try {
    const record = employeeProfileSchema.parse(data);
    const employeeCode = await generateEmployeeCode();

    const hashedPassword =
      record.employeeId &&
        record.password &&
        record.password !== EXISTING_PASSWORD_SENTINEL
        ? await bcrypt.hash(record.password, 10)
        : null;

    await prisma.$transaction(async (tx) => {
      await tx.employeeProfile.create({
        data: {
          employeeName: record.employeeName.trim(),
          employeeCode,
          email: record.email,
          employeeId: record.employeeId || null,
          companyId: record.companyId || null,
          departmentId: record.departmentId || null,
          jobRoleId: record.jobRoleId || null,
          workLocationId: record.workLocationId || null,

          phone: record.phone,
          alternatePhone: record.alternatePhone || null,
          gender: record.gender || null,
          dateOfBirth: toDate(record.dateOfBirth),
          joiningDate: new Date(record.joiningDate),

          address: record.address || null,
          emergencyContactName: record.emergencyContactName || null,
          emergencyContactPhone: record.emergencyContactPhone || null,
          remark: record.remark || null,
          status: record.status,
        },
      });

      if (record.employeeId && hashedPassword) {
        await tx.user.update({
          where: { id: record.employeeId },
          data: { password: hashedPassword },
        });
      }
    });

    revalidatePath("/employee-profiles");

    return {
      success: true,
      message: "Employee profile created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getEmployeeProfileById(id: string) {
  try {
    const record = await prisma.employeeProfile.findUnique({
      where: { id },
      include: employeeProfileInclude,
    });

    if (!record) {
      return {
        success: false,
        message: "Employee profile not found",
      };
    }

    return {
      success: true,
      data: mapEmployeeProfile(record),
      message: "Employee profile fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateEmployeeProfile(
  data: EmployeeProfile,
  id: string,
): Promise<ActionResponse> {
  try {
    const record = employeeProfileSchema.parse(data);

    const hashedPassword =
      record.employeeId &&
        record.password &&
        record.password !== EXISTING_PASSWORD_SENTINEL
        ? await bcrypt.hash(record.password, 10)
        : null;

    const existingRecord = await prisma.employeeProfile.findUnique({
      where: { id },
      select: { employeeCode: true },
    });

    if (!existingRecord) {
      return {
        success: false,
        message: "Employee profile not found",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.employeeProfile.update({
        where: { id },
        data: {
          employeeName: record.employeeName.trim(),
          employeeCode: record.employeeCode || existingRecord.employeeCode,
          email: record.email,
          employeeId: record.employeeId || null,
          companyId: record.companyId || null,
          departmentId: record.departmentId || null,
          jobRoleId: record.jobRoleId || null,
          workLocationId: record.workLocationId || null,

          phone: record.phone,
          alternatePhone: record.alternatePhone || null,
          gender: record.gender || null,
          dateOfBirth: toDate(record.dateOfBirth),
          joiningDate: new Date(record.joiningDate),

          address: record.address || null,
          emergencyContactName: record.emergencyContactName || null,
          emergencyContactPhone: record.emergencyContactPhone || null,
          remark: record.remark || null,
          status: record.status,
        },
      });

      if (record.employeeId && hashedPassword) {
        await tx.user.update({
          where: { id: record.employeeId },
          data: { password: hashedPassword },
        });
      }
    });

    revalidatePath("/employee-profiles");
    revalidatePath(`/employee-profiles/edit/${id}`);

    return {
      success: true,
      message: "Employee profile updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteEmployeeProfile(
  id: string,
): Promise<ActionResponse> {
  try {
    await prisma.employeeProfile.delete({
      where: { id },
    });

    revalidatePath("/employee-profiles");

    return {
      success: true,
      message: "Employee profile deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}