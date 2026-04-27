"use client";

import { moduleSchema } from "@/lib/validators";
import { Module, Role } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "../ui/textarea";
import { createModule, updateModule } from "@/lib/actions/module-action";
import { Status } from "@prisma/client";

type Props = {
  data?: Module;
  update: boolean;
};

const ModuleForm = ({ data, update = false }: Props) => {
  const router = useRouter();
  const id = data?.id;

  const form = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: data
      ? {
          name: data.name,
          description: data.description,
          route: data.route || "",
          status: data.status,
        }
      : {
          name: "",
          description: "",
          route: "",
          status: Status.ACTIVE,
        },
  });

  const [isPending, startTransition] = React.useTransition();

  const onSubmit: SubmitHandler<z.infer<typeof moduleSchema>> = async (
    values: any,
  ) => {
    startTransition(async () => {
      let res;

      if (update && id) {
        res = await updateModule(values, id);
      } else {
        res = await createModule(values);
      }

      if (!res?.success) {
        toast.error("Error", {
          description: res?.message,
        });
      } else {
        router.push("/module");
      }
    });
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof moduleSchema>,
                  "name"
                >;
              }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/*  Status   */}
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="status"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof moduleSchema>,
                  "status"
                >;
              }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as Status)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Status.ACTIVE}>Active</SelectItem>
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
        </div>
        {/*  Description   */}
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof moduleSchema>,
                "description"
              >;
            }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={20}
                    className="h-40"
                    placeholder="Enter description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="cursor-pointer" disabled={isPending}>
            {isPending ? (
              <Loader className="w-4 h-4 animate-spin cursor-pointer" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}{" "}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ModuleForm;
