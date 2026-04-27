import { getEmployeeProfiles } from "@/lib/actions/employee-profiles";
import { getEmployeeProfileOptions } from "@/lib/actions/employee-profiles";
import DashboardDesignContent from "./content";

export default async function DashboardDesignPage() {
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
    />
  );
}