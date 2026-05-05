import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployeeProfile } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, Trash } from "lucide-react";
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

  if (canEdit || canDelete) {
    columns.push({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.id as string;

        return (
          <div className="flex gap-2">
            {canEdit && (
              <Button
                asChild
                size="icon"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Link href={`/employee-profiles/edit/${id}`}>
                  <EditIcon size={16} />
                </Link>
              </Button>
            )}

            {canDelete && (
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onDelete(id)}
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
