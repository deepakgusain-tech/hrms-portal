"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { EmployeeProfile } from "@/types";
import { DataTable } from "@/components/datatable/DataTable";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface EmployeeListProps {
  employees: EmployeeProfile[];
  isLoading?: boolean;
}

const getStatusBadge = (status?: string) => {
  const normalized = status?.toUpperCase();

  const statusMap: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-red-100 text-red-800",
    "ON LEAVE": "bg-yellow-100 text-yellow-800",
    RESIGNED: "bg-gray-100 text-gray-800",
  };

  return statusMap[normalized ?? ""] ?? "bg-blue-100 text-blue-800";
};

const columns: ColumnDef<EmployeeProfile>[] = [
  {
    accessorKey: "employeeName",
    header: "Employee",
  },
  {
    accessorKey: "employeeCode",
    header: "Employee ID",
    cell: ({ getValue }) => {
      const employeeCode = String(getValue() || "");

      return (
        <Link
          href={`/employee-profiles/${employeeCode}`}
          className="hover:underline hover:decoration-blue-500"
        >
          {employeeCode}
        </Link>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ getValue }) => String(getValue() || "-"),
  },
  {
    accessorKey: "departmentName",
    header: "Department",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "jobRoleName",
    header: "Job Role",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "companyName",
    header: "Company Name",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "managerName",
    header: "Manager",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "workLocationName",
    header: "Work Location",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "joiningDate",
    header: "Joining Date",
    cell: ({ getValue }) => {
      const value = getValue();

      return value ? new Date(String(value)).toLocaleDateString("en-GB") : "-";
    },
  },
  {
    accessorKey: "projectNames",
    header: "Projects",
    cell: ({ row }) => {
      const projectNames = row.original.projectNames ?? [];

      if (!projectNames.length) {
        return "-";
      }

      return (
        <div className="flex max-w-64 flex-wrap gap-1">
          {projectNames.map((projectName) => (
            <Badge
              key={projectName}
              variant="secondary"
              className="bg-sky-50 text-sky-700"
            >
              {projectName}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = String(getValue() || "");

      return (
        <Badge className={getStatusBadge(status)}>
          {status}
        </Badge>
      );
    },
  },
];

export default function EmployeeList({
  employees,
  isLoading = false,
}: EmployeeListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No employees found.</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Employee"
      columns={columns}
      data={employees}
      rowClassName={() => "hover:bg-slate-50 p-10 "}
    />
  );
}
