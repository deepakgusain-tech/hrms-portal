"use client";

import { ExperienceType } from "@prisma/client";
import {
  createEmployeeDocument,
  updateEmployeeDocument,
} from "@/lib/actions/employee-documents";
import { employeeDocumentDefaultValues } from "@/lib/constants";
import {
  DOCUMENT_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_ACCEPT,
  MAX_DOCUMENT_UPLOAD_SIZE_BYTES,
  isAllowedUploadFile,
  isImagePreviewUrl,
} from "@/lib/document-uploads";
import { employeeDocumentSchema } from "@/lib/validators";
import { EmployeeDocument } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Loader2,
  Upload,
  Trash2,
  GraduationCap,
  Briefcase,
  User,
  IdCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
  FieldPath,
  SubmitHandler,
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
  redirectTo?: string;
  mode?: "applicant" | "applicant-self" | "employee";
  selectedCandidates?: SelectedInterviewCandidateOption[];
  initialSelectedInterviewApplicantId?: string;
  showApplicantSelection?: boolean;
};

type SelectedInterviewCandidateOption = {
  applicantId: string;
  requestId: string;
  interviewId: string;
  candidateName: string;
  profilePost: string;
  email: string;
  mobileNumber: string;
  skillsLevel: string;
  totalExperience: string;
  relevantExperience: string;
  qualification: string;
  sourceInterviewApplicantId: string;
};

const fieldClass =
  "h-12 w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-cyan-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none";

const textAreaClass =
  "min-h-28 w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-cyan-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none";

const requiredLabel = (label: string): React.ReactNode => (
  <span>
    {label}
    <span className="ml-1 text-rose-500">*</span>
  </span>
);

type InputType = z.input<typeof employeeDocumentSchema>;
type OutputType = z.output<typeof employeeDocumentSchema>;

type UploadState = {
  uploading: boolean;
  progress: number;
  error: string;
  fileName: string;
  mimeType: string;
};

type UploadResponse = {
  success: boolean;
  url?: string;
  mimeType?: string;
  originalName?: string;
  message?: string;
};

type UploadedFileResponse = {
  success: true;
  url: string;
  mimeType?: string;
  originalName?: string;
};

const defaultUploadState: UploadState = {
  uploading: false,
  progress: 0,
  error: "",
  fileName: "",
  mimeType: "",
};

function getUploadErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to upload file";
}

