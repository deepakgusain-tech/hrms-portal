"use client";

import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/datatable/DataTable";
import { getProjectColumns, ProjectRow } from "./column";
import { deleteProject } from "@/lib/actions/projects";

type ProjectDataTableProps = {
  data: ProjectRow[];
  canEdit: boolean;
  canDelete: boolean;
  title: string;
  actions?: React.ReactNode;
};

export default function ProjectDataTable({
  data,
  canEdit,
  canDelete,
  title,
  actions,
}: ProjectDataTableProps) {
  const [tableData, setTableData] = React.useState<ProjectRow[]>(data);

  const deleteHandler = async (id: string) => {
    const res = await deleteProject(id);

    if (!res?.success) {
      toast.error("Error", { description: res?.message });
      return;
    }

    toast.success("Success", { description: res?.message });

    setTableData((prev) => prev.filter((project) => project.id !== id));
  };

  const columns = getProjectColumns({
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
