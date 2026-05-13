import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  FileSpreadsheet,
  LogIn,
} from "lucide-react";
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
import { isCurrentEmployeeHr } from "@/lib/employee-job-role";
import {
  canManageAllAttendance,
  getRoutePermissions,
  getUserPermissions,
} from "@/lib/rbac";

function statusClass(status: string) {
  if (status === "PRESENT") return "bg-emerald-100 text-emerald-700";
  if (status === "ABSENT") return "bg-rose-100 text-rose-700";
  if (status === "LEAVE") return "bg-amber-100 text-amber-700";
  if (status === "HALF_DAY") return "bg-sky-100 text-sky-700";
  return "bg-violet-100 text-violet-700";
}

export default async function AttendancePage() {
  const [permissions, user] = await Promise.all([
    getRoutePermissions("/attendance"),
    getUserPermissions(),
  ]);
  const isHrEmployee = await isCurrentEmployeeHr();

  if (!permissions.canView && !isHrEmployee) {
    redirect("/404");
  }

  if (!canManageAllAttendance(user?.role?.name) && !isHrEmployee) {
    redirect("/attendance/my");
  }

  const dashboard = await getAttendanceDashboard();
  const actionLinks = [
    permissions.canCreate
      ? {
          href: "/attendance/mark",
          label: "My Check In",
          icon: LogIn,
          primary: true,
        }
      : null,
    {
      href: "/attendance/sheet",
      label: "Monthly Sheet",
      icon: FileSpreadsheet,
      primary: false,
    },
    {
      href: "/attendance/report",
      label: "Reports",
      icon: CalendarDays,
      primary: false,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    icon: typeof LogIn;
    primary: boolean;
  }[];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 shadow-sm">
        <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Attendance Hub
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">
              Attendance
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Track daily attendance, review the current day, and move into the
              monthly grid or export reports without leaving the module.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {actionLinks.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={item.primary ? "default" : "outline"}
                  className={
                    item.primary
                      ? "bg-cyan-600 text-white hover:bg-cyan-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }
                >
                  <Link href={item.href}>
                    <item.icon />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
                Present
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {dashboard.summary.present}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
                Marked Today
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {dashboard.todayRecords.length}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
                Leaves
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {dashboard.summary.leaves}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
                Exceptions
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {dashboard.summary.absents + dashboard.summary.halfDays}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Present Days</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">
              {dashboard.summary.present}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Leaves</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {dashboard.summary.leaves}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Absents</p>
            <p className="mt-2 text-3xl font-semibold text-rose-600">
              {dashboard.summary.absents}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Half Days</p>
            <p className="mt-2 text-3xl font-semibold text-sky-600">
              {dashboard.summary.halfDays}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="size-5 text-cyan-700" />
              Today Status
            </CardTitle>
            <Link
              href="/attendance/sheet"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-900"
            >
              Open monthly sheet
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-3">Employee</th>
                  <th className="px-3 py-3">Check In</th>
                  <th className="px-3 py-3">Check Out</th>
                  <th className="px-3 py-3">Hours</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.todayRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`border-b border-slate-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    }`}
                  >
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
