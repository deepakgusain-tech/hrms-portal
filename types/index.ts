import z from "zod";
import {
  companySchema,
  departmentSchema,
  employeeDocumentSchema,
  employeeProfileSchema,
  employerSchema,
  jobRoleSchema,
  moduleSchema,
  roleSchema,
  transferPromotionSchema,
  userSchema,
  workLocationSchema,
} from "@/lib/validators";

export type Role = z.infer<typeof roleSchema>;

export type Module = z.infer<typeof moduleSchema>;

export type JobRole = z.infer<typeof jobRoleSchema>;

export type Department = z.infer<typeof departmentSchema>;

export type User = z.infer<typeof userSchema>;

export type Company = z.infer<typeof companySchema>;

export type Employer = z.infer<typeof employerSchema> & {
  companyName?: string;
};

export type WorkLocation = z.infer<typeof workLocationSchema>;

export type TransferPromotion = z.infer<typeof transferPromotionSchema> & {
  employeeName?: string;
  fromLocationName?: string;
  toLocationName?: string;
};

export type EmployeeDocument = z.infer<typeof employeeDocumentSchema> & {
  employeeName?: string;
};

export type EmployeeProfile = z.infer<typeof employeeProfileSchema> & {
  companyName?: string;
  departmentName?: string;
  jobRoleName?: string;
  workLocationName?: string;
};