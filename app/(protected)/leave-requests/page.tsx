import { redirect } from "next/navigation";

import { LeaveRequestReviewTable } from "@/components/leave-requests/leave-request-review-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  getLeaveDashboard,
  getLeaveRequests,
} from "@/lib/actions/leave-requests";
import { isCurrentEmployeeHr } from "@/lib/employee-job-role";
import {
  canManageAllAttendance,
  getRoutePermissions,
  getUserPermissions,
} from "@/lib/rbac";

export default async function LeaveRequestsPage() {
  const [permissions, user] = await Promise.all([
    getRoutePermissions("/leave-requests"),
    getUserPermissions(),
  ]);
  const isHrEmployee = await isCurrentEmployeeHr();

  if (
    (!permissions.canView || !canManageAllAttendance(user?.role?.name)) &&
    !isHrEmployee
  ) {
    redirect("/404");
  }

  const [requests, summary] = await Promise.all([
    getLeaveRequests(),
    getLeaveDashboard(),
  ]);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 shadow-sm">
        <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Review Queue
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">
              Leave Requests
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review employee leave requests, capture remarks, and resolve the
              approval queue with the live attendance sync already in place.
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
                Pending
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.pending}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
                Approved
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.approved}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
                Rejected
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.rejected}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {summary.pending}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">
              {summary.approved}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-2 text-3xl font-semibold text-rose-600">
              {summary.rejected}
            </p>
          </CardContent>
        </Card>
      </div>

      <LeaveRequestReviewTable initialRequests={requests} />
    </div>
  );
}
