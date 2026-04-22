import { Status } from "@/app/generated/prisma/client";
import { z } from "zod";

/* ---------------- AUTH ---------------- */
export const loginFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
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
