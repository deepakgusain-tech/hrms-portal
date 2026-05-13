"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  reviewEodReport,
  reviewMonthlyEod,
  submitEodReport,
  type EodWorkspaceData,
} from "@/lib/actions/eod-reporting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

function getMonthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function statusTone(status: string) {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export default function EodWorkspace({ data }: { data: EodWorkspaceData }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [accomplishments, setAccomplishments] = React.useState(
    data.employeeSection?.todayReport?.accomplishments || "",
  );
  const [plans, setPlans] = React.useState(data.employeeSection?.todayReport?.plans || "");
  const [blockers, setBlockers] = React.useState(data.employeeSection?.todayReport?.blockers || "");
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<string[]>(
    data.employeeSection?.todayReport?.linkedTaskIds || [],
  );
  const [remarks, setRemarks] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setAccomplishments(data.employeeSection?.todayReport?.accomplishments || "");
    setPlans(data.employeeSection?.todayReport?.plans || "");
    setBlockers(data.employeeSection?.todayReport?.blockers || "");
    setSelectedTaskIds(data.employeeSection?.todayReport?.linkedTaskIds || []);
  }, [data.employeeSection?.todayReport]);

  const monthLabel = getMonthLabel(data.actor.year, data.actor.month);

  const submitTodayReport = async () => {
    setIsPending(true);

    try {
      const result = await submitEodReport({
        reportDate: new Date().toISOString().slice(0, 10),
        accomplishments,
        plans,
        blockers,
        linkedTaskIds: selectedTaskIds,
      });

      if (!result.success) {
        toast.error("Unable to submit EOD", { description: result.message });
        return;
      }

      toast.success("EOD submitted", { description: result.message });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleDailyReview = async (reportId: string, status: "APPROVED" | "REJECTED") => {
    setIsPending(true);

    try {
      const result = await reviewEodReport(reportId, status, remarks[reportId] || "");

      if (!result.success) {
        toast.error("Review failed", { description: result.message });
        return;
      }

      toast.success("Daily review updated", { description: result.message });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleMonthlyReview = async (
    key: string,
    employeeId: string,
    stage: "manager" | "hr",
    status: "APPROVED" | "REJECTED",
  ) => {
    setIsPending(true);

    try {
      const result = await reviewMonthlyEod(
        employeeId,
        data.actor.year,
        data.actor.month,
        stage,
        status,
        remarks[key] || "",
      );

      if (!result.success) {
        toast.error("Monthly review failed", { description: result.message });
        return;
      }

      toast.success("Monthly review updated", { description: result.message });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-700">
              EOD Reporting
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Daily Reporting and Payroll Review
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Employees submit daily updates, managers review progress, and HR closes the month with attendance-backed salary approval.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-slate-200 shadow-none">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Active Month</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{monthLabel}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-none">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">View Modes</p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {[
                    data.employeeSection ? "Employee" : "",
                    data.managerSection ? "Manager" : "",
                    data.hrSection ? "HR" : "",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {data.employeeSection ? (
        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Submit Today&apos;s EOD</CardTitle>
              <p className="text-sm text-slate-500">
                {data.employeeSection.profile.employeeName} · {data.employeeSection.profile.employeeCode}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="text-slate-500">Department</p>
                  <p className="mt-1 font-medium text-slate-900">{data.employeeSection.profile.departmentName}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="text-slate-500">Manager</p>
                  <p className="mt-1 font-medium text-slate-900">{data.employeeSection.profile.managerName}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="text-slate-500">Attendance</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {data.employeeSection.todayAttendance?.status || "Not marked"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="text-slate-500">Working Hours</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {data.employeeSection.todayAttendance?.workingHours ?? "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tasks worked on today</label>
                <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {data.employeeSection.availableTasks.length ? (
                    data.employeeSection.availableTasks.map((task) => (
                      <label
                        key={task.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent bg-white p-3 transition hover:border-cyan-200"
                      >
                        <Checkbox
                          checked={selectedTaskIds.includes(task.id)}
                          onCheckedChange={(checked) =>
                            setSelectedTaskIds((prev) =>
                              checked
                                ? [...prev, task.id]
                                : prev.filter((id) => id !== task.id),
                            )
                          }
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{task.title}</p>
                          <p className="text-sm text-slate-500">
                            {task.projectName} · {task.status} · Due {task.dueDate}
                          </p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No active assigned tasks found for today. You can still submit a general EOD.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Accomplishments</label>
                <Textarea
                  value={accomplishments}
                  onChange={(event) => setAccomplishments(event.target.value)}
                  placeholder="What did you complete today?"
                  className="min-h-28"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Plans for next working day</label>
                <Textarea
                  value={plans}
                  onChange={(event) => setPlans(event.target.value)}
                  placeholder="What will you pick up next?"
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Blockers</label>
                <Textarea
                  value={blockers}
                  onChange={(event) => setBlockers(event.target.value)}
                  placeholder="Anything blocked, delayed, or needing support?"
                  className="min-h-20"
                />
              </div>

              <Button
                onClick={submitTodayReport}
                disabled={isPending || !accomplishments.trim()}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {data.employeeSection.todayReport ? "Update EOD Report" : "Submit EOD Report"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: "Submitted", value: data.employeeSection.currentMonth.submitted },
                { label: "Approved", value: data.employeeSection.currentMonth.approved },
                { label: "Pending", value: data.employeeSection.currentMonth.pending },
                { label: "Rejected", value: data.employeeSection.currentMonth.rejected },
              ].map((item) => (
                <Card key={item.label} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Daily Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.employeeSection.recentReports.length ? (
                  data.employeeSection.recentReports.map((report) => (
                    <div key={report.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{report.reportDate}</p>
                          <p className="mt-1 text-sm text-slate-600">{report.accomplishments}</p>
                        </div>
                        <Badge className={statusTone(report.managerStatus)}>{report.managerStatus}</Badge>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-600">
                        <p>
                          Tasks: {report.linkedTaskTitles.length ? report.linkedTaskTitles.join(", ") : "-"}
                        </p>
                        <p>Next: {report.plans || "-"}</p>
                        <p>Blockers: {report.blockers || "-"}</p>
                        <p>Attendance: {report.attendanceStatus || "-"}</p>
                        <p>Manager remark: {report.managerRemark || "-"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No EOD reports submitted yet for {monthLabel}.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {data.managerSection ? (
        <section className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Manager Daily Review Queue</CardTitle>
              <p className="text-sm text-slate-500">
                Review direct-report EODs before they move into the monthly payroll pipeline.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.managerSection.pendingReports.length ? (
                data.managerSection.pendingReports.map((report) => (
                  <div key={report.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {report.employeeName} · {report.employeeCode}
                        </p>
                        <p className="text-sm text-slate-500">
                          {report.departmentName} · {report.reportDate} · Attendance {report.attendanceStatus || "-"}
                        </p>
                      </div>
                      <Badge className={statusTone("PENDING")}>PENDING</Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="font-medium text-slate-900">Tasks:</span>{" "}
                        {report.linkedTaskTitles.length ? report.linkedTaskTitles.join(", ") : "-"}
                      </p>
                      <p><span className="font-medium text-slate-900">Done:</span> {report.accomplishments}</p>
                      <p><span className="font-medium text-slate-900">Next:</span> {report.plans || "-"}</p>
                      <p><span className="font-medium text-slate-900">Blockers:</span> {report.blockers || "-"}</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 md:flex-row">
                      <Input
                        value={remarks[report.id] || ""}
                        onChange={(event) =>
                          setRemarks((prev) => ({ ...prev, [report.id]: event.target.value }))
                        }
                        placeholder="Manager review remark"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDailyReview(report.id, "APPROVED")}
                          disabled={isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDailyReview(report.id, "REJECTED")}
                          disabled={isPending}
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  No pending daily reviews right now.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Manager Monthly Review</CardTitle>
              <p className="text-sm text-slate-500">
                Approve the month once EOD consistency and attendance both look right.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 xl:grid-cols-2">
              {data.managerSection.monthlySummaries.map((summary) => {
                const key = `manager-${summary.employeeId}`;
                return (
                  <div key={summary.employeeId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {summary.employeeName} · {summary.employeeCode}
                        </p>
                        <p className="text-sm text-slate-500">
                          {summary.departmentName} · Manager {summary.managerName}
                        </p>
                      </div>
                      <Badge className={statusTone(summary.managerStatus)}>{summary.managerStatus}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                      <p>Submitted EODs: {summary.submittedReports}</p>
                      <p>Approved EODs: {summary.approvedReports}</p>
                      <p>Pending EODs: {summary.pendingReports}</p>
                      <p>Rejected EODs: {summary.rejectedReports}</p>
                      <p>Present: {summary.attendance.present}</p>
                      <p>Half Days: {summary.attendance.halfDay}</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <Input
                        value={remarks[key] || summary.managerRemark}
                        onChange={(event) =>
                          setRemarks((prev) => ({ ...prev, [key]: event.target.value }))
                        }
                        placeholder="Monthly manager remark"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleMonthlyReview(key, summary.employeeId, "manager", "APPROVED")}
                          disabled={isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Approve Month
                        </Button>
                        <Button
                          onClick={() => handleMonthlyReview(key, summary.employeeId, "manager", "REJECTED")}
                          disabled={isPending}
                          variant="destructive"
                        >
                          Reject Month
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      ) : null}

      {data.hrSection ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>HR Payroll Approval Queue</CardTitle>
            <p className="text-sm text-slate-500">
              Use manager-approved monthly reporting plus attendance totals to approve salary readiness.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 xl:grid-cols-2">
            {data.hrSection.monthlySummaries.map((summary) => {
              const key = `hr-${summary.employeeId}`;
              const hrDisabled = summary.managerStatus !== "APPROVED";

              return (
                <div key={summary.employeeId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {summary.employeeName} · {summary.employeeCode}
                      </p>
                      <p className="text-sm text-slate-500">
                        {summary.departmentName} · Manager {summary.managerName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={statusTone(summary.managerStatus)}>Manager {summary.managerStatus}</Badge>
                      <Badge className={statusTone(summary.hrStatus)}>HR {summary.hrStatus}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p>Submitted EODs: {summary.submittedReports}</p>
                    <p>Approved EODs: {summary.approvedReports}</p>
                    <p>Present: {summary.attendance.present}</p>
                    <p>Leave: {summary.attendance.leave}</p>
                    <p>Absent: {summary.attendance.absent}</p>
                    <p>Half Days: {summary.attendance.halfDay}</p>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p>Manager remark: {summary.managerRemark || "-"}</p>
                    <p>HR remark: {summary.hrRemark || "-"}</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    <Input
                      value={remarks[key] || summary.hrRemark}
                      onChange={(event) =>
                        setRemarks((prev) => ({ ...prev, [key]: event.target.value }))
                      }
                      placeholder="HR payroll approval remark"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMonthlyReview(key, summary.employeeId, "hr", "APPROVED")}
                        disabled={isPending || hrDisabled}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Approve Salary
                      </Button>
                      <Button
                        onClick={() => handleMonthlyReview(key, summary.employeeId, "hr", "REJECTED")}
                        disabled={isPending || hrDisabled}
                        variant="destructive"
                      >
                        Reject Salary
                      </Button>
                    </div>
                    {hrDisabled ? (
                      <p className="text-xs text-amber-700">
                        Manager approval is required before HR can approve payroll.
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
