"use client";

import { ExperienceType, Status } from "@prisma/client";
import {
  createEmployeeDocument,
  updateEmployeeDocument,
} from "@/lib/actions/employee-documents";
import { getEmployeeProfileSelectOptions } from "@/lib/actions/employee-profiles";
import { employeeDocumentDefaultValues } from "@/lib/constants";
import { employeeDocumentSchema } from "@/lib/validators";
import { EmployeeDocument } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
  FieldPath,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
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
  data?: EmployeeDocument;
  update: boolean;
};

type EmployeeOption = {
  id: string;
  employeeName: string;
  employeeCode: string;
};

const experienceFileFields = [
  { name: "experienceLetterFileUrl", label: "Experience Letter Upload" },
  { name: "salarySlip1FileUrl", label: "Salary Slip 1 Upload" },
  { name: "salarySlip2FileUrl", label: "Salary Slip 2 Upload" },
  { name: "salarySlip3FileUrl", label: "Salary Slip 3 Upload" },
] as const;

const createEducationEntry = () => ({
  degree: "",
  college: "",
  year: "",
  marks: undefined,
  marksheetFileUrl: "",
});

const createExperienceEntry = () => ({
  totalExperience: "",
  previousCompanyName: "",
  experienceLetterFileUrl: "",
  salarySlip1FileUrl: "",
  salarySlip2FileUrl: "",
  salarySlip3FileUrl: "",
});

type EmployeeDocumentFormInput = z.input<typeof employeeDocumentSchema>;
type EmployeeDocumentFormValues = z.output<typeof employeeDocumentSchema>;

type ImageFieldPath = Extract<
  FieldPath<EmployeeDocumentFormInput>,
  | "aadhaarFileUrl"
  | "panFileUrl"
  | `educationEntries.${number}.marksheetFileUrl`
  | `experienceEntries.${number}.experienceLetterFileUrl`
  | `experienceEntries.${number}.salarySlip1FileUrl`
  | `experienceEntries.${number}.salarySlip2FileUrl`
  | `experienceEntries.${number}.salarySlip3FileUrl`
>;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

const EmployeeDocumentForm = ({ data, update }: Props) => {
  const router = useRouter();
  const id = data?.id;

  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<
    EmployeeDocumentFormInput,
    unknown,
    EmployeeDocumentFormValues
  >({
    resolver: zodResolver(employeeDocumentSchema),
    defaultValues: (data ??
      employeeDocumentDefaultValues) as EmployeeDocumentFormInput,
  });

  const experienceType = useWatch({
    control: form.control,
    name: "experienceType",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: "educationEntries",
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
    replace: replaceExperience,
  } = useFieldArray({
    control: form.control,
    name: "experienceEntries",
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
  }, []);

  useEffect(() => {
    if (!educationFields.length) {
      appendEducation(createEducationEntry());
    }
  }, [educationFields.length, appendEducation]);

  useEffect(() => {
    if (experienceType === ExperienceType.EXPERIENCED) {
      if (!experienceFields.length) {
        appendExperience(createExperienceEntry());
      }
      return;
    }

    replaceExperience([]);
  }, [
    experienceType,
    experienceFields.length,
    appendExperience,
    replaceExperience,
  ]);

  const onSubmit: SubmitHandler<EmployeeDocumentFormValues> = async (
    values,
  ) => {
    startTransition(async () => {
      const res =
        update && id
          ? await updateEmployeeDocument(values, id)
          : await createEmployeeDocument(values);

      if (!res.success) {
        toast.error("Error", {
          description: res.message,
        });
        return;
      }

      toast.success("Success", {
        description: res.message,
      });

      router.push("/employee-documents");
      router.refresh();
    });
  };

  const renderImageUploadField = (name: ImageFieldPath, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>

          <FormControl>
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    const base64 = await readFileAsDataUrl(file);
                    field.onChange(base64);
                  } catch {
                    toast.error("Unable to read file");
                  }
                }}
              />

              {field.value ? (
                <div className="space-y-2">
                  <Image
                    src={field.value}
                    alt={label}
                    width={200}
                    height={120}
                    unoptimized
                    className="h-32 w-full rounded-md border object-cover md:w-48"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange("")}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : null}
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Employee Basic */}
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
                    const selected = employees.find(
                      (item) => item.id === value,
                    );

                    field.onChange(value);

                    form.setValue("employeeCode", selected?.employeeCode ?? "");
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {employees.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.employeeName}
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
            name="employeeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                  <Input readOnly {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Documents Card */}
        <div className="rounded-xl border p-4 space-y-4">
          <h3 className="text-lg font-semibold">Documents</h3>

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="aadhaarNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhaar Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Aadhaar Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderImageUploadField("aadhaarFileUrl", "Aadhaar Upload")}

            <FormField
              control={form.control}
              name="panNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter PAN Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderImageUploadField("panFileUrl", "PAN Upload")}
          </div>
        </div>

        {/* Education */}
        <div className="rounded-xl border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Education Details</h3>

            <Button
              type="button"
              variant="outline"
              onClick={() => appendEducation(createEducationEntry())}
            >
              +
            </Button>
          </div>

          {educationFields.map((item, index) => (
            <div key={item.id} className="rounded-xl border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Education {index + 1}</h4>

                {educationFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeEducation(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`educationEntries.${index}.degree`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <FormControl>
                        <Input placeholder="B.Tech / MBA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`educationEntries.${index}.college`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <FormControl>
                        <Input placeholder="College name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`educationEntries.${index}.year`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input placeholder="2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`educationEntries.${index}.marks`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={
                            typeof field.value === "number" ||
                            typeof field.value === "string"
                              ? field.value
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  {renderImageUploadField(
                    `educationEntries.${index}.marksheetFileUrl`,
                    "Marksheet Upload",
                  )}

                  <p className="text-sm text-muted-foreground">
                    Note: Convert all marksheets into one PDF, then upload it
                    here.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Experience Type */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="experienceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Type</FormLabel>

                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as ExperienceType)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value={ExperienceType.FRESHER}>
                      Fresher
                    </SelectItem>

                    <SelectItem value={ExperienceType.EXPERIENCED}>
                      Experienced
                    </SelectItem>
                  </SelectContent>
                </Select>

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
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
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

        {/* Experience Cards */}
        {experienceType === ExperienceType.EXPERIENCED && (
          <div className="rounded-xl border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Previous Experience</h3>

              <Button
                type="button"
                variant="outline"
                onClick={() => appendExperience(createExperienceEntry())}
              >
                +
              </Button>
            </div>

            {experienceFields.map((item, index) => (
              <div key={item.id} className="rounded-xl border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Experience {index + 1}</h4>

                  {experienceFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeExperience(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`experienceEntries.${index}.totalExperience`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Experience</FormLabel>
                        <FormControl>
                          <Input placeholder="2 Years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experienceEntries.${index}.previousCompanyName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Infosys" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {experienceFileFields.map((file) => (
                    <React.Fragment key={`${file.name}-${item.id}`}>
                      {renderImageUploadField(
                        `experienceEntries.${index}.${file.name}`,
                        file.label,
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remark */}
        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional Notes"
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}

          {update ? "Update Employee Document" : "Save Employee Document"}
        </Button>
      </form>
    </Form>
  );
};

export default EmployeeDocumentForm;
