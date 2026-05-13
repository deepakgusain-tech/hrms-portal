import { redirect } from "next/navigation";

import { AttendanceMarkPanel } from "@/components/attendance/attendance-mark-panel";
import {
  getAttendanceDashboard,
} from "@/lib/actions/attendance";
import {
  canManageAllAttendance,
  getRoutePermissions,
  getUserPermissions,
} from "@/lib/rbac";

export default async function MarkAttendancePage() {
  const permissions = await getRoutePermissions("/attendance");

  if (!permissions.canCreate) {
    redirect("/404");
  }

  const user = await getUserPermissions();
  if (!canManageAllAttendance(user?.role?.name)) {
    redirect("/attendance/my");
  }

  const dashboard = await getAttendanceDashboard();
  const employeeId = dashboard.currentEmployeeId;
  const todayRecord = dashboard.todayRecords.find(
    (record) => record.employeeId === employeeId,
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 shadow-sm">
        <div className="grid gap-4 p-5 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Attendance Action
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">
              My Check In
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Record your own check-in and check-out for the current day.
            </p>
          </div>
        </div>
      </section>
      <AttendanceMarkPanel
        employeeId={employeeId}
        todayRecord={todayRecord}
        canCreate={permissions.canCreate}
      />
    </div>
  );
}
