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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ConfigurationForm = ({ data }: { data?: Configuration }) => {
  const router = useRouter();

  const [isPending, startTransition] = React.useTransition();

  const form = useForm<Configuration>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      name: data?.name || "",
      logo: data?.logo || "",
      favicon: data?.favicon || "",
      email: data?.email || "",
      password: data?.password || "",
    },
  });

  React.useEffect(() => {
    form.reset({
      name: data?.name || "",
      logo: data?.logo || "",
      favicon: data?.favicon || "",
      email: data?.email || "",
      password: data?.password || "",
    });
  }, [data, form]);


  function onSubmit(values: Configuration) {
    startTransition(async () => {
      try {
        const formData = new FormData();

        formData.set("id", data?.id || "");
        formData.set("currentLogo", typeof data?.logo === "string" ? data.logo : "");
        formData.set(
          "currentFavicon",
          typeof data?.favicon === "string" ? data.favicon : ""
        );
        formData.set("name", values.name || "");
        formData.set("email", values.email || "");
        formData.set("password", values.password || "");

        if (values.logo instanceof File) {
          formData.set("logo", values.logo);
        }

        if (values.favicon instanceof File) {
          formData.set("favicon", values.favicon);
        }

        const res = await createOrUpdateConfiguration(formData);

        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Manage branding and email credentials for the portal.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            encType="multipart/form-data"
          >
            <Accordion
              type="multiple"
              defaultValue={["general", "email"]}
            >
              {/* General */}
              <AccordionItem value="general">
                <AccordionTrigger>General</AccordionTrigger>

                <AccordionContent className="space-y-6">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter company name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Logo */}
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>

                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            className="cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              field.onChange(file || "");
                            }}
                          />
                        </FormControl>

                        {typeof data?.logo === "string" && data.logo ? (
                          <div className="flex items-center gap-3 rounded-md border p-3">
                            <Image
                              src={data.logo}
                              alt="Current logo"
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-md border object-cover"
                              unoptimized
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Current logo</p>
                              <p className="truncate text-xs text-muted-foreground">
                                Saved image will remain until you upload a new one.
                              </p>
                            </div>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon</FormLabel>

                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            className="cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              field.onChange(file || "");
                            }}
                          />
                        </FormControl>

                        {typeof data?.favicon === "string" && data.favicon ? (
                          <div className="flex items-center gap-3 rounded-md border p-3">
                            <Image
                              src={data.favicon}
                              alt="Current favicon"
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded border object-cover"
                              unoptimized
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Current favicon</p>
                              <p className="truncate text-xs text-muted-foreground">
                                Upload a new file only if you want to replace it.
                              </p>
                            </div>
                          </div>
                        ) : null}

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Email */}
              <AccordionItem value="email">
                <AccordionTrigger>Email</AccordionTrigger>

                <AccordionContent className="space-y-6">
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>

                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>

                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password"
                            {...field}
                          />
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
              disabled={isPending}
              className="w-full"
            >
              {isPending ? "Saving..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ConfigurationForm;
