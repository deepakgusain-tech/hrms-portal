"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";

import { roleSchema } from "@/lib/validators";
import { roleDefaultValues } from "@/lib/constants";
import { createRole, updateRole } from "@/lib/actions/role";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { Module } from "@/types";
import { Status } from "@prisma/client";

const inputStyle =
  "h-12 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 hover:border-cyan-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100";

const textareaStyle =
  "min-h-36 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 hover:border-cyan-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100";

const RoleForm = ({
  data,
  update = false,
  modules,
}: {
  data?: any;
  update: boolean;
  modules: Module[];
}) => {
  const router = useRouter();
  const id = data?.id;

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: data || roleDefaultValues,
  });

  const [isPending, startTransition] =
    React.useTransition();

  const [selectedModules, setSelectedModules] =
    React.useState<any[]>(
      update ? data.roleModules : []
    );

  const onSubmit: SubmitHandler<
    z.infer<typeof roleSchema>
  > = (values: any) => {
    startTransition(async () => {
      let res;

      const payload = {
        ...values,
        modules: selectedModules,
      };

      if (update && id) {
        res = await updateRole(payload, id);
      } else {
        res = await createRole(payload);
      }

      if (!res?.success) {
        toast.error("Error", {
          description: res?.message,
        });
      } else {
        router.push("/roles");
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">
                  Role Name
                </FormLabel>

                <FormControl>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                    <Input
                      placeholder="Enter role name"
                      className={`${inputStyle} pl-11`}
                      {...field}
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">
                  Status
                </FormLabel>

                <FormControl>
                  <select
                    {...field}
                    className={`${inputStyle} w-full px-4`}
                  >
                    <option value={Status.ACTIVE}>
                      Active
                    </option>
                    <option value={Status.INACTIVE}>
                      Inactive
                    </option>
                  </select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">
                Remark
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                  <Textarea
                    className={`${textareaStyle} pl-11`}
                    placeholder="Enter Notes"
                    {...field}
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-slate-800">
              Assign Modules & Permissions
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((m) => {
              const selected =
                selectedModules.find(
                  (sm) => sm.moduleId === m.id
                );

              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>

                    <h4 className="font-semibold text-slate-800">
                      {m.name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "view",
                      "create",
                      "edit",
                      "delete",
                    ].map((perm) => {
                      const key =
                        "can" +
                        perm.charAt(0).toUpperCase() +
                        perm.slice(1);

                      const active =
                        selected?.[key] || false;

                      return (
                        <button
                          key={perm}
                          type="button"
                          onClick={() => {
                            setSelectedModules(
                              (prev) => {
                                const exists =
                                  prev.find(
                                    (p) =>
                                      p.moduleId ===
                                      m.id
                                  );

                                if (
                                  !exists
                                ) {
                                  return [
                                    ...prev,
                                    {
                                      moduleId:
                                        m.id,
                                      canView:
                                        perm ===
                                        "view",
                                      canCreate:
                                        perm ===
                                        "create",
                                      canEdit:
                                        perm ===
                                        "edit",
                                      canDelete:
                                        perm ===
                                        "delete",
                                    },
                                  ];
                                }

                                return prev.map(
                                  (p) =>
                                    p.moduleId ===
                                    m.id
                                      ? {
                                          ...p,
                                          [key]:
                                            !p[
                                              key
                                            ],
                                        }
                                      : p
                                );
                              }
                            );
                          }}
                          className={`rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-all ${
                            active
                              ? "border-transparent bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300"
                          }`}
                        >
                          {perm}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
              ? "Update Role"
              : "Save Role"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleForm;