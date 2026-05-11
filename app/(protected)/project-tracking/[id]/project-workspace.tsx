"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Priority } from "@prisma/client";
import {
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Flag,
  ListTodo,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  completeEmployeeTask,
  createProjectWorkspaceTask,
  reviewTaskSubmission,
  submitDailyTask,
} from "@/lib/actions/tasks";

type WorkspaceProject = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  members: Array<{
    employee: {
      id: string;
      employeeName: string;
      employeeCode: string;
    };
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
    assignedTo: {
      id: string;
      employeeName: string;
      employeeCode: string;
    } | null;
    submissions: Array<{
      id: string;
      summary: string;
      reviewStatus: string;
      reviewerTag: string;
      reviewRemark: string | null;
      createdAt: Date;
      employee: {
        id: string;
        employeeName: string;
        employeeCode: string;
      };
    }>;
  }>;
};

type TaskDraft = {
  assignedToId: string;
  title: string;
  description: string;
  priority: Priority;
  startDate: string;
  dueDate: string;
};

type WorkspaceTask = WorkspaceProject["tasks"][number];

function formatDate(date?: Date | string | null) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

function getStatusClass(status: string) {
  if (status === "COMPLETED" || status === "DONE" || status === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "IN_PROGRESS" || status === "ACTIVE") {
    return "bg-sky-100 text-sky-700";
  }

  if (status === "BLOCKED" || status === "REJECTED" || status === "CANCELLED") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "ON_HOLD" || status === "PENDING") {
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

export default function ProjectWorkspace({
  project,
  canManage,
  currentEmployeeId,
}: {
  project: WorkspaceProject;
  canManage: boolean;
  currentEmployeeId: string;
}) {
  const router = useRouter();
  const [taskDraft, setTaskDraft] = React.useState<TaskDraft>({
    assignedToId: "",
    title: "",
    description: "",
    priority: Priority.MEDIUM,
    startDate: "",
    dueDate: "",
  });
  const [updates, setUpdates] = React.useState<Record<string, string>>({});
  const [remarks, setRemarks] = React.useState<Record<string, string>>({});
  const [pendingKey, setPendingKey] = React.useState("");

  const assignedToMe = (task: WorkspaceTask) =>
    task.assignedTo?.id === currentEmployeeId;

  const employeeTaskGroups = React.useMemo(() => {
    const tasksByEmployee = new Map<string, WorkspaceTask[]>();

    project.members.forEach((member) => {
      tasksByEmployee.set(member.employee.id, []);
    });

    project.tasks.forEach((task) => {
      if (!task.assignedTo?.id) {
        return;
      }

      const tasks = tasksByEmployee.get(task.assignedTo.id);

      if (tasks) {
        tasks.push(task);
      }
    });

    return project.members.map((member) => ({
      employee: member.employee,
      tasks: tasksByEmployee.get(member.employee.id) ?? [],
    }));
  }, [project.members, project.tasks]);

  const unassignedTasks = React.useMemo(
    () => project.tasks.filter((task) => !task.assignedTo),
    [project.tasks],
  );

  const completedTasks = React.useMemo(
    () => project.tasks.filter((task) => task.status === "DONE").length,
    [project.tasks],
  );

  const nextDueDate = React.useMemo(() => {
    return project.tasks
      .filter((task) => task.status !== "DONE" && task.dueDate)
      .map((task) => task.dueDate as Date)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
  }, [project.tasks]);

  const handleAssignTask = async () => {
    setPendingKey("assign");
    const res = await createProjectWorkspaceTask(project.id, {
      ...taskDraft,
      status: "TODO",
    });
    setPendingKey("");

    if (!res.success) {
      toast.error("Error", { description: res.message });
      return;
    }

    toast.success("Success", { description: res.message });
    setTaskDraft({
      assignedToId: "",
      title: "",
      description: "",
      priority: Priority.MEDIUM,
      startDate: "",
      dueDate: "",
    });
    router.refresh();
  };

  const handleSubmitUpdate = async (taskId: string) => {
    const summary = updates[taskId]?.trim();

    if (!summary) {
      toast.error("Error", { description: "Task update is required" });
      return;
    }

    setPendingKey(`submit-${taskId}`);
    const res = await submitDailyTask(taskId, summary);
    setPendingKey("");

    if (!res.success) {
      toast.error("Error", { description: res.message });
      return;
    }

    toast.success("Success", { description: res.message });
    setUpdates((prev) => ({ ...prev, [taskId]: "" }));
    router.refresh();
  };

  const handleCompleteTask = async (taskId: string) => {
    setPendingKey(`complete-${taskId}`);
    const res = await completeEmployeeTask(taskId);
    setPendingKey("");

    if (!res.success) {
      toast.error("Error", { description: res.message });
      return;
    }

    toast.success("Success", { description: res.message });
    router.refresh();
  };

  const handleReview = async (
    submissionId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    setPendingKey(`review-${submissionId}`);
    const res = await reviewTaskSubmission(
      submissionId,
      status,
      remarks[submissionId] || "",
    );
    setPendingKey("");

    if (!res.success) {
      toast.error("Error", { description: res.message });
      return;
    }

    toast.success("Success", { description: res.message });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/80">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
                  <CircleDot className="size-5" />
                </div>
                <Badge className={`w-fit ${getStatusClass(project.status)}`}>
                  {project.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <CardTitle className="truncate text-2xl font-bold text-slate-950">
                {project.name}
              </CardTitle>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                {project.description || "Project task workspace"}
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[560px]">
              <SummaryMetric
                icon={<Users className="size-4" />}
                label="Employees"
                value={project.members.length}
              />
              <SummaryMetric
                icon={<ListTodo className="size-4" />}
                label="Tasks"
                value={project.tasks.length}
              />
              <SummaryMetric
                icon={<CheckCircle2 className="size-4" />}
                label="Completed"
                value={completedTasks}
              />
              <SummaryMetric
                icon={<CalendarDays className="size-4" />}
                label="Next Due"
                value={formatDate(nextDueDate)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-slate-900">
              Employees
            </h2>
            <p className="text-sm text-slate-500">
              Task ownership across involved project members.
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
            {employeeTaskGroups.map((group) => {
              const doneCount = group.tasks.filter(
                (task) => task.status === "DONE",
              ).length;

              return (
                <div
                  key={group.employee.id}
                  className="flex min-h-32 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 font-semibold text-cyan-700">
                      {group.employee.employeeName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {group.employee.employeeName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {group.employee.employeeCode}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-slate-500">Tasks</p>
                      <p className="font-semibold text-slate-900">
                        {group.tasks.length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 px-3 py-2">
                      <p className="text-emerald-700">Done</p>
                      <p className="font-semibold text-emerald-800">
                        {doneCount}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {canManage && (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg text-slate-900">
                Assign Task
              </CardTitle>
              <p className="text-sm text-slate-500">
                Create a task for one of the involved employees.
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-6">
            <Select
              value={taskDraft.assignedToId}
              onValueChange={(value) =>
                setTaskDraft((prev) => ({ ...prev, assignedToId: value }))
              }
            >
              <SelectTrigger className="h-11 xl:col-span-2">
                <SelectValue placeholder="Select involved employee" />
              </SelectTrigger>
              <SelectContent>
                {project.members.map((member) => (
                  <SelectItem
                    key={member.employee.id}
                    value={member.employee.id}
                  >
                    {member.employee.employeeName} (
                    {member.employee.employeeCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="h-11 xl:col-span-2"
              placeholder="Task title"
              value={taskDraft.title}
              onChange={(event) =>
                setTaskDraft((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <Select
              value={taskDraft.priority}
              onValueChange={(value) =>
                setTaskDraft((prev) => ({
                  ...prev,
                  priority: value as Priority,
                }))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Priority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="h-11"
              type="date"
              value={taskDraft.startDate}
              onChange={(event) =>
                setTaskDraft((prev) => ({
                  ...prev,
                  startDate: event.target.value,
                }))
              }
            />
            <Input
              className="h-11"
              type="date"
              value={taskDraft.dueDate}
              onChange={(event) =>
                setTaskDraft((prev) => ({ ...prev, dueDate: event.target.value }))
              }
            />
            <Button
              onClick={handleAssignTask}
              disabled={pendingKey === "assign"}
              className="h-11 bg-blue-600 hover:bg-blue-700 xl:col-span-2"
            >
              Assign Task
            </Button>
            <Textarea
              placeholder="Task description"
              value={taskDraft.description}
              onChange={(event) =>
                setTaskDraft((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="min-h-24 md:col-span-2 xl:col-span-6"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {employeeTaskGroups.map((group) => (
          <Card
            key={group.employee.id}
            className="overflow-hidden rounded-2xl border-slate-200 shadow-sm"
          >
            <CardHeader className="border-b border-slate-100 bg-white pb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-700">
                    {group.employee.employeeName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                  <CardTitle className="text-lg text-slate-900">
                    {group.employee.employeeName}
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    {group.employee.employeeCode}
                  </p>
                  </div>
                </div>
                <Badge className="w-fit bg-slate-100 text-slate-700">
                  {group.tasks.length} task(s)
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 bg-slate-50/60 p-4">
              {group.tasks.length ? (
                group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canManage={canManage}
                    isAssignedToMe={assignedToMe(task)}
                    updateValue={updates[task.id] || ""}
                    reviewRemarkValues={remarks}
                    pendingKey={pendingKey}
                    onUpdateChange={(value) =>
                      setUpdates((prev) => ({
                        ...prev,
                        [task.id]: value,
                      }))
                    }
                    onSubmitUpdate={() => handleSubmitUpdate(task.id)}
                    onCompleteTask={() => handleCompleteTask(task.id)}
                    onRemarkChange={(submissionId, value) =>
                      setRemarks((prev) => ({
                        ...prev,
                        [submissionId]: value,
                      }))
                    }
                    onReview={handleReview}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
                  No tasks assigned to this employee yet.
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {unassignedTasks.length > 0 && (
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg text-slate-900">
                Unassigned Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {unassignedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  canManage={canManage}
                  isAssignedToMe={false}
                  updateValue={updates[task.id] || ""}
                  reviewRemarkValues={remarks}
                  pendingKey={pendingKey}
                  onUpdateChange={(value) =>
                    setUpdates((prev) => ({
                      ...prev,
                      [task.id]: value,
                    }))
                  }
                  onSubmitUpdate={() => handleSubmitUpdate(task.id)}
                  onCompleteTask={() => handleCompleteTask(task.id)}
                  onRemarkChange={(submissionId, value) =>
                    setRemarks((prev) => ({
                      ...prev,
                      [submissionId]: value,
                    }))
                  }
                  onReview={handleReview}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium uppercase">{label}</span>
      </div>
      <p className="truncate text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TaskCard({
  task,
  canManage,
  isAssignedToMe,
  updateValue,
  reviewRemarkValues,
  pendingKey,
  onUpdateChange,
  onSubmitUpdate,
  onCompleteTask,
  onRemarkChange,
  onReview,
}: {
  task: WorkspaceTask;
  canManage: boolean;
  isAssignedToMe: boolean;
  updateValue: string;
  reviewRemarkValues: Record<string, string>;
  pendingKey: string;
  onUpdateChange: (value: string) => void;
  onSubmitUpdate: () => void;
  onCompleteTask: () => void;
  onRemarkChange: (submissionId: string, value: string) => void;
  onReview: (
    submissionId: string,
    status: "APPROVED" | "REJECTED",
  ) => Promise<void>;
}) {
  const isDone = task.status === "DONE";

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">
            {task.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
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

      <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        {task.description || "-"}
      </p>

      {isAssignedToMe && !isDone && (
        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <label className="text-sm font-semibold text-slate-700">
            Submit Work Update
          </label>
          <Textarea
            placeholder="Progress, blockers, next steps"
            value={updateValue}
            onChange={(event) => onUpdateChange(event.target.value)}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={onSubmitUpdate}
              disabled={pendingKey === `submit-${task.id}`}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Update
            </Button>
            <Button
              onClick={onCompleteTask}
              disabled={pendingKey === `complete-${task.id}`}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Flag className="mr-2 size-4" />
              Mark Complete
            </Button>
          </div>
        </div>
      )}

      {isAssignedToMe && isDone && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="size-4" />
          Completed by employee
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          Updates & Review
        </p>
        {task.submissions.length ? (
          task.submissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Badge className={getStatusClass(submission.reviewStatus)}>
                  {submission.reviewStatus}
                </Badge>
                <span>
                  {submission.employee.employeeName} (
                  {submission.employee.employeeCode})
                </span>
                <span>{submission.reviewerTag}</span>
                <span>{formatDate(submission.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-700">{submission.summary}</p>
              {submission.reviewRemark && (
                <p className="mt-1 text-sm text-slate-500">
                  Review: {submission.reviewRemark}
                </p>
              )}
              {canManage && submission.reviewStatus === "PENDING" && (
                <div className="mt-3 flex flex-col gap-2 md:flex-row">
                  <Input
                    placeholder="Review remark"
                    value={reviewRemarkValues[submission.id] || ""}
                    onChange={(event) =>
                      onRemarkChange(submission.id, event.target.value)
                    }
                  />
                  <Button
                    onClick={() => onReview(submission.id, "APPROVED")}
                    disabled={pendingKey === `review-${submission.id}`}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => onReview(submission.id, "REJECTED")}
                    disabled={pendingKey === `review-${submission.id}`}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No updates yet.</p>
        )}
      </div>
    </div>
  );
}
