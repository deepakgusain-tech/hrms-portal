"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Priority, TaskStatus } from "@prisma/client";
import { ArrowRight, ClipboardList, Loader2, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { createTask } from "@/lib/actions/tasks";
import { taskSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FormValues = z.infer<typeof taskSchema>;

type ProjectOption = {
  id: string;
  name: string;
  members: Array<{
    employee: {
      id: string;
      employeeName: string;
      employeeCode: string;
    };
  }>;
};

const fieldClass =
  "h-11 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-500";

export default function TaskAssignmentForm({
  projects,
}: {
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      projectId: "",
      assignedToId: "",
      title: "",
      description: "",
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      startDate: "",
      dueDate: "",
    },
  });

  const selectedProjectId = useWatch({
    control: form.control,
    name: "projectId",
  });
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const employees = selectedProject?.members.map((member) => member.employee) ?? [];

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await createTask(values);

      if (!res.success) {
        toast.error("Error", { description: res.message });
        return;
      }

      toast.success("Success", { description: res.message });
      router.push("/project-tracking");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-600 text-white">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Task Details</h3>
                <p className="text-sm text-slate-500">
                  Assign clear work to an involved employee.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("assignedToId", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className={fieldClass}>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedProjectId}
                    >
                      <FormControl>
                        <SelectTrigger className={fieldClass}>
                          <SelectValue placeholder="Select involved employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.employeeName} ({employee.employeeCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input
                        className={fieldClass}
                        placeholder="Enter task title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className={fieldClass}>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Priority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        className={fieldClass}
                        type="date"
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input
                        className={fieldClass}
                        type="date"
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-32 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-500"
                        placeholder="Describe the work expected"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <UsersRound className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Involved Employees
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedProject
                    ? `${employees.length} available for this project`
                    : "Select a project first"}
                </p>
              </div>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {employees.length ? (
                employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="font-medium text-slate-900">
                      {employee.employeeName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {employee.employeeCode}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No employees to show yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 rounded-xl bg-cyan-600 px-8 hover:bg-cyan-700"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Assign Task
          </Button>
        </div>
      </form>
    </Form>
  );
}
