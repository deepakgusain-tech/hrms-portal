"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Status } from "@prisma/client";

import { moduleSchema } from "@/lib/validators";
import { Module } from "@/types";
import {
  createModule,
  updateModule,
} from "@/lib/actions/module-action";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { Button } from "../ui/button";

import {
  ArrowRight,
  Loader2,
  LayoutGrid,
  FileText,
  Sparkles,
} from "lucide-react";

type Props = {
  data?: Module;
  update: boolean;
};

const inputStyle =
  "h-12 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 hover:border-cyan-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100";

const textareaStyle =
  "min-h-36 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 hover:border-cyan-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100";

const ModuleForm = ({
  data,
  update = false,
}: Props) => {
  const router = useRouter();
  const id = data?.id;

  const form = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: data
      ? {
          name: data.name ?? "",
          description: data.description ?? "",
          route: data.route ?? "",
          status: data.status ?? Status.ACTIVE,
        }
      : {
          name: "",
          description: "",
          route: "",
          status: Status.ACTIVE,
        },
  });

  const [isPending, startTransition] =
    React.useTransition();

  const onSubmit: SubmitHandler<
    z.infer<typeof moduleSchema>
  > = (values) => {
    startTransition(async () => {
      let res;

      if (update && id) {
        res = await updateModule(values, id);
      } else {
        res = await createModule(values);
      }

      if (!res?.success) {
        toast.error("Error", {
          description:
            res?.message ||
            "Something went wrong",
        });
        return;
      }

      toast.success(
        update
          ? "Module updated successfully"
          : "Module created successfully"
      );

      router.push("/module");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Top Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Module Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">
                  Module Name
                </FormLabel>

                <FormControl>
                  <div className="relative">
                    <LayoutGrid className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                    <Input
                      placeholder="Enter module name"
                      className={`${inputStyle} pl-11`}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-slate-700">
                  Status
                </FormLabel>

                <FormControl>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(
                        value as Status
                      )
                    }
                  >
                    <SelectTrigger
                      className={`${inputStyle} w-full`}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent className="rounded-2xl border border-slate-200 shadow-xl">
                      <SelectItem value={Status.ACTIVE}>
                        Active
                      </SelectItem>
                      <SelectItem value={Status.INACTIVE}>
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">
                Description
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                  <Textarea
                    className={`${textareaStyle} pl-11`}
                    placeholder="Enter description"
                    {...field}
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Info Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              Module Setup
            </h3>
          </div>

          <p className="text-sm text-slate-500">
            Create modules to organize
            permissions and access
            control across your HRMS
            portal.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-8 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-xl"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}

            {update
              ? "Update Module"
              : "Save Module"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ModuleForm;