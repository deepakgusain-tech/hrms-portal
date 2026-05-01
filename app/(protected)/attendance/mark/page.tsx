import { redirect } from "next/navigation";

import { AttendanceMarkPanel } from "@/components/attendance/attendance-mark-panel";
import {
  getAttendanceDashboard,
  getAttendanceOptions,
} from "@/lib/actions/attendance";
import { getRoutePermissions, getUserPermissions } from "@/lib/rbac";

export default async function MarkAttendancePage() {
  const permissions = await getRoutePermissions("/attendance");

  if (!permissions.canCreate) {
    redirect("/404");
  }

  const [dashboard, options, user] = await Promise.all([
    getAttendanceDashboard(),
    getAttendanceOptions(),
    getUserPermissions(),
  ]);
  const canChooseEmployee = user?.role?.name?.toLowerCase() !== "employee";
  const employeeId =
    dashboard.currentEmployeeId || options.employees.at(0)?.id || "";
  const todayRecord = dashboard.todayRecords.find(
    (record) => record.employeeId === employeeId,
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Mark Attendance
        </h1>
        <p className="text-sm text-slate-500">
          Record check-in and check-out for the current day.
        </p>
      </div>
      <AttendanceMarkPanel
        employeeId={employeeId}
        employees={options.employees}
        todayRecord={todayRecord}
        canCreate={permissions.canCreate}
        canChooseEmployee={canChooseEmployee}
      />
    </div>
  );
}