function uploadFileToStorage(
  file: File,
  onProgress: (progress: number) => void,
): Promise<UploadedFileResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads");
    xhr.responseType = "text";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }

      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      const responseText = xhr.responseText || "{}";

      let payload: UploadResponse;
      try {
        payload = JSON.parse(responseText) as UploadResponse;
      } catch {
        reject(new Error("Upload service returned an invalid response"));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || !payload.success || !payload.url) {
        reject(
          new Error(payload.message || "Unable to upload file"),
        );
        return;
      }

      const url = payload.url;
      resolve({
        success: true,
        url,
        mimeType: payload.mimeType,
        originalName: payload.originalName,
      });
    };

    xhr.onerror = () => reject(new Error("Network error while uploading file"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

const EmployeeDocumentForm = ({
  data,
  update,
  redirectTo = "/employee-documents",
  mode = "applicant",
  selectedCandidates = [],
  initialSelectedInterviewApplicantId,
}: Props) => {
  const router = useRouter();
  const id = data?.id;

  const [isPending, startTransition] = React.useTransition();
  const [uploadStates, setUploadStates] = React.useState<
    Record<string, UploadState>
  >({});

  const form = useForm<InputType, unknown, OutputType>({
    resolver: zodResolver(employeeDocumentSchema),
    defaultValues: (data ?? {
      ...employeeDocumentDefaultValues,
    }) as InputType,
  });

  const experienceType = useWatch({
    control: form.control,
    name: "experienceType",
  });
  const selectedInterviewApplicantId = useWatch({
    control: form.control,
    name: "sourceInterviewApplicantId",
  });
  const selectedInterviewCandidate = selectedCandidates.find(
    (item) => item.sourceInterviewApplicantId === selectedInterviewApplicantId,
  );

  const setUploadState = (
    fieldName: string,
    patch: Partial<UploadState>,
  ) => {
    setUploadStates((current) => ({
      ...current,
      [fieldName]: {
        ...defaultUploadState,
        ...(current[fieldName] ?? {}),
        ...patch,
      },
    }));
  };

  const clearUploadState = (fieldName: string) => {
    setUploadStates((current) => {
      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  };

  const uploadDocumentFile = async (
    fieldName: FieldPath<InputType>,
    statusName: FieldPath<InputType>,
    labelText: string,
    onUrlChange: (url: string) => void,
    file: File,
    accept: string,
  ) => {
    form.clearErrors(fieldName);

    if (file.size > MAX_DOCUMENT_UPLOAD_SIZE_BYTES) {
      const message = `File size must be ${Math.floor(
        MAX_DOCUMENT_UPLOAD_SIZE_BYTES / (1024 * 1024),
      )}MB or smaller.`;
      form.setError(fieldName, { type: "manual", message });
      toast.error(message);
      return;
    }

    if (!isAllowedUploadFile(file, accept)) {
      const message = accept.includes("application/pdf")
        ? "Unsupported file type. Please upload an image or PDF."
        : "Unsupported file type. Please upload an image.";
      form.setError(fieldName, { type: "manual", message });
      toast.error(message);
      return;
    }

    setUploadState(fieldName, {
      uploading: true,
      progress: 0,
      error: "",
      fileName: file.name,
      mimeType: file.type,
    });

    try {
      const uploaded = await uploadFileToStorage(file, (progress) => {
        setUploadState(fieldName, {
          uploading: true,
          progress,
          error: "",
          fileName: file.name,
          mimeType: file.type,
        });
      });

      onUrlChange(uploaded.url);
      form.setValue(statusName, "PENDING_REVIEW" as never, {
        shouldDirty: true,
      });
      form.clearErrors(fieldName);
      setUploadState(fieldName, {
        uploading: false,
        progress: 100,
        error: "",
        fileName: uploaded.originalName || file.name,
        mimeType: uploaded.mimeType || file.type,
      });
      toast.success(`${labelText} uploaded successfully`);
    } catch (error) {
      const message = getUploadErrorMessage(error);
      setUploadState(fieldName, {
        uploading: false,
        progress: 0,
        error: message,
        fileName: file.name,
        mimeType: file.type,
      });
      form.setError(fieldName, { type: "manual", message });
      toast.error(message);
    }
  };

  useEffect(() => {
    if (data) form.reset(data);
  }, [data, form]);

  useEffect(() => {
    if (mode !== "applicant" || update || !selectedCandidates.length) {
      return;
    }

    form.setValue("documentContext", "ONBOARDING");

    const applicantId =
      initialSelectedInterviewApplicantId ||
      selectedCandidates[0]?.sourceInterviewApplicantId ||
      "";
    if (!applicantId) {
      return;
    }

    form.setValue("sourceInterviewApplicantId", applicantId);
  }, [
    form,
    initialSelectedInterviewApplicantId,
    mode,
    selectedCandidates,
    update,
  ]);

  useEffect(() => {
    if (mode !== "applicant" || !selectedInterviewCandidate) {
      return;
    }

    form.setValue("applicantId", selectedInterviewCandidate.applicantId);
    form.setValue("applicantCode", selectedInterviewCandidate.requestId);
    form.setValue("candidateName", selectedInterviewCandidate.candidateName);
    form.setValue("appliedPosition", selectedInterviewCandidate.profilePost);
    form.setValue("email", selectedInterviewCandidate.email);
    form.setValue("mobileNumber", selectedInterviewCandidate.mobileNumber);
    form.setValue("skillsLevel", selectedInterviewCandidate.skillsLevel);
    form.setValue(
      "totalExperience",
      selectedInterviewCandidate.totalExperience,
    );
    form.setValue(
      "relevantExperience",
      selectedInterviewCandidate.relevantExperience,
    );
    form.setValue("qualification", selectedInterviewCandidate.qualification);
  }, [form, mode, selectedInterviewCandidate]);

  useEffect(() => {
    if (mode === "employee") {
      return;
    }

    form.setValue("documentContext", "ONBOARDING");
  }, [form, mode]);

  const saveApplicantDocument = async (values: OutputType) => {
    console.log("FORM VALUES");
    console.log(values);

    const endpoint = update && id
      ? `/api/applicant-documents/${id}`
      : "/api/applicant-documents";

    console.log("ENDPOINT:", endpoint);
    console.log("METHOD:", update && id ? "PUT" : "POST");  

    const response = await fetch(endpoint, {
      method: update && id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    console.log("STATUS:", response.status);

    const result = await response.json();

    console.log("API RESPONSE:");
    console.log(result);

    if (!result.success) {
      throw new Error(result.message || "Unable to save applicant document");
    }

    return result as { success: true; message: string };
  };

  const hasUploadingFiles = Object.values(uploadStates).some(
    (state) => state.uploading,
  );

  const onSubmit: SubmitHandler<OutputType> = async (values) => {
    startTransition(async () => {
      try {
        const res =
          mode === "employee"
            ? update && id
              ? await updateEmployeeDocument(values, id)
              : await createEmployeeDocument(values)
            : await saveApplicantDocument(values);

        if (!res.success) {
          toast.error(res.message);
          return;
        }

        toast.success(res.message);
        router.push(redirectTo);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to save document",
        );
      }
    });
  };

  const renderDocumentUpload = (
    name: FieldPath<InputType>,
    statusName: FieldPath<InputType>,
    label: React.ReactNode,
    accept = DOCUMENT_UPLOAD_ACCEPT,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const fileUrl = typeof field.value === "string" ? field.value : "";
        const uploadState = uploadStates[name] ?? defaultUploadState;
        const isImage =
          uploadState.mimeType.startsWith("image/") ||
          isImagePreviewUrl(fileUrl);
        const altText = typeof label === "string" ? label : "Uploaded document";
        const labelText = typeof label === "string" ? label : altText;

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50 px-4 py-4 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100">
                  <Upload className="h-4 w-4" />
                  {uploadState.uploading
                    ? `Uploading ${uploadState.progress}%`
                    : "Upload File"}
                  <input
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;

                      await uploadDocumentFile(
                        name,
                        statusName,
                        labelText,
                        field.onChange,
                        file,
                        accept,
                      );
                    }}
                  />
                </label>

                {uploadState.uploading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{uploadState.fileName || "Uploading file"}</span>
                      <span>{uploadState.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                {uploadState.error ? (
                  <p className="text-sm text-rose-600">{uploadState.error}</p>
                ) : null}

                {fileUrl ? (
                  <div className="space-y-2">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fileUrl}
                        alt={altText}
                        className="h-36 w-full rounded-2xl border object-cover md:w-56"
                      />
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-700"
                      >
                        <FileText className="h-4 w-4" />
                        Open uploaded file
                      </a>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        field.onChange("");
                        clearUploadState(String(name));
                        form.clearErrors(name);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : null}
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Personal Information
                  </h3>
                </div>
                <p className="mb-4 text-sm text-slate-500">
                  Fields marked with <span className="text-rose-500">*</span>{" "}
                  are required.
                </p>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="candidateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Full Name")}</FormLabel>
                        <FormControl>
                          <Input
                            className={fieldClass}
                            placeholder="Enter full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Date of Birth")}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className={fieldClass}
                            {...field}
                            value={(field.value as string | undefined) ?? ""}
                          />
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
                        <FormLabel>{requiredLabel("Gender")}</FormLabel>
                        <Select
                          value={(field.value as string | undefined) ?? ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className={fieldClass}>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "Male",
                              "Female",
                              "Other",
                              "Prefer not to say",
                            ].map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {requiredLabel("Personal Email Address")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            className={fieldClass}
                            placeholder="Enter personal email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Mobile Number")}</FormLabel>
                        <FormControl>
                          <Input
                            className={fieldClass}
                            placeholder="Enter mobile number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Marital Status")}</FormLabel>
                        <Select
                          value={(field.value as string | undefined) ?? ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className={fieldClass}>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "Single",
                              "Married",
                              "Divorced",
                              "Widowed",
                              "Separated",
                              "Other",
                            ].map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Nationality")}</FormLabel>
                        <FormControl>
                          <Input
                            className={fieldClass}
                            placeholder="Enter nationality"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2 xl:col-span-3">
                    {renderDocumentUpload(
                      "passportPhotoFileUrl",
                      "passportPhotoStatus",
                      requiredLabel("Passport Size Photograph"),
                      IMAGE_UPLOAD_ACCEPT,
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <IdCard className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Identity Verification
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="aadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {requiredLabel("Aadhaar Card Number")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={fieldClass}
                            placeholder="Enter Aadhaar number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {renderDocumentUpload(
                    "aadhaarFileUrl",
                    "aadhaarStatus",
                    requiredLabel("Aadhaar Card"),
                  )}
                  <FormField
                    control={form.control}
                    name="panNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {requiredLabel("PAN Card Number")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={fieldClass}
                            placeholder="Enter PAN number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {renderDocumentUpload(
                    "panFileUrl",
                    "panStatus",
                    requiredLabel("PAN Card"),
                  )}
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "passportFileUrl",
                      "passportStatus",
                      "Passport",
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "drivingLicenseFileUrl",
                      "drivingLicenseStatus",
                      "Driving License",
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "voterIdFileUrl",
                      "voterIdStatus",
                      "Voter ID",
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <IdCard className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Address Information
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="currentAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {requiredLabel("Current Address")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className={textAreaClass}
                            {...field}
                            value={(field.value as string | undefined) ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanentAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {requiredLabel("Permanent Address")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className={textAreaClass}
                            {...field}
                            value={(field.value as string | undefined) ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("City")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("State")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Postal Code")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "addressProofFileUrl",
                      "addressProofStatus",
                      requiredLabel("Address Proof"),
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Educational Details
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="highestQualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {requiredLabel("Highest Qualification")}
                        </FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="institutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {requiredLabel("Institution Name")}
                        </FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="passingYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Passing Year")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "class10MarksheetFileUrl",
                      "class10MarksheetStatus",
                      requiredLabel("Class 10 Certificate / Marksheet"),
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "class12MarksheetFileUrl",
                      "class12MarksheetStatus",
                      requiredLabel("Class 12 Certificate / Marksheet"),
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "highestQualificationFileUrl",
                      "highestQualificationStatus",
                      requiredLabel(
                        "Highest Qualification Degree / Certificate",
                      ),
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "additionalDegreesFileUrl",
                      "additionalDegreesStatus",
                      "Additional Degrees",
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "professionalCertificationsFileUrl",
                      "professionalCertificationsStatus",
                      "Professional Certifications",
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Employment Details
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="experienceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Candidate Type")}</FormLabel>
                        <Select
                          value={(field.value as string | undefined) ?? ""}
                          onValueChange={(value) =>
                            field.onChange(value as ExperienceType)
                          }
                        >
                          <FormControl>
                            <SelectTrigger className={fieldClass}>
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
                  {experienceType === ExperienceType.EXPERIENCED ? (
                    <FormField
                      control={form.control}
                      name="uanNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{requiredLabel("UAN Number")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                  {experienceType === ExperienceType.EXPERIENCED ? (
                    <div className="md:col-span-2">
                      {renderDocumentUpload(
                        "experienceLetterFileUrl",
                        "experienceLetterStatus",
                        requiredLabel("Experience Letter"),
                      )}
                    </div>
                  ) : null}
                  {experienceType === ExperienceType.EXPERIENCED ? (
                    <div className="md:col-span-2">
                      {renderDocumentUpload(
                        "relievingLetterFileUrl",
                        "relievingLetterStatus",
                        requiredLabel("Relieving Letter"),
                      )}
                    </div>
                  ) : null}
                  {experienceType === ExperienceType.EXPERIENCED ? (
                    <>
                      <div className="md:col-span-2">
                        {renderDocumentUpload(
                          "salarySlip1FileUrl",
                          "salarySlipsStatus",
                          requiredLabel("Salary Slip 1"),
                        )}
                      </div>
                      <div className="md:col-span-2">
                        {renderDocumentUpload(
                          "salarySlip2FileUrl",
                          "salarySlipsStatus",
                          requiredLabel("Salary Slip 2"),
                        )}
                      </div>
                      <div className="md:col-span-2">
                        {renderDocumentUpload(
                          "salarySlip3FileUrl",
                          "salarySlipsStatus",
                          requiredLabel("Salary Slip 3"),
                        )}
                      </div>
                      <div className="md:col-span-2">
                        {renderDocumentUpload(
                          "previousOfferLetterFileUrl",
                          "previousOfferLetterStatus",
                          "Previous Offer Letter",
                        )}
                      </div>
                      <div className="md:col-span-2">
                        {renderDocumentUpload(
                          "promotionAppraisalLettersFileUrl",
                          "promotionAppraisalLettersStatus",
                          "Promotion / Appraisal Letters",
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Banking Information
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Bank Name")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {requiredLabel("Account Holder Name")}
                        </FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Account Number")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ifscCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("IFSC Code")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="branchName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Branch Name")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "bankProofFileUrl",
                      "bankProofStatus",
                      requiredLabel(
                        "Cancelled Cheque / Passbook Front Page / Bank Statement",
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <IdCard className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    PF / UAN Information
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "pfPassbookFileUrl",
                      "pfPassbookStatus",
                      "PF Passbook",
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {renderDocumentUpload(
                      "pfTransferDocumentsFileUrl",
                      "pfTransferDocumentsStatus",
                      "PF Transfer Documents",
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Emergency Contact
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {requiredLabel("Emergency Contact Name")}
                        </FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContactRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Relationship")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{requiredLabel("Contact Number")}</FormLabel>
                        <FormControl>
                          <Input className={fieldClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-cyan-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Declaration & Consent
                  </h3>
                </div>

                <div className="space-y-3 text-sm text-slate-700">
                  {[
                    [
                      "declarationInfoAccurate",
                      "I confirm that all information provided is accurate.",
                    ],
                    [
                      "declarationAuthorizeVerification",
                      "I authorize the company to verify my documents and employment history.",
                    ],
                    [
                      "declarationAgreePolicies",
                      "I agree to company onboarding policies and terms.",
                    ],
                  ].map(([name, label]) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as FieldPath<InputType>}
                      render={({ field }) => (
                        <FormItem className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                          <input
                            type="checkbox"
                            checked={Boolean(field.value)}
                            onChange={(event) =>
                              field.onChange(event.target.checked)
                            }
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600"
                          />
                          <FormLabel className="m-0 font-normal text-slate-700">
                            {label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
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
                  className={textAreaClass}
                  placeholder="Additional notes"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending || hasUploadingFiles}
          className="h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-8 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-xl"
        >
          {isPending || hasUploadingFiles ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}

          {hasUploadingFiles
            ? "Upload in progress..."
            : update
            ? mode === "employee"
              ? "Update My Document"
              : "Update Applicant Document"
            : mode === "employee"
              ? "Save My Document"
              : "Save Applicant Document"}
        </Button>
      </form>
    </Form>
  );
};
export default EmployeeDocumentForm;
