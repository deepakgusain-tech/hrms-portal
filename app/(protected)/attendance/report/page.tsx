import { redirect } from "next/navigation";

import { AttendanceSheet } from "@/components/attendance/attendance-sheet";
import {
  getAttendanceOptions,
  getMonthlyAttendance,
} from "@/lib/actions/attendance";
import { getRoutePermissions, getUserPermissions } from "@/lib/rbac";

export default async function AttendanceReportPage() {
  const permissions = await getRoutePermissions("/attendance");

  if (!permissions.canView) {
    redirect("/404");
  }

  const user = await getUserPermissions();
  const canFilterEmployees = user?.role?.name?.toLowerCase() !== "employee";
  const [sheet, options] = await Promise.all([
    getMonthlyAttendance(),
    getAttendanceOptions(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Attendance Report
        </h1>
        <p className="text-sm text-slate-500">
          Filter attendance data and export the current view as CSV.
        </p>
      </div>
      <AttendanceSheet
        initialSheet={sheet}
        employees={options.employees}
        departments={options.departments}
        canFilterEmployees={canFilterEmployees}
        showExport
      />
    </div>
  );
}
