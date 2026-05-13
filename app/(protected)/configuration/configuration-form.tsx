"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Configuration } from "@/types";
import { configurationSchema } from "@/lib/validators";
import { createOrUpdateConfiguration } from "@/lib/actions/configuration";

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
import { Checkbox } from "@/components/ui/checkbox";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Building2,
  Mail,
  Lock,
  Loader2,
  Save,
  Server,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const inputStyle =
  "h-12 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 hover:border-cyan-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100";

const fileStyle =
  "h-12 cursor-pointer rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:border-cyan-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100";

const ConfigurationForm = ({
  data,
  canEdit = true,
}: {
  data?: Configuration;
  canEdit?: boolean;
}) => {
  const router = useRouter();

  const [isPending, startTransition] =
    React.useTransition();

  const form = useForm<Configuration>({
    resolver: zodResolver(
      configurationSchema
    ),
    defaultValues: {
      name: data?.name || "",
      logo: data?.logo || "",
      favicon: data?.favicon || "",
      email: data?.email || "",
      password: data?.password || "",
      smtpHost: data?.smtpHost || "",
      smtpPort: data?.smtpPort || 465,
      smtpSecure: data?.smtpSecure ?? true,
      smtpFromName: data?.smtpFromName || "",
    },
  });

  React.useEffect(() => {
    form.reset({
      name: data?.name || "",
      logo: data?.logo || "",
      favicon: data?.favicon || "",
      email: data?.email || "",
      password: data?.password || "",
      smtpHost: data?.smtpHost || "",
      smtpPort: data?.smtpPort || 465,
      smtpSecure: data?.smtpSecure ?? true,
      smtpFromName: data?.smtpFromName || "",
    });
  }, [data, form]);

  function onSubmit(values: Configuration) {
    startTransition(async () => {
      try {
        const formData = new FormData();

        formData.set(
          "id",
          data?.id || ""
        );

        formData.set(
          "currentLogo",
          typeof data?.logo === "string"
            ? data.logo
            : ""
        );

        formData.set(
          "currentFavicon",
          typeof data?.favicon === "string"
            ? data.favicon
            : ""
        );

        formData.set(
          "name",
          values.name || ""
        );

        formData.set(
          "email",
          values.email || ""
        );

        formData.set(
          "password",
          values.password || ""
        );

        formData.set(
          "smtpHost",
          values.smtpHost || ""
        );

        formData.set(
          "smtpPort",
          values.smtpPort
            ? String(values.smtpPort)
            : ""
        );

        formData.set(
          "smtpSecure",
          String(values.smtpSecure ?? true)
        );

        formData.set(
          "smtpFromName",
          values.smtpFromName || ""
        );

        if (values.logo instanceof File) {
          formData.set(
            "logo",
            values.logo
          );
        }

        if (
          values.favicon instanceof File
        ) {
          formData.set(
            "favicon",
            values.favicon
          );
        }

        const res =
          await createOrUpdateConfiguration(
            formData
          );

        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(
          "Something went wrong"
        );
      }
    });
  }

  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Configuration
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage branding and email
          credentials for your portal.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            onSubmit
          )}
          className="space-y-6"
          encType="multipart/form-data"
        >
          <Accordion
            type="multiple"
            defaultValue={[
              "general",
              "email",
            ]}
            className="space-y-4"
          >
            {/* General */}
            <AccordionItem
              value="general"
              className="rounded-2xl border border-slate-200 bg-white px-4"
            >
              <AccordionTrigger className="text-base font-semibold text-slate-700">
                General Settings
              </AccordionTrigger>

              <AccordionContent className="space-y-6 pt-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Company Name
                      </FormLabel>

                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                          <Input
                            placeholder="Enter company name"
                            disabled={
                              !canEdit
                            }
                            className={`${inputStyle} pl-11`}
                            {...field}
                          />
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Logo */}
                <FormField
                  control={form.control}
                  name="logo"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Logo
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={
                            !canEdit
                          }
                          className={
                            fileStyle
                          }
                          onChange={(
                            e
                          ) => {
                            const file =
                              e
                                .target
                                .files?.[0];
                            field.onChange(
                              file ||
                                ""
                            );
                          }}
                        />
                      </FormControl>

                      {typeof data?.logo ===
                        "string" &&
                      data.logo ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <Image
                            src={
                              data.logo
                            }
                            alt="Logo"
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-xl border object-cover"
                            unoptimized
                          />

                          <p className="text-sm text-slate-600">
                            Current
                            logo
                          </p>
                        </div>
                      ) : null}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Favicon */}
                <FormField
                  control={form.control}
                  name="favicon"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Favicon
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={
                            !canEdit
                          }
                          className={
                            fileStyle
                          }
                          onChange={(
                            e
                          ) => {
                            const file =
                              e
                                .target
                                .files?.[0];
                            field.onChange(
                              file ||
                                ""
                            );
                          }}
                        />
                      </FormControl>

                      {typeof data?.favicon ===
                        "string" &&
                      data.favicon ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <Image
                            src={
                              data.favicon
                            }
                            alt="Favicon"
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded border object-cover"
                            unoptimized
                          />

                          <p className="text-sm text-slate-600">
                            Current
                            favicon
                          </p>
                        </div>
                      ) : null}

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Email */}
            <AccordionItem
              value="email"
              className="rounded-2xl border border-slate-200 bg-white px-4"
            >
              <AccordionTrigger className="text-base font-semibold text-slate-700">
                Email Settings
              </AccordionTrigger>

              <AccordionContent className="space-y-6 pt-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                      </FormLabel>

                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                          <Input
                            type="email"
                            placeholder="Enter email"
                            disabled={
                              !canEdit
                            }
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Password
                      </FormLabel>

                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                          <Input
                            type="password"
                            placeholder="Enter password"
                            disabled={
                              !canEdit
                            }
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
                  name="smtpHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Server className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                          <Input
                            placeholder="smtp.example.com"
                            disabled={!canEdit}
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
                  name="smtpPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Port</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                          <Input
                            type="number"
                            min={1}
                            placeholder="465"
                            disabled={!canEdit}
                            className={`${inputStyle} pl-11`}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpSecure"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? true}
                            disabled={!canEdit}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="m-0">Use SSL/TLS</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpFromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserRound className="absolute left-4 top-4 h-4 w-4 text-cyan-500" />
                          <Input
                            placeholder="HRMS Portal"
                            disabled={!canEdit}
                            className={`${inputStyle} pl-11`}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            type="submit"
            disabled={
              isPending ||
              !canEdit
            }
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md transition-all hover:scale-[1.01] hover:shadow-xl"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}

            {!canEdit
              ? "Read Only"
              : isPending
              ? "Saving..."
              : "Save Configuration"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ConfigurationForm;
