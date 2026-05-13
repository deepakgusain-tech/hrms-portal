import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployeeProfile } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, Eye, Trash } from "lucide-react";
import Link from "next/link";

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
      accessorKey: "employeeName",
      header: "Employee",
    },
    {
      accessorKey: "employeeCode",
      header: "Employee ID",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "departmentName",
      header: "Department",
      cell: ({ row }) => row.original.departmentName || "-",
    },
    {
      accessorKey: "jobRoleName",
      header: "Job Role",
      cell: ({ row }) => row.original.jobRoleName || "-",
    },
    {
      accessorKey: "companyName",
      header: "Company Name",
      cell: ({ row }) => row.original.companyName || "-",
    },
    {
      accessorKey: "managerName",
      header: "Manager",
      cell: ({ row }) => row.original.managerName || "-",
    },
    {
      accessorKey: "workLocationName",
      header: "Work Location",
      cell: ({ row }) => row.original.workLocationName || "-",
    },
    {
      accessorKey: "joiningDate",
      header: "Joining Date",
      cell: ({ row }) =>
        row.original.joiningDate
          ? new Date(row.original.joiningDate).toLocaleDateString("en-GB")
          : "-",
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
        <div className="flex gap-2">
          <Button asChild size="icon" className="bg-cyan-600 hover:bg-cyan-700">
            <Link href={`/employee-dashboard?employeeId=${id}`} aria-label="View employee dashboard">
              <Eye size={16} />
            </Link>
          </Button>

          {canEdit && (
            <Button
              asChild
              size="icon"
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Link href={`/employee-profiles/edit/${id}`} aria-label="Edit employee profile">
                <EditIcon size={16} />
              </Link>
            </Button>
          )}

          {canDelete && (
            <Button
              size="icon"
              variant="destructive"
              onClick={() => onDelete(id)}
              aria-label="Delete employee profile"
            >
              <Trash size={16} />
            </Button>
          )}
        </div>
      );
    },
  });

  return columns;
};
