"use client";

import { DataTable } from "@/components/datatable/DataTable";
import { deleteWorkLocation } from "@/lib/actions/work-location";
import { WorkLocation } from "@/types";
import * as React from "react";
import { toast } from "sonner";
import { getWorkLocationColumns } from "./column";

export default function WorkLocationDataTable({
  data,
  canEdit,
  canDelete,
  title,
  actions,
}: {
  data: WorkLocation[];
  canEdit: boolean;
  canDelete: boolean;
  title: string;
  actions?: React.ReactNode;
}) {
  const [tableData, setTableData] = React.useState<WorkLocation[]>(data);

  const deleteHandler = async (id: string) => {
    const res = await deleteWorkLocation(id);

    if (!res?.success) {
      toast.error("Error", { description: res?.message });
      return;
    }

    toast.success("Success", { description: res?.message });

    setTableData((prev) => prev.filter((location) => location.id !== id));
  };

  const columns = getWorkLocationColumns({
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
