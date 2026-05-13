"use client";

import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/datatable/DataTable";
import { deleteJobRole } from "@/lib/actions/job-role";
import { JobRole } from "@/types";
import { getJobRoleColumns } from "./column";

type JobRoleDataTableProps = {
  data: JobRole[];
  canEdit: boolean;
  canDelete: boolean;
  title: string;
  actions?: React.ReactNode;
};

export default function JobRoleDataTable({
  data,
  canEdit,
  canDelete,
  title,
  actions,
}: JobRoleDataTableProps) {
  const [tableData, setTableData] = React.useState<JobRole[]>(data);

  const deleteHandler = async (id: string) => {
    const res = await deleteJobRole(id);

    if (!res?.success) {
      toast.error("Error", { description: res?.message });
      return;
    }

    toast.success("Success", { description: res?.message });
    setTableData((prev) => prev.filter((jobRole) => jobRole.id !== id));
  };

  const columns = getJobRoleColumns({
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
