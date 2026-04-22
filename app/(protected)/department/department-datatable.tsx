"use client";

import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/datatable/DataTable";
import { deleteDepartment } from "@/lib/actions/department";
import { Department } from "@/types";
import { getDepartmentColumns } from "./column";

type DepartmentDataTableProps = {
  data: Department[];
  canEdit: boolean;
  canDelete: boolean;
  title: string;
  actions?: React.ReactNode;
};

export default function DepartmentDataTable({
  data,
  canEdit,
  canDelete,
  title,
  actions,
}: DepartmentDataTableProps) {
  const [tableData, setTableData] = React.useState<Department[]>(data);

  const deleteHandler = async (id: string) => {
    const res = await deleteDepartment(id);

    if (!res?.success) {
      toast.error("Error", { description: res?.message });
      return;
    }

    toast.success("Success", { description: res?.message });

    setTableData((prev) => prev.filter((department) => department.id !== id));
  };

  const columns = getDepartmentColumns({
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
    />
  );
}
