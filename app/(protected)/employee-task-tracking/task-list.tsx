"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Flag,
  FolderKanban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { completeEmployeeTask } from "@/lib/actions/tasks";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  project: {
    id: string;
    name: string;
  };
  submissions: Array<{
    id: string;
    summary: string;
    reviewStatus: string;
    reviewerTag: string;
    reviewRemark: string | null;
    createdAt: Date;
  }>;
};

function formatDate(date?: Date | string | null) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

function getStatusClass(status: string) {
  if (status === "DONE" || status === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "IN_PROGRESS") {
    return "bg-sky-100 text-sky-700";
  }

  if (status === "BLOCKED" || status === "REJECTED") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "PENDING") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getPriorityClass(priority: string) {
  if (priority === "CRITICAL" || priority === "HIGH") {
    return "bg-rose-100 text-rose-700";
  }

  if (priority === "MEDIUM") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

export default function EmployeeTaskList({ tasks }: { tasks: TaskRow[] }) {
  const router = useRouter();
  const [pendingTaskId, setPendingTaskId] = React.useState("");

  const handleCompleteTask = async (taskId: string) => {
    setPendingTaskId(taskId);
    const res = await completeEmployeeTask(taskId);
    setPendingTaskId("");

    if (!res.success) {
      toast.error("Error", { description: res.message });
      return;
    }

    toast.success("Success", { description: res.message });
    router.refresh();
  };

  if (!tasks.length) {
    return (
      <Card className="rounded-2xl border-dashed border-slate-200 bg-slate-50 shadow-sm">
        <CardContent className="flex h-64 flex-col items-center justify-center gap-2 text-center text-slate-500">
          <FolderKanban className="size-10 text-slate-400" />
          <p className="font-medium text-slate-700">No assigned tasks found.</p>
          <p className="text-sm">Tasks assigned to you will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
      {tasks.map((task) => {
        const latestSubmission = task.submissions[0];
        const updateCount = task.submissions.length;
        const isDone = task.status === "DONE";

        return (
          <Card
            key={task.id}
            className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm"
          >
            <CardHeader className="border-b border-slate-100 bg-white pb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                    <FolderKanban className="size-3.5" />
                    {task.project.name}
                  </div>
                  <CardTitle className="line-clamp-2 text-lg text-slate-950">
                    {task.title}
                  </CardTitle>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="size-4" />
                    Due {formatDate(task.dueDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusClass(task.status)}>
                    {task.status.replaceAll("_", " ")}
                  </Badge>
                  <Badge className={getPriorityClass(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 bg-slate-50/60 p-4">
              <p className="rounded-xl border border-slate-100 bg-white p-3 text-sm leading-6 text-slate-600">
                {task.description || "-"}
              </p>

              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Latest Update
                  </p>
                  <Badge variant="secondary">{updateCount} total</Badge>
                </div>
                {latestSubmission ? (
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusClass(latestSubmission.reviewStatus)}>
                        {latestSubmission.reviewStatus}
                      </Badge>
                      <span>{latestSubmission.reviewerTag}</span>
                      <span>{formatDate(latestSubmission.createdAt)}</span>
                    </div>
                    <p>{latestSubmission.summary}</p>
                    {latestSubmission.reviewRemark && (
                      <p className="rounded-lg bg-slate-50 p-2 text-slate-500">
                        Review: {latestSubmission.reviewRemark}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No update submitted yet.
                  </p>
                )}
              </div>

              {isDone ? (
                <div className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="size-4" />
                  Completed
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={pendingTaskId === task.id}
                    className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Flag className="mr-2 size-4" />
                    Mark Done
                  </Button>
                  <Button
                    asChild
                    className="h-10 rounded-xl bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Link href={`/project-tracking/${task.project.id}`}>
                      Workspace
                      <ArrowUpRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
