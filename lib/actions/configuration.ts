"use server";

import { auth } from "@/auth";
import { Configuration } from "@/types";
import { prisma } from "../prisma";
import { configurationSchema } from "../validators";
import { formatError } from "../utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  message: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : undefined;
}

function emptyToUndefined(value: string) {
  return value || undefined;
}

async function saveUpload(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), buffer);

  return `/uploads/${fileName}`;
}

// Get configuration
export async function getConfiguration(): Promise<Configuration | null> {
  const configuration = await prisma.configuration.findFirst({});

  if (!configuration) {
    return null;
  }

  return {
    id: configuration.id,
    name: configuration.name ?? undefined,
    logo: configuration.logo ?? undefined,
    favicon: configuration.favicon ?? undefined,
    email: configuration.email ?? undefined,
    password: configuration.password ?? undefined,
    smtpHost: configuration.smtpHost ?? undefined,
    smtpPort: configuration.smtpPort ?? undefined,
    smtpSecure: configuration.smtpSecure,
    smtpFromName: configuration.smtpFromName ?? undefined,
  };
}

// Create or Update configuration
export async function createOrUpdateConfiguration(
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const id = getStringValue(formData, "id");
    const currentLogo = getStringValue(formData, "currentLogo");
    const currentFavicon = getStringValue(formData, "currentFavicon");
    const nextLogo = getFileValue(formData, "logo") ?? emptyToUndefined(currentLogo);
    const nextFavicon =
      getFileValue(formData, "favicon") ?? emptyToUndefined(currentFavicon);

    const parsedConfiguration = configurationSchema.parse({
      id: id || undefined,
      name: getStringValue(formData, "name") || undefined,
      email: getStringValue(formData, "email") || undefined,
      password: getStringValue(formData, "password") || undefined,
      smtpHost: getStringValue(formData, "smtpHost") || undefined,
      smtpPort: getStringValue(formData, "smtpPort")
        ? Number(getStringValue(formData, "smtpPort"))
        : undefined,
      smtpSecure: getStringValue(formData, "smtpSecure") !== "false",
      smtpFromName: getStringValue(formData, "smtpFromName") || undefined,
      logo: nextLogo,
      favicon: nextFavicon,
    } satisfies Configuration);

    const logoFile = parsedConfiguration.logo instanceof File
      ? parsedConfiguration.logo
      : undefined;
    const faviconFile = parsedConfiguration.favicon instanceof File
      ? parsedConfiguration.favicon
      : undefined;

    const logoUrl = logoFile
      ? await saveUpload(logoFile)
      : typeof parsedConfiguration.logo === "string"
        ? parsedConfiguration.logo
        : undefined;

    const faviconUrl = faviconFile
      ? await saveUpload(faviconFile)
      : typeof parsedConfiguration.favicon === "string"
        ? parsedConfiguration.favicon
        : undefined;

    const payload = {
      name: parsedConfiguration.name,
      email: parsedConfiguration.email,
      password: parsedConfiguration.password,
      smtpHost: parsedConfiguration.smtpHost,
      smtpPort: parsedConfiguration.smtpPort,
      smtpSecure: parsedConfiguration.smtpSecure ?? true,
      smtpFromName: parsedConfiguration.smtpFromName,
      logo: logoUrl,
      favicon: faviconUrl,
    };

    if (id) {
      await prisma.configuration.update({
        where: { id },
        data: payload,
      });
    } else {
      await prisma.configuration.create({
        data: payload,
      });
    }

    revalidatePath("/configuration");

    return {
      success: true,
      message: "Configuration updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
