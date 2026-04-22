import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getDepartments } from "@/lib/actions/department";
import DepartmentDataTable from "./department-datatable";

export default async function DepartmentPage() {
  const departments = await getDepartments();

  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  return (
    <DepartmentDataTable
      data={departments}
      canEdit={canEdit}
      canDelete={canDelete}
      title="Department"
      actions={
        canCreate && (
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/department/create">Add Department</Link>
          </Button>
        )
      }
    />
  );
}
