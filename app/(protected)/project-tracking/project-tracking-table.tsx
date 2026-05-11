"use client";

import { DataTable } from "@/components/datatable/DataTable";
import type { ProjectTrackingRow } from "@/lib/actions/project-tracking";
import { projectTrackingColumns } from "./columns";

export default function ProjectTrackingTable({
  data,
  actions,
}: {
  data: ProjectTrackingRow[];
  actions?: React.ReactNode;
}) {
  return (
    <DataTable
      title="Project Tracking"
      data={data}
      columns={projectTrackingColumns}
      actions={actions}
    />
  );
}
