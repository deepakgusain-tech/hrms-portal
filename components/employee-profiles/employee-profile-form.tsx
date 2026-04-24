"use client";

import { Status } from "@/app/generated/prisma/client";
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
const EMPLOYEE_NAME_LIST_ID = "employee-profile-employee-names";
const EXISTING_PASSWORD_SENTINEL = "__KEEP__";

const getEmployeeName = (employee: EmployeeOption) =>
  `${employee.firstName} ${employee.lastName}`.trim();

const normalizeEmployeeName = (name: string) => name.trim().toLowerCase();

const EmployeeProfileForm = ({ data, update }: Props) => {
  const router = useRouter();
  const id = data?.id;
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [departments, setDepartments] = React.useState<Option[]>([]);
  const [jobRoles, setJobRoles] = React.useState<Option[]>([]);
  const [workLocations, setWorkLocations] = React.useState<Option[]>([]);
  const [companies, setCompanies] = React.useState<CompanyOption[]>([]);

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
      getNextEmployeeCodePreview().then((employeeCode) => {
        form.setValue("employeeCode", employeeCode);
      });
    }
  }, [form, update]);

  const [isPending, startTransition] = React.useTransition();

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
      console.log("submitted", values);
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
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="employeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Name</FormLabel>
                <FormControl>
                  <Input
                    list={EMPLOYEE_NAME_LIST_ID}
                    name={field.name}
                    onBlur={field.onBlur}
                    placeholder="Enter employee name"
                    ref={field.ref}
                    value={field.value}
                    onChange={(event) => {
                      const value = event.target.value;
                      const matchedEmployee = employees.find(
                        (employee) =>
                          normalizeEmployeeName(getEmployeeName(employee)) ===
                          normalizeEmployeeName(value),
                      );

                      field.onChange(value);
                      form.setValue("employeeId", matchedEmployee?.id ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </FormControl>
                <datalist id={EMPLOYEE_NAME_LIST_ID}>
                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={getEmployeeName(employee)}
                    />
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
                    placeholder="Auto generated (emp-001)"
                    readOnly
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
                    placeholder="Enter password"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alternatePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter alternate phone" {...field} />
                </FormControl>
                <FormMessage />
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="joiningDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Joining Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.companyName}
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {jobRoles.map((jobRole) => (
                      <SelectItem key={jobRole.id} value={jobRole.id}>
                        {jobRole.name}
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select work location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {workLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
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
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter emergency contact name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergencyContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter emergency contact phone"
                    {...field}
                  />
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter full address"
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
            {update ? "Update Employee Profile" : "Save Employee Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmployeeProfileForm;
