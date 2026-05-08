import { Button } from "@/components/ui/button";
import { getEmployeeProfiles } from "@/lib/actions/employee-profiles";
import { isCurrentEmployeeHr } from "@/lib/employee-job-role";
import { getRoutePermissions } from "@/lib/rbac";
import Link from "next/link";
import { redirect } from "next/navigation";
import EmployeeProfileDataTable from "./employee-profile-data-table";

const EmployeeProfilePage = async () => {
  const route = "/employee-profiles";
  const [routePermissions, isHrEmployee] = await Promise.all([
    getRoutePermissions(route),
    isCurrentEmployeeHr(),
  ]);
  const permissions = isHrEmployee
    ? {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
      }
    : routePermissions;

  if (!permissions.canView) {
    redirect("/404");
  }

  const records = await getEmployeeProfiles();

  return (
    <EmployeeProfileDataTable
      data={records}
      canEdit={permissions.canEdit}
      canDelete={permissions.canDelete}
      title="Employee Profiles"
      actions={
        permissions.canCreate && (
          <Button asChild className="bg-blue-500 hover:bg-blue-600">
            <Link href="/employee-profiles/create">Add Employee Profile</Link>
          </Button>
        )
      }
    />
  );
};

export default EmployeeProfilePage;
