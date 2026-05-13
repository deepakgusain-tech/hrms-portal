import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeProfile } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, Eye, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "-";

export const getEmployeeProfileColumns = ({
  canEdit,
  canDelete,
  onDelete,
}: {
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
}): ColumnDef<EmployeeProfile>[] => {
  const columns: ColumnDef<EmployeeProfile>[] = [
    {
      id: "employee",
      accessorFn: (row) => `${row.employeeName} ${row.employeeCode}`,
      header: "Employee",
      cell: ({ row }) => (
        <div className="">
          <p className="font-semibold text-slate-900">{row.original.employeeName}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {row.original.employeeCode}
          </p>
        </div>
      ),
    },
    {
      id: "contact",
      accessorFn: (row) => `${row.phone} ${row.email ?? ""}`,
      header: "Contact",
      cell: ({ row }) => (
        <div className="">
          <p className="font-medium text-slate-800">{row.original.phone || "-"}</p>
          <p className="text-xs text-slate-500">{row.original.email || "No email"}</p>
        </div>
      ),
    },
    {
      id: "organization",
      accessorFn: (row) =>
        `${row.departmentName ?? ""} ${row.jobRoleName ?? ""}`,
      header: "Organization",
      cell: ({ row }) => (
        <div className="">
          <p className="font-medium text-slate-800">
            {row.original.departmentName || "-"}
          </p>
          <p className="text-xs text-slate-500">
            {row.original.jobRoleName || "No job role"}
          </p>
        </div>
      ),
    },
    {
      id: "workplace",
      accessorFn: (row) =>
        `${row.companyName ?? ""} ${row.workLocationName ?? ""}`,
      header: "Company / Location",
      cell: ({ row }) => (
        <div className="">
          <p className="font-medium text-slate-800">
            {row.original.companyName || "-"}
          </p>
          <p className="text-xs text-slate-500">
            {row.original.workLocationName || "No work location"}
          </p>
        </div>
      ),
    },
    {
      id: "reporting",
      accessorFn: (row) =>
        `${row.managerName ?? ""} ${row.joiningDate ?? ""}`,
      header: "Manager / Joining",
      cell: ({ row }) => (
        <div className="">
          <p className="font-medium text-slate-800">
            {row.original.managerName || "-"}
          </p>
          <p className="text-xs text-slate-500">
            Joined {formatDate(row.original.joiningDate)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.status === "ACTIVE" ? (
          <Badge className="bg-green-500">ACTIVE</Badge>
        ) : (
          <Badge variant="destructive">INACTIVE</Badge>
        ),
    },
  ];

  columns.push({
    id: "actions",
    header: "Action",
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id as string;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              aria-label="Open employee profile actions"
            >
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem className="p-0">
              <Link
                href={`/employee-dashboard?employeeId=${id}`}
                aria-label="View employee dashboard"
                className="flex w-full items-center gap-2 px-2 py-1.5"
              >
                <Eye size={16} />
                <span>View</span>
              </Link>
            </DropdownMenuItem>

            {canEdit && (
              <DropdownMenuItem className="p-0">
                <Link
                  href={`/employee-profiles/edit/${id}`}
                  aria-label="Edit employee profile"
                  className="flex w-full items-center gap-2 px-2 py-1.5"
                >
                  <EditIcon size={16} />
                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
            )}

            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(id)}
                >
                  <Trash size={16} />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  });

  return columns;
};
