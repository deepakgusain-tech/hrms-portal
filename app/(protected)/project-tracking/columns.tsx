"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectTrackingRow } from "@/lib/actions/project-tracking";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

function formatDate(date?: Date | string | null) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

function renderPeople(
  people: Array<{ id: string; name: string; code?: string; count?: number }>,
  emptyText = "-",
) {
  if (!people.length) {
    return emptyText;
  }

  return (
    <div className="flex max-w-md flex-wrap gap-1.5">
      {people.slice(0, 3).map((person) => (
        <Badge
          key={person.id}
          variant="secondary"
          className="bg-cyan-50 text-cyan-700"
        >
          {person.name}
          {person.code ? ` (${person.code})` : ""}
          {person.count ? ` - ${person.count}` : ""}
        </Badge>
      ))}
      {people.length > 3 && (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
          +{people.length - 3} more
        </Badge>
      )}
    </div>
  );
}

function getProjectStatusClass(status: string) {
  if (status === "COMPLETED") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "ACTIVE") {
    return "bg-sky-100 text-sky-700";
  }

  if (status === "ON_HOLD") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "CANCELLED") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

export const projectTrackingColumns: ColumnDef<ProjectTrackingRow>[] = [
  {
    accessorKey: "name",
    header: "Project",
    cell: ({ row }) => (
      <div className="min-w-48">
        <p className="font-semibold text-slate-900">{row.original.name}</p>
        <p className="mt-1 text-xs text-slate-500">
          {row.original.members.length} member(s)
        </p>
      </div>
    ),
  },
  {
    accessorKey: "members",
    header: "Involved Employees",
    cell: ({ row }) => renderPeople(row.original.members),
  },
  {
    accessorKey: "totalTasks",
    header: "Tasks",
    cell: ({ row }) => (
      <div className="font-semibold text-slate-900">
        {row.original.totalTasks}
      </div>
    ),
  },
  {
    id: "taskBreakdown",
    header: "Task Status",
    cell: ({ row }) => {
      const counts = row.original.taskCounts;

      return (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Todo {counts.TODO}
          </Badge>
          <Badge variant="secondary" className="bg-sky-50 text-sky-700">
            Progress {counts.IN_PROGRESS}
          </Badge>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            Done {counts.DONE}
          </Badge>
          <Badge variant="secondary" className="bg-rose-50 text-rose-700">
            Blocked {counts.BLOCKED}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "taskOwners",
    header: "Task Owners",
    cell: ({ row }) => renderPeople(row.original.taskOwners, "No assigned tasks"),
  },
  {
    accessorKey: "completionPercent",
    header: "Completion",
    cell: ({ row }) => (
      <div className="w-32 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">
            {row.original.completionPercent}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-cyan-600"
            style={{ width: `${row.original.completionPercent}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    accessorKey: "nextDueDate",
    header: "Next Due",
    cell: ({ row }) => formatDate(row.original.nextDueDate),
  },
  {
    accessorKey: "status",
    header: "Project Status",
    cell: ({ row }) => (
      <Badge className={getProjectStatusClass(row.original.status)}>
        {row.original.status.replaceAll("_", " ")}
      </Badge>
    ),
  },
  {
    id: "workspace",
    header: "Workspace",
    enableHiding: false,
    cell: ({ row }) => (
      <Button asChild size="sm" className="rounded-xl bg-cyan-600 hover:bg-cyan-700">
        <Link href={`/project-tracking/${row.original.id}`}>
          Open
          <ArrowUpRight className="ml-2 size-4" />
        </Link>
      </Button>
    ),
  },
];
