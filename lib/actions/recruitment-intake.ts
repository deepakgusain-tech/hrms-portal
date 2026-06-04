"use server";

import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { mapRecruitmentIntakeRecord, toRecruitmentIntakeDbInput } from "@/lib/recruitment-db";
import { type RecruitmentIntake } from "@/types";
import { formatError } from "../utils";
import { recruitmentIntakeSchema } from "../validators";

type ActionResponse = {
  success: boolean;
  message: string;
};

export type RecruitmentIntakeInterviewApplicant = {
  id: string;
  requestId: string;
  candidateName: string;
  profilePost: string;
  pipelineStatus: string;
  email: string;
  mobileNumber: string;
  skillsLevel: string;
  totalExperience: string;
  relevantExperience: string;
  qualification: string;
  resumeSummary: string;
  resumeUrl: string;
};

const INTERVIEW_ELIGIBLE_PIPELINE_STATUSES = new Set([
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_IN_PROGRESS",
  "INTERVIEW_COMPLETED",
]);

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : undefined;
}

function normalizeSource(value: string) {
  return value.trim().toUpperCase();
}

async function saveResumeUpload(file: File) {
  if (file.type !== "application/pdf") {
    throw new Error("Resume must be a PDF file");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "recruitment-intake");
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, fileName), buffer);

  return `/uploads/recruitment-intake/${fileName}`;
}

function normalizeRecruitmentIntake(input: RecruitmentIntake): RecruitmentIntake {
  const now = new Date().toISOString();

  return {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    resumeUrl: input.resumeUrl?.trim() || "",
    skills: input.skills.trim(),
    experience: input.experience.trim(),
    appliedPosition: input.appliedPosition.trim(),
    source: input.source,
    pipelineStatus: input.pipelineStatus || "APPLIED",
    createdAt: input.createdAt || now,
    updatedAt: now,
  };
}

function buildIntakeRecordFromForm(
  formData: FormData,
  currentRecord?: RecruitmentIntake,
) {
  const resumeFile = getFileValue(formData, "resumeFile");
  const currentResumeUrl = getStringValue(formData, "currentResumeUrl");
  const resumeUrl = resumeFile
    ? undefined
    : currentRecord?.resumeUrl || currentResumeUrl || undefined;

  const parsed = recruitmentIntakeSchema.parse({
    id: getStringValue(formData, "id") || undefined,
    name: getStringValue(formData, "name"),
    email: getStringValue(formData, "email"),
    phone: getStringValue(formData, "phone"),
    resumeUrl,
    skills: getStringValue(formData, "skills"),
    experience: getStringValue(formData, "experience"),
    appliedPosition: getStringValue(formData, "appliedPosition"),
    source: normalizeSource(getStringValue(formData, "source")),
    pipelineStatus: normalizeSource(getStringValue(formData, "pipelineStatus")) || currentRecord?.pipelineStatus || "APPLIED",
    createdAt: currentRecord?.createdAt || undefined,
  });

  return { parsed, resumeFile };
}

export async function getRecruitmentIntakes(): Promise<RecruitmentIntake[]> {
  try {
    const records = await prisma.recruitmentIntake.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return records.map(mapRecruitmentIntakeRecord);
  } catch {
    return [];
  }
}

export async function getRecruitmentIntakeById(id: string) {
  try {
    const records = await getRecruitmentIntakes();
    const record = records.find((item) => item.id === id);

    if (!record) {
      return {
        success: false,
        message: "Recruitment record not found",
      };
    }

    return {
      success: true,
      data: record,
      message: "Recruitment record fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getRecruitmentIntakeInterviewApplicants(): Promise<
  RecruitmentIntakeInterviewApplicant[]
> {
  const records = await getRecruitmentIntakes();
  const eligibleRecords = records.filter((item) =>
    INTERVIEW_ELIGIBLE_PIPELINE_STATUSES.has(item.pipelineStatus || ""),
  );
  const source = eligibleRecords.length ? eligibleRecords : records;

  return source.map((item) => ({
    id: item.id ?? "",
    requestId: item.id ?? "",
    candidateName: item.name,
    profilePost: item.appliedPosition,
    pipelineStatus: item.pipelineStatus || "APPLIED",
    email: item.email,
    mobileNumber: item.phone,
    skillsLevel: item.skills,
    totalExperience: item.experience,
    relevantExperience: item.experience,
    qualification: "",
    resumeSummary: item.experience,
    resumeUrl: item.resumeUrl || "",
  }));
}

export async function updateRecruitmentIntakePipelineStatus(
  applicantId: string,
  pipelineStatus: RecruitmentIntake["pipelineStatus"],
) {
  await prisma.recruitmentIntake.updateMany({
    where: { id: applicantId },
    data: { pipelineStatus: pipelineStatus || "APPLIED" },
  });

  revalidatePath("/recruitment-intake");
  revalidatePath("/interviews");
}

export async function createRecruitmentIntake(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const { parsed, resumeFile } = buildIntakeRecordFromForm(formData);

    if (!resumeFile) {
      return {
        success: false,
        message: "Resume PDF is required",
      };
    }

    const resumeUrl = await saveResumeUpload(resumeFile);
    const nextRecord = normalizeRecruitmentIntake(
      {
        ...parsed,
        resumeUrl,
      },
    );

    await prisma.recruitmentIntake.create({
      data: toRecruitmentIntakeDbInput(nextRecord),
    });

    revalidatePath("/recruitment-intake");

    return {
      success: true,
      message: "Recruitment record created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateRecruitmentIntake(
  formData: FormData,
  id: string,
): Promise<ActionResponse> {
  try {
    const existing = await prisma.recruitmentIntake.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        message: "Recruitment record not found",
      };
    }

    const { parsed, resumeFile } = buildIntakeRecordFromForm(
      formData,
      mapRecruitmentIntakeRecord(existing),
    );

    const resumeUrl = resumeFile
      ? await saveResumeUpload(resumeFile)
      : existing.resumeUrl ?? "";

    const nextRecord = normalizeRecruitmentIntake(
      {
        ...parsed,
        id,
        createdAt: existing.createdAt.toISOString(),
        resumeUrl,
      },
    );

    const {
      id: recordId,
      createdAt,
      updatedAt,
      ...updateData
    } = toRecruitmentIntakeDbInput(nextRecord);
    void recordId;
    void createdAt;
    void updatedAt;

    await prisma.recruitmentIntake.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/recruitment-intake");
    revalidatePath(`/recruitment-intake/edit/${id}`);

    return {
      success: true,
      message: "Recruitment record updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteRecruitmentIntake(id: string): Promise<ActionResponse> {
  try {
    await prisma.recruitmentIntake.deleteMany({
      where: { id },
    });

    revalidatePath("/recruitment-intake");

    return {
      success: true,
      message: "Recruitment record deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
