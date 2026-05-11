"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  CalendarIcon,
  FileText,
  UserRound,
} from "lucide-react";
import z from "zod";
import { toast } from "sonner";
import { ProjectStatus } from "@prisma/client";

import { projectSchema } from "@/lib/validators";

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
import { createProject, updateProject } from "@/lib/actions/projects";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";

type FormValues = z.infer<typeof projectSchema>;

type Props = {
  data?: FormValues;
  update: boolean;
  employees: {
    id: string;
    employeeName: string;
    employeeCode: string;
  }[];
};

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-500";

const textAreaClass =
  "min-h-32 w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-500";

const ProjectForm = ({ data, update, employees }: Props) => {
  const router = useRouter();
  const id = data?.id;
  const [isPending, startTransition] = React.useTransition();

  const payload = {
    name: data?.name ?? "",
    startDate: data?.startDate ?? null,
    endDate: data?.endDate ?? null,
    status: data?.status ?? ProjectStatus.ACTIVE,
    createdById: data?.createdById ?? "",
    description: data?.description ?? undefined,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: payload,
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      const res = update && id
        ? await updateProject(values, id)
        : await createProject(values);

      if (!res?.success) {
        toast.error("Error", {
          description: res?.message,
        });
        return;
      }

      toast.success("Success", {
        description: res.message,
      });

      router.push("/projects");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-600 text-white">
                <FileText className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Project Details
                </h3>
                <p className="text-sm text-slate-500">
                  Basic timeline and ownership information.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-sm font-semibold text-slate-700">
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project name"
                        className={fieldClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              fieldClass,
                              "justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value as Date}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              fieldClass,
                              "justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value as Date}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm font-semibold text-slate-700">
                      Status
                    </FormLabel>

                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as ProjectStatus)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className={fieldClass}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="rounded-xl border border-slate-200 shadow-xl">
                        {Object.values(ProjectStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replaceAll("_", " ")}
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
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-sm font-semibold text-slate-700">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe goals, deliverables, and context"
                        className={textAreaClass}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <UserRound className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Owner</h3>
                <p className="text-sm text-slate-500">
                  Choose who is responsible for the project.
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="createdById"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-semibold text-slate-700">
                    Created By
                  </FormLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="Select created by" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent className="rounded-xl border border-slate-200 shadow-xl">
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

            <div className="rounded-xl bg-cyan-50 p-4 text-sm text-cyan-800">
              Projects become easier to track once members and tasks are added
              from the project tracking workspace.
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 rounded-xl bg-cyan-600 px-8 text-white shadow-sm hover:bg-cyan-700"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {update ? "Update Project" : "Save Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;
