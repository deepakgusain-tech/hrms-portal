import {
  ExperienceType,
  MovementType,
  Status,
} from "@/app/generated/prisma/client";
import { z } from "zod";

/* ---------------- AUTH ---------------- */
export const loginFormSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(6, "Password should be at least 6 characters long"),
});

/* ---------------- ROLE ---------------- */
export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Role name is required"),
  remark: z.string().nullable().optional(),
  status: z.nativeEnum(Status),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

/* ---------------- Module ---------------- */
export const moduleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  route: z.string().optional(),
  status: z.nativeEnum(Status),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

/* ---------------- JOB ROLE ---------------- */
export const jobRoleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  status: z.nativeEnum(Status),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

/* ---------------- DEPARTMENT ---------------- */
export const departmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  status: z.nativeEnum(Status),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

/* ---------------- WORK LOCATION ---------------- */
export const workLocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Work location name is required"),
  code: z.string().min(1, "Location code is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().optional(),
  remark: z.string().optional(),
  status: z.nativeEnum(Status),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

/* ---------------- TRANSFER & PROMOTION ---------------- */
export const transferPromotionSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Employee is required"),
  movementType: z.nativeEnum(MovementType),
  fromLocationId: z.string().optional(),
  toLocationId: z.string().optional(),
  currentDesignation: z.string().optional(),
  newDesignation: z.string().optional(),
  effectiveDate: z.string().min(1, "Effective date is required"),
  reason: z.string().min(1, "Reason is required"),
  remark: z.string().optional(),
  status: z.nativeEnum(Status),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

/* ---------------- EMPLOYEE ID & DOCS ---------------- */
export const employeeDocumentSchema = z
  .object({
    id: z.string().optional(),

    employeeId: z.string().min(1, "Employee is required"),
    employeeCode: z.string().min(1, "Employee ID is required"),

    // ---------------- DOCUMENTS ----------------
    aadhaarNumber: z.string().min(1, "Aadhaar number is required"),
    aadhaarFileUrl: z.string().optional(),

    panNumber: z.string().min(1, "PAN number is required"),
    panFileUrl: z.string().optional(),

    // ---------------- EDUCATION ----------------
    educationEntries: z
      .array(
        z.object({
          degree: z.string().optional(),
          college: z.string().optional(),
          year: z.string().optional(),
          marks: z.coerce.number().optional(),
          marksheetFileUrl: z.string().optional(),
        }),
      )
      .optional(),

    // ---------------- EXPERIENCE ----------------
    experienceType: z.nativeEnum(ExperienceType),

    experienceEntries: z
      .array(
        z.object({
          totalExperience: z.string().optional(),
          previousCompanyName: z.string().optional(),
          experienceLetterFileUrl: z.string().optional(),
          salarySlip1FileUrl: z.string().optional(),
          salarySlip2FileUrl: z.string().optional(),
          salarySlip3FileUrl: z.string().optional(),
        }),
      )
      .optional(),

    // ---------------- COMMON ----------------
    remark: z.string().optional(),
    status: z.nativeEnum(Status),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // Education validation
    data.educationEntries?.forEach((entry, index) => {
      if (!entry.degree?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Degree is required",
          path: ["educationEntries", index, "degree"],
        });
      }

      if (!entry.college?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "College is required",
          path: ["educationEntries", index, "college"],
        });
      }
    });

    // Experience validation
    if (data.experienceType !== ExperienceType.EXPERIENCED) {
      return;
    }

    if (!data.experienceEntries?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one experience card is required",
        path: ["experienceEntries"],
      });
      return;
    }

    data.experienceEntries.forEach((entry, index) => {
      if (!entry.totalExperience?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total experience is required",
          path: ["experienceEntries", index, "totalExperience"],
        });
      }

      if (!entry.previousCompanyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Previous company name is required",
          path: ["experienceEntries", index, "previousCompanyName"],
        });
      }
    });
  });

/* ---------------- EMPLOYEE PROFILE ---------------- */
export const employeeProfileSchema = z.object({
  id: z.string().optional(),
  employeeId: z.union([z.string().uuid(), z.literal("")]).optional(),
  employeeName: z.string().trim().min(1, "Employee name is required"),
  employeeCode: z.string().optional(),
  password: z.union([
    z.string().min(6, "Password should be at least 6 characters long"),
    z.literal(""),
  ]).optional(),
  companyId: z.string().min(1, "Company is required"),
  phone: z.string().min(1, "Phone is required"),
  alternatePhone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
  departmentId: z.string().optional(),
  jobRoleId: z.string().optional(),
  workLocationId: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  remark: z.string().optional(),
  status: z.nativeEnum(Status),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

/* ---------------- USER ---------------- */
export const userSchema = z.object({
  id: z.string().optional(),
  password: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  status: z.nativeEnum(Status),
  roleId: z.string().min(1, "Role is required"),
  remark: z.string().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const createUserSchema = userSchema.extend({
  password: z.string().min(1, "Password is required"),
});

/* ---------------- COMPANY ---------------- */
export const companySchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  companyCode: z.string().min(1, "Company code is required"),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  phone: z.string().min(1, "Phone is required"),
  website: z.string().optional(),
  address: z.string().optional(),
  remark: z.string().optional(),
  status: z.nativeEnum(Status),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

/* ---------------- EMPLOYER ---------------- */
export const employerSchema = z.object({
  id: z.string().optional(),
  companyId: z.string().min(1, "Company is required"),
  employerName: z.string().min(1, "Employer name is required"),
  employerCode: z.string().min(1, "Employer code is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  password: z.union([
    z.string().min(6, "Password should be at least 6 characters long"),
    z.literal(""),
  ]),
  designation: z.string().optional(),
  address: z.string().optional(),
  remark: z.string().optional(),
  status: z.nativeEnum(Status),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const createEmployerSchema = employerSchema.extend({
  password: z.string().min(6, "Password should be at least 6 characters long"),
});
