import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, Eye, Trash } from "lucide-react";
import Link from "next/link";

type ProjectMemberColumnOptions = {
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
};

export type ProjectMemberRow = {
  id: string;
  projectId: string;
  projectName: string;
  employees: Array<{
    id: string;
    name: string;
    code?: string | null;
  }>;
  assignedAt?: Date | string | null;
};

export const getProjectMemberColumns = ({
  canEdit,
  canDelete,
  onDelete,
}: ProjectMemberColumnOptions): ColumnDef<ProjectMemberRow>[] => {
  const columns: ColumnDef<ProjectMemberRow>[] = [
    {
      accessorKey: "projectName",
      header: "Project",
    },
    {
      id: "memberCount",
      header: "Total Employees",
      cell: ({ row }) => row.original.employees.length,
    },
    {
      accessorKey: "assignedAt",
      header: "First Assigned",
      cell: ({ row }) =>
        row.original.assignedAt
          ? new Date(row.original.assignedAt).toLocaleDateString()
          : "-",
    },
    {
      id: "employees",
      header: "Involved Employees",
      cell: ({ row }) => {
        const employees = row.original.employees;

        if (!employees.length) {
          return "-";
        }

        return (
          <Button asChild size="sm" variant="outline" className="rounded-xl">
            <Link href={`/project-members/${row.original.projectId}`}>
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
        );
      },
    },
  ];

  if (canEdit || canDelete) {
    columns.push({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const editId = row.original.id;
        const projectId = row.original.projectId;

        return (
          <div className="flex gap-2">
            {canEdit && (
              <Button
                asChild
                size="icon"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Link href={`/project-members/edit/${editId}`}>
                  <EditIcon size={16} />
                </Link>
              </Button>
            )}

            {canDelete && (
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onDelete(projectId)}
              >
                <Trash size={16} />
              </Button>
            )}
          </div>
        );
      },
    });
  }

  return columns;
};
