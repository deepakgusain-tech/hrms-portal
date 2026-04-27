"use client";

import { EmployeeProfile } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface EmployeeListProps {
  employees: EmployeeProfile[];
  isLoading?: boolean;
}

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
        <p className="text-gray-500">No employees found. Try adjusting your filters.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "ON LEAVE":
        return "bg-yellow-100 text-yellow-800";
      case "RESIGNED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b">
              <TableHead className="font-semibold text-gray-700">Employee ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Email</TableHead>
              <TableHead className="font-semibold text-gray-700">Phone</TableHead>
              <TableHead className="font-semibold text-gray-700">Department</TableHead>
              <TableHead className="font-semibold text-gray-700">Job Role</TableHead>
              <TableHead className="font-semibold text-gray-700">Location</TableHead>
              <TableHead className="font-semibold text-gray-700">Company</TableHead>
              <TableHead className="font-semibold text-gray-700">Joining Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} className="border-b hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">
                  {employee.employeeCode}
                </TableCell>
                <TableCell className="text-gray-700">{employee.employeeName}</TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {employee.email || "-"}
                </TableCell>
                <TableCell className="text-gray-600">{employee.phone}</TableCell>
                <TableCell className="text-gray-700">
                  {employee.departmentName || "-"}
                </TableCell>
                <TableCell className="text-gray-700">
                  {employee.jobRoleName || "-"}
                </TableCell>
                <TableCell className="text-gray-700">
                  {employee.workLocationName || "-"}
                </TableCell>
                <TableCell className="text-gray-700">
                  {employee.companyName || "-"}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {formatDate(employee.joiningDate)}
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bg-gray-50 px-6 py-4 border-t">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{employees.length}</span> employee
          {employees.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
