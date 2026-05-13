"use client";

import { DataTable } from "@/components/datatable/DataTable";
import { deleteEmployeeProfile } from "@/lib/actions/employee-profiles";
import { EmployeeProfile } from "@/types";
import * as React from "react";
import { toast } from "sonner";
import { getEmployeeProfileColumns } from "./column";

export default function EmployeeProfileDataTable({
  data,
  canEdit,
  canDelete,
  title,
  actions,
}: {
  data: EmployeeProfile[];
  canEdit: boolean;
  canDelete: boolean;
  title: string;
  actions?: React.ReactNode;
}) {
  const [tableData, setTableData] = React.useState<EmployeeProfile[]>(data);

  const deleteHandler = async (id: string) => {
    const res = await deleteEmployeeProfile(id);

    if (!res?.success) {
      toast.error("Error", { description: res?.message });
      return;
    }

    toast.success("Success", { description: res?.message });
    setTableData((prev) => prev.filter((record) => record.id !== id));
  };

  const columns = getEmployeeProfileColumns({
    canEdit,
    canDelete,
    onDelete: deleteHandler,
  });

  return (
    <DataTable
      data={tableData}
      columns={columns}
      title={title}
      actions={actions}
      rowHref={(row) => `/employee-dashboard?employeeId=${row.id}`}
      tableClassName="min-w-[920px]"
      headCellClassName="whitespace-normal align-top leading-5"
      bodyCellClassName="whitespace-normal break-words align-top leading-5"
    />
  );
}
