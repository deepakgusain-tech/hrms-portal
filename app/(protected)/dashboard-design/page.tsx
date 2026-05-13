import { getEmployeeProfiles } from "@/lib/actions/employee-profiles";
import { getEmployeeProfileOptions } from "@/lib/actions/employee-profiles";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardDesignContent from "./content";

export default async function DashboardDesignPage() {
  const session = await auth();

  if (session?.user?.role?.toLowerCase() === "employee") {
    redirect("/404");
  }

  const [employees, options] = await Promise.all([
    getEmployeeProfiles(),
    getEmployeeProfileOptions(),

  ]);

  return (
    <DashboardDesignContent
      initialEmployees={employees}
      companies={options.companies}
      departments={options.departments}
      jobRoles={options.jobRoles}
      workLocations={options.workLocations}
      projects={options.projects}
    />
  );
}
