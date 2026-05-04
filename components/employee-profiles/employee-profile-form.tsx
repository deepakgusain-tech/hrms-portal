"use client";

import { Status } from "@prisma/client";
import {
  createEmployeeProfile,
  getNextEmployeeCodePreview,
  getEmployeeProfileOptions,
  updateEmployeeProfile,
} from "@/lib/actions/employee-profiles";
import { employeeProfileDefaultValues } from "@/lib/constants";
import { employeeProfileSchema } from "@/lib/validators";
import { EmployeeProfile } from "@/types";
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
  data?: EmployeeProfile;
  update: boolean;
};

type Option = {
  id: string;
  name: string;
};

type CompanyOption = {
  id: string;
  companyName: string;
};

type EmployeeOption = {
  id: string;
  firstName: string;
  lastName: string;
};

const NONE_VALUE = "none";
const EMPLOYEE_NAME_LIST_ID = "employee-profile-list";
const EXISTING_PASSWORD_SENTINEL = "__KEEP__";

const fieldClass =
  "h-12 w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-cyan-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none";

const textAreaClass =
  "min-h-28 w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-cyan-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none";
const getEmployeeName = (employee: EmployeeOption) =>
  `${employee.firstName} ${employee.lastName}`.trim();

const normalize = (value: string) => value.trim().toLowerCase();

const EmployeeProfileForm = ({ data, update }: Props) => {
  const router = useRouter();
  const id = data?.id;

  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [departments, setDepartments] = React.useState<Option[]>([]);
  const [jobRoles, setJobRoles] = React.useState<Option[]>([]);
  const [workLocations, setWorkLocations] = React.useState<Option[]>([]);
  const [companies, setCompanies] = React.useState<CompanyOption[]>([]);

  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof employeeProfileSchema>>({
    resolver: zodResolver(employeeProfileSchema),
    defaultValues: data
      ? {
          ...data,
          password: update && data.employeeId ? EXISTING_PASSWORD_SENTINEL : "",
        }
      : employeeProfileDefaultValues,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        password: update && data.employeeId ? EXISTING_PASSWORD_SENTINEL : "",
      });
    }
  }, [data, form, update]);

  useEffect(() => {
    getEmployeeProfileOptions().then((options) => {
      setEmployees(options.employees);
      setDepartments(options.departments);
      setCompanies(options.companies);
      setJobRoles(options.jobRoles);
      setWorkLocations(options.workLocations);
    });

    if (!update) {
      getNextEmployeeCodePreview().then((code) => {
        form.setValue("employeeCode", code);
      });
    }
  }, [form, update]);

  const onSubmit: SubmitHandler<z.infer<typeof employeeProfileSchema>> = async (
    values,
  ) => {
    startTransition(async () => {
      const res =
        update && id
          ? await updateEmployeeProfile(values, id)
          : await createEmployeeProfile(values);

      if (!res?.success) {
        toast.error("Error", {
          description: res?.message,
        });
        return;
      }

      toast.success("Success", {
        description: res.message,
      });

      router.push("/employee-profiles");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Main Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="employeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Name</FormLabel>
                <FormControl>
                  <Input
                    list={EMPLOYEE_NAME_LIST_ID}
                    className={fieldClass}
                    placeholder="Enter employee name"
                    value={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    name={field.name}
                    onChange={(e) => {
                      const value = e.target.value;

                      const match = employees.find(
                        (item) =>
                          normalize(getEmployeeName(item)) === normalize(value),
                      );

                      field.onChange(value);

                      form.setValue("employeeId", match?.id ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </FormControl>

                <datalist id={EMPLOYEE_NAME_LIST_ID}>
                  {employees.map((item) => (
                    <option key={item.id} value={getEmployeeName(item)} />
                  ))}
                </datalist>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employeeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    className={fieldClass}
                    placeholder="Auto generated"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

           <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Email</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClass}
                    placeholder="Enter Email Id"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className={fieldClass}
                    placeholder="Enter password"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <Input
                  className={fieldClass}
                  placeholder="Enter phone"
                  {...field}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alternatePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Phone</FormLabel>
                <Input
                  className={fieldClass}
                  placeholder="Alternate phone"
                  {...field}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>

                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="rounded-2xl border border-indigo-100">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <Input type="date" className={fieldClass} {...field} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="joiningDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Joining Date</FormLabel>
                <Input type="date" className={fieldClass} {...field} />
              </FormItem>
            )}
          />

          {/* Company */}
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>

                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="rounded-2xl border border-indigo-100">
                    {companies.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Department */}
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>

                <Select
                  value={field.value || NONE_VALUE}
                  onValueChange={(value) =>
                    field.onChange(value === NONE_VALUE ? "" : value)
                  }
                >
                  <FormControl>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="rounded-2xl border border-indigo-100">
                    <SelectItem value={NONE_VALUE}>None</SelectItem>

                    {departments.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Job Role */}
          <FormField
            control={form.control}
            name="jobRoleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Role</FormLabel>

                <Select
                  value={field.value || NONE_VALUE}
                  onValueChange={(value) =>
                    field.onChange(value === NONE_VALUE ? "" : value)
                  }
                >
                  <FormControl>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="rounded-2xl border border-indigo-100">
                    <SelectItem value={NONE_VALUE}>None</SelectItem>

                    {jobRoles.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Work Location */}
          <FormField
            control={form.control}
            name="workLocationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Location</FormLabel>

                <Select
                  value={field.value || NONE_VALUE}
                  onValueChange={(value) =>
                    field.onChange(value === NONE_VALUE ? "" : value)
                  }
                >
                  <FormControl>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="rounded-2xl border border-indigo-100">
                    <SelectItem value={NONE_VALUE}>None</SelectItem>

                    {workLocations.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Name</FormLabel>
                <Input
                  className={fieldClass}
                  placeholder="Contact name"
                  {...field}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Phone</FormLabel>
                <Input
                  className={fieldClass}
                  placeholder="Contact phone"
                  {...field}
                />
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
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="rounded-2xl border border-indigo-100">
                    <SelectItem value={Status.ACTIVE}>Active</SelectItem>
                    <SelectItem value={Status.INACTIVE}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <Textarea
                className={textAreaClass}
                placeholder="Enter full address"
                {...field}
              />
            </FormItem>
          )}
        />

        {/* Remark */}
        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <Textarea
                className={textAreaClass}
                placeholder="Additional notes"
                {...field}
              />
            </FormItem>
          )}
        />

        {/* Submit */}
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

          {update ? "Update Employee Profile" : "Save Employee Profile"}
        </Button>
      </form>
    </Form>
  );
};

export default EmployeeProfileForm;
