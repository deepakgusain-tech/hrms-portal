import { Status } from "@/app/generated/prisma/client";

export const APP_NAME =
  process.env.NEXT_APP_APP_NAME ?? "HRMS";

export const APP_DESCRIPTION =
  process.env.NEXT_APP_DESCRIPTION ??
  "HRMS";

export const SERVER_URL =
  process.env.NEXT_APP_SERVER_URL ?? "http://localhost:3000";

/* ---------------- COMMON ---------------- */
export const formatDate = (date?: Date | null) =>
  date ? date.toISOString().split("T")[0] : "";

/* ---------------- ROLE ---------------- */
export const roleDefaultValues = {
  name: "",
  remark: "",
  status: Status.ACTIVE,
};

/* ---------------- USER ---------------- */
export const userDefaultValues = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  status: Status.ACTIVE,
  remark: "",
  roleId: "",
};

/* ---------------- MODULE ---------------- */
export const moduleDefaultValues = {
  name: "",
  description: "",
  route: "",
  status: Status.ACTIVE,
};

/* ---------------- JOB ROLE ---------------- */
export const jobRoleDefaultValues = {
  name: "",
  code: "",
  description: "",
  remark: "",
  status: Status.ACTIVE,
};

/* ---------------- DEPARTMENT ---------------- */
export const departmentDefaultValues = {
  name: "",
  code: "",
  description: "",
  remark: "",
  status: Status.ACTIVE,
};

/* ---------------- WORK LOCATION ---------------- */
export const workLocationDefaultValues = {
  name: "",
  code: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  remark: "",
  status: Status.ACTIVE,
};
