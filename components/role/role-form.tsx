"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

import { roleSchema } from "@/lib/validators";
import { roleDefaultValues } from "@/lib/constants";
import { createRole, updateRole } from "@/lib/actions/role";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { Module } from "@/types";
import { Status } from "@prisma/client";

const RoleForm = ({ data, update = false, modules }: { data?: any; update: boolean; modules: Module[] }) => {

  const router = useRouter();
  const id = data?.id;

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: data || roleDefaultValues,
  });

  const [isPending, startTransition] = React.useTransition();

  const [selectedModules, setSelectedModules] = React.useState<any[]>(update ? data.roleModules : []);

  const onSubmit: SubmitHandler<z.infer<typeof roleSchema>> = (values: any) => {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Role Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter role name" {...field} />
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
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select {...field} className="border rounded px-3 py-2 w-full">
                    <option value={Status.ACTIVE}>Active</option>
                    <option value={Status.INACTIVE}>Inactive</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Remark */}
        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Textarea
                  className="h-40"
                  placeholder="Enter Notes"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3">
          <FormLabel>Assign Modules & Permissions</FormLabel>

          {/* ✅ 3 MODULES PER ROW */}
          <div className="grid grid-cols-3 gap-4">
            {modules.map((m) => {
              const selected = selectedModules.find(
                (sm) => sm.moduleId === m.id,
              );

              return (
                <div key={m.id} className="border rounded-md p-3">
                  {/* MODULE NAME */}
                  <div className="font-medium mb-3 text-left">{m.name}</div>

                  {/* ✅ HORIZONTAL PERMISSIONS */}
                  <div className="flex flex-wrap gap-3 justify-left text-spacebetween">
                    {["view", "create", "edit", "delete"].map((perm) => {
                      const key =
                        "can" + perm.charAt(0).toUpperCase() + perm.slice(1);

                      return (
                        <label key={perm} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={selected?.[key] || false}
                            onChange={() => {
                              setSelectedModules((prev) => {
                                const exists = prev.find(
                                  (p) => p.moduleId === m.id,
                                );

                                if (!exists) {
                                  return [
                                    ...prev,
                                    {
                                      moduleId: m.id,
                                      canView: perm === "view",
                                      canCreate: perm === "create",
                                      canEdit: perm === "edit",
                                      canDelete: perm === "delete",
                                    },
                                  ];
                                }

                                return prev.map((p) =>
                                  p.moduleId === m.id
                                    ? {
                                      ...p,
                                      [key]: !p[key],
                                    }
                                    : p,
                                );
                              });
                            }}
                          />
                          {perm}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            Save Role
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleForm;
