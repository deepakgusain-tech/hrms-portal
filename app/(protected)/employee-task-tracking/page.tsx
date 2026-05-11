import { redirect } from "next/navigation";
import type React from "react";
import { auth } from "@/auth";
import { getMyTaskTrackingRows } from "@/lib/actions/tasks";
import EmployeeTaskList from "./task-list";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, Clock3, ListChecks, TimerReset } from "lucide-react";

function formatDate(date?: Date | string | null) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

export default async function EmployeeTaskTrackingPage() {
  const session = await auth();

  if (session?.user?.role?.toLowerCase() !== "employee") {
    redirect("/404");
  }

  const tasks = await getMyTaskTrackingRows();
  const openTasks = tasks.filter((task) => task.status !== "DONE").length;
  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const pendingReviews = tasks.reduce(
    (count, task) =>
      count +
      task.submissions.filter(
        (submission) => submission.reviewStatus === "PENDING",
      ).length,
    0,
  );
  const nextDueDate = tasks
    .filter((task) => task.status !== "DONE" && task.dueDate)
    .map((task) => task.dueDate as Date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Task workspace</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              My Task Tracking
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Track assigned project work, review the latest feedback, and open
              the live workspace when you need to submit progress.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:w-[640px]">
            <TaskMetric
              icon={<ListChecks className="size-4" />}
              label="Assigned"
              value={tasks.length}
            />
            <TaskMetric
              icon={<Clock3 className="size-4" />}
              label="Open"
              value={openTasks}
            />
            <TaskMetric
              icon={<BadgeCheck className="size-4" />}
              label="Done"
              value={completedTasks}
            />
            <TaskMetric
              icon={<TimerReset className="size-4" />}
              label="Next Due"
              value={formatDate(nextDueDate)}
            />
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
          {pendingReviews} update(s) waiting for review
        </div>
      </div>

      <EmployeeTaskList tasks={tasks} />
    </div>
  );
}

function TaskMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-3">
        <div className="mb-2 flex items-center gap-2 text-slate-500">
          {icon}
          <span className="text-xs font-medium uppercase">{label}</span>
        </div>
        <p className="truncate text-lg font-bold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
