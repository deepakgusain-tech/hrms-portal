"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Loader2,
  ArrowRight,
  User,
  Mail,
  Lock,
  BadgeCheck,
  ShieldCheck,
  FileText,
  Sparkles,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import {
  createUserSchema,
  userSchema,
} from "@/lib/validators";

import {
  createUser,
  updateUser,
} from "@/lib/actions/users";
import { getRoles } from "@/lib/actions/role";
import { Role, User as UserType } from "@/types";
import { userDefaultValues } from "@/lib/constants";
import { Status } from "@prisma/client";

const inputStyle =
  "h-12 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 hover:border-cyan-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100";

const textareaStyle =
  "min-h-36 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 hover:border-cyan-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100";

const UserForm = ({
  data,
  update = false,
}: {
  data?: UserType;
  update: boolean;
}) => {
  const router = useRouter();
  const id = data?.id;

  const currentSchema =
    update ? userSchema : createUserSchema;

  const currentData = update
    ? (({ password, ...rest }) => rest)(
        userDefaultValues
      )
    : userDefaultValues;

  const form = useForm<
    z.infer<typeof currentSchema>
  >({
    resolver: zodResolver(currentSchema),
    defaultValues: data || currentData,
  });

  const [isPending, startTransition] =
    React.useTransition();

  const [allRole, setAllRole] =
    React.useState<Role[]>([]);

  useEffect(() => {
    getRoles().then((res) => {
      setAllRole(res || []);
    });
  }, []);

  const onSubmit: SubmitHandler<
    z.infer<typeof currentSchema>
  > = async (values) => {
    startTransition(async () => {
      let res;

      if (update && id) {
        res = await updateUser(values, id);
      } else {
        res = await createUser(values);
      }

      if (!res?.success) {
        toast.error("Error", {
          description: res?.message,
        });
      } else {
        router.push("/users");
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">
                  Username
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                    <Input
                      placeholder="Enter username"
                      className={`${inputStyle} pl-11`}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                    <Input
                      placeholder="Enter email"
                      className={`${inputStyle} pl-11`}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          {!update && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                      <Input
                        type="password"
                        placeholder="Enter password"
                        className={`${inputStyle} pl-11`}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter first name"
                    className={inputStyle}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter last name"
                    className={inputStyle}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">
                  Role
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className={`${inputStyle} w-full px-4`}
                  >
                    <option value="" hidden>
                      Select Role
                    </option>

                    {allRole.map((role) => (
                      <option
                        key={role.id}
                        value={role.id}
                      >
                        {role.name}
                      </option>
                    ))}
                  </select>
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

        {/* Remark */}
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
                    placeholder="Additional notes"
                    className={`${textareaStyle} pl-11`}
                    {...field}
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role Preview Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              User Access Setup
            </h3>
          </div>

          <p className="text-sm text-slate-500">
            Assign the correct role and status
            for secure access management.
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
              ? "Update User"
              : "Save User"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;