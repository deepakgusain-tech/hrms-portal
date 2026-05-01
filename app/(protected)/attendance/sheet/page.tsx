import { redirect } from "next/navigation";

import { AttendanceSheet } from "@/components/attendance/attendance-sheet";
import {
  getAttendanceOptions,
  getMonthlyAttendance,
} from "@/lib/actions/attendance";
import { getUserPermissions, getRoutePermissions } from "@/lib/rbac";

export default async function AttendanceSheetPage() {
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
          Attendance Sheet
        </h1>
        <p className="text-sm text-slate-500">
          Monthly employee attendance in a payroll-friendly grid.
        </p>
      </div>
      <AttendanceSheet
        initialSheet={sheet}
        employees={options.employees}
        departments={options.departments}
        canFilterEmployees={canFilterEmployees}
      />
    </div>
  );
}
