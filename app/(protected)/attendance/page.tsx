import Link from "next/link";
import { CalendarDays, Clock, FileSpreadsheet, LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAttendanceDashboard } from "@/lib/actions/attendance";
import { getRoutePermissions } from "@/lib/rbac";

function statusClass(status: string) {
  if (status === "PRESENT") return "bg-emerald-100 text-emerald-700";
  if (status === "ABSENT") return "bg-rose-100 text-rose-700";
  if (status === "LEAVE") return "bg-amber-100 text-amber-700";
  if (status === "HALF_DAY") return "bg-sky-100 text-sky-700";
  return "bg-violet-100 text-violet-700";
}

export default async function AttendancePage() {
  const permissions = await getRoutePermissions("/attendance");

  if (!permissions.canView) {
    redirect("/404");
  }

  const dashboard = await getAttendanceDashboard();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Attendance
          </h1>
          <p className="text-sm text-slate-500">
            Track daily attendance, monthly sheets, and payroll-ready totals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {permissions.canCreate && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/attendance/mark">
                <LogIn />
                Mark Attendance
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/attendance/sheet">
              <FileSpreadsheet />
              Monthly Sheet
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/attendance/report">
              <CalendarDays />
              Reports
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Present Days</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">
              {dashboard.summary.present}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Leaves</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {dashboard.summary.leaves}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Absents</p>
            <p className="mt-2 text-3xl font-semibold text-rose-600">
              {dashboard.summary.absents}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Half Days</p>
            <p className="mt-2 text-3xl font-semibold text-sky-600">
              {dashboard.summary.halfDays}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="size-5 text-blue-600" />
            Today Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-3 py-3">Employee</th>
                  <th className="px-3 py-3">Check In</th>
                  <th className="px-3 py-3">Check Out</th>
                  <th className="px-3 py-3">Hours</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.todayRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">
                        {record.employeeName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {record.employeeCode}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {record.checkIn
                        ? new Date(record.checkIn).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-3 py-3">
                      {record.checkOut
                        ? new Date(record.checkOut).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-3 py-3">
                      {record.workingHours?.toFixed(2) ?? "0.00"}
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={statusClass(record.status)}>
                        {record.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {!dashboard.todayRecords.length && (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-slate-500">
                      No attendance marked today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
