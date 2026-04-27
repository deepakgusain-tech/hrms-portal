"use client";

import { MovementType, Status } from "@prisma/client";
import {
  createTransferPromotion,
  updateTransferPromotion,
} from "@/lib/actions/transfer-promotion";
import { getEmployeeProfileSelectOptions } from "@/lib/actions/employee-profiles";
import { getWorkLocations } from "@/lib/actions/work-location";
import { transferPromotionDefaultValues } from "@/lib/constants";
import { transferPromotionSchema } from "@/lib/validators";
import { TransferPromotion } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
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
import { Textarea } from "../ui/textarea";

type Props = {
  data?: TransferPromotion;
  update: boolean;
};

type EmployeeOption = {
  id: string;
  employeeId?: string | null;
  employeeName: string;
  employeeCode: string;
  status?: Status;
};

type LocationOption = {
  id?: string;
  name: string;
};

const TransferPromotionForm = ({ data, update }: Props) => {
  const router = useRouter();
  const id = data?.id;

  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [locations, setLocations] = React.useState<LocationOption[]>([]);

  const form = useForm<z.infer<typeof transferPromotionSchema>>({
    resolver: zodResolver(transferPromotionSchema),
    defaultValues: data ?? transferPromotionDefaultValues,
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  useEffect(() => {
    getEmployeeProfileSelectOptions().then((records) => {
      setEmployees(records);
    });

    getWorkLocations().then((records) => {
      setLocations(records);
    });
  }, []);

  const [isPending, startTransition] = React.useTransition();

  const onSubmit: SubmitHandler<z.infer<typeof transferPromotionSchema>> =
    async (values) => {
      startTransition(async () => {
        const res =
          update && id
            ? await updateTransferPromotion(values, id)
            : await createTransferPromotion(values);

        if (!res?.success) {
          toast.error("Error", {
            description: res?.message,
          });
          return;
        }

        toast.success("Success", {
          description: res.message,
        });
        router.push("/transfer-promotion");
        router.refresh();
      });
    };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Name</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    const selectedEmployee = employees.find(
                      (employee) => employee.id === value,
                    );

                    field.onChange(selectedEmployee?.id ?? "");
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Employee name" />
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
            name="movementType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Movement Type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as MovementType)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select movement type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={MovementType.TRANSFER}>Transfer</SelectItem>
                    <SelectItem value={MovementType.PROMOTION}>Promotion</SelectItem>
                    <SelectItem value={MovementType.TRANSFER_PROMOTION}>
                      Transfer & Promotion
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fromLocationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Location</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select current location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id!}>
                        {location.name}
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
            name="toLocationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Location</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select new location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id!}>
                        {location.name}
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
            name="currentDesignation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Designation</FormLabel>
                <FormControl>
                  <Input placeholder="Enter current designation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newDesignation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Designation</FormLabel>
                <FormControl>
                  <Input placeholder="Enter new designation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effective Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as Status)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Status.ACTIVE}>Active</SelectItem>
                    <SelectItem value={Status.INACTIVE}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter reason for transfer or promotion"
                  className="min-h-28"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes"
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {update ? "Update Transfer & Promotion" : "Save Transfer & Promotion"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransferPromotionForm;
