"use client";

import * as React from "react";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AttendanceMonthSheet } from "@/lib/actions/attendance";

type Option = {
  id: string;
  name?: string;
  employeeName?: string;
  employeeCode?: string;
};

type AttendanceSheetProps = {
  initialSheet: AttendanceMonthSheet;
  employees: Option[];
  departments: Option[];
  canFilterEmployees: boolean;
  showExport?: boolean;
};

const statusLabels: Record<string, string> = {
  PRESENT: "P",
  ABSENT: "A",
  LEAVE: "L",
  HALF_DAY: "HD",
  HOLIDAY: "H",
  "": "",
};

const statusClasses: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-rose-100 text-rose-700",
  LEAVE: "bg-amber-100 text-amber-700",
  HALF_DAY: "bg-sky-100 text-sky-700",
  HOLIDAY: "bg-violet-100 text-violet-700",
  "": "bg-slate-100 text-slate-400",
};

function exportCsv(sheet: AttendanceMonthSheet) {
  const dayHeaders = Array.from(
    { length: sheet.daysInMonth },
    (_, index) => `${index + 1}`,
  );
  const rows = [
    [
      "Employee Code",
      "Employee Name",
      "Department",
      ...dayHeaders,
      "Present",
      "Leaves",
      "Absents",
      "Half Days",
      "Holidays",
    ],
    ...sheet.rows.map((row) => [
      row.employeeCode,
      row.employeeName,
      row.departmentName,
      ...dayHeaders.map((day) => statusLabels[row.days[Number(day)]]),
      row.totals.present,
      row.totals.leaves,
      row.totals.absents,
      row.totals.halfDays,
      row.totals.holidays,
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `attendance-${sheet.year}-${String(sheet.month).padStart(2, "0")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AttendanceSheet({
  initialSheet,
  employees,
  departments,
  canFilterEmployees,
  showExport = false,
}: AttendanceSheetProps) {
  const [sheet, setSheet] = React.useState(initialSheet);
  const [year, setYear] = React.useState(String(initialSheet.year));
  const [month, setMonth] = React.useState(String(initialSheet.month));
  const [employeeId, setEmployeeId] = React.useState("all");
  const [departmentId, setDepartmentId] = React.useState("all");
  const [isPending, startTransition] = React.useTransition();

  const days = Array.from({ length: sheet.daysInMonth }, (_, index) => index + 1);

  const applyFilters = () => {
    startTransition(async () => {
      const params = new URLSearchParams({
        year,
        month,
      });

      if (employeeId !== "all") params.set("employeeId", employeeId);
      if (departmentId !== "all") params.set("departmentId", departmentId);

      const response = await fetch(`/api/attendance/month?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        toast.error("Attendance", { description: result.message });
        return;
      }

      setSheet(result.data);
    });
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl">Monthly Attendance Sheet</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="h-9 w-24 rounded-lg border border-slate-200 px-3 text-sm"
              type="number"
              min="2020"
            />
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(2026, index, 1).toLocaleString("en-IN", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            {canFilterEmployees && (
              <>
                <select
                  value={departmentId}
                  onChange={(event) => setDepartmentId(event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="all">All departments</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                <select
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="all">All employees</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.employeeName} ({employee.employeeCode})
                    </option>
                  ))}
                </select>
              </>
            )}
            <Button onClick={applyFilters} disabled={isPending} variant="outline">
              <Filter />
              Apply
            </Button>
            {showExport && (
              <Button onClick={() => exportCsv(sheet)} className="bg-blue-600 hover:bg-blue-700">
                <Download />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-[1100px] w-full border-collapse text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="sticky left-0 z-10 bg-slate-900 px-3 py-3 text-left">
                  Employee
                </th>
                {days.map((day) => (
                  <th key={day} className="px-2 py-3 text-center">
                    {day}
                  </th>
                ))}
                <th className="px-3 py-3 text-center">P</th>
                <th className="px-3 py-3 text-center">L</th>
                <th className="px-3 py-3 text-center">A</th>
              </tr>
            </thead>
            <tbody>
              {sheet.rows.map((row) => (
                <tr key={row.employeeId} className="border-t border-slate-100">
                  <td className="sticky left-0 z-10 bg-white px-3 py-3">
                    <div className="font-medium text-slate-900">
                      {row.employeeName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {row.employeeCode} · {row.departmentName}
                    </div>
                  </td>
                  {days.map((day) => {
                    const status = row.days[day];
                    return (
                      <td key={day} className="px-2 py-2 text-center">
                        <Badge className={statusClasses[status]}>
                          {statusLabels[status] || "-"}
                        </Badge>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center font-semibold">
                    {row.totals.present}
                  </td>
                  <td className="px-3 py-3 text-center font-semibold">
                    {row.totals.leaves}
                  </td>
                  <td className="px-3 py-3 text-center font-semibold">
                    {row.totals.absents}
                  </td>
                </tr>
              ))}
              {!sheet.rows.length && (
                <tr>
                  <td
                    colSpan={sheet.daysInMonth + 4}
                    className="px-3 py-10 text-center text-slate-500"
                  >
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
