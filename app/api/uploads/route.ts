import { auth } from "@/auth";
import {
  DOCUMENT_UPLOAD_ACCEPT,
  MAX_DOCUMENT_UPLOAD_SIZE_BYTES,
  isAllowedUploadFile,
} from "@/lib/document-uploads";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

function buildUploadError(message: string, status = 400) {
  return Response.json({ success: false, message }, { status });
}

function getSafeExtension(file: File) {
  const originalExtension = path.extname(file.name).toLowerCase();
  if (originalExtension) {
    return originalExtension.replace(/[^a-z0-9.]/g, "");
  }

  if (file.type === "application/pdf") {
    return ".pdf";
  }

  if (file.type.startsWith("image/")) {
    const subtype = file.type.split("/")[1] || "png";
    const normalizedSubtype = subtype.replace(/[^a-z0-9]/gi, "");
    return `.${normalizedSubtype || "png"}`;
  }

  return "";
}

function getUploadDirectory() {
  return path.join(process.cwd(), "public", "uploads");
}

function getUniqueFileName(file: File) {
  const extension = getSafeExtension(file);
  const slug = path
    .basename(file.name, path.extname(file.name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  const prefix = slug || "upload";
  return `${Date.now()}-${randomUUID()}-${prefix}${extension}`;
}

async function saveFileLocally(file: File) {
  const uploadDir = getUploadDirectory();
  const fileName = getUniqueFileName(file);
  const absolutePath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(absolutePath, bytes);

  return {
    fileName,
    absolutePath,
    url: `/uploads/${fileName}`,
    mimeType: file.type || "application/octet-stream",
    bytes: file.size,
    originalName: file.name,
  };
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return buildUploadError("Unauthorized", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return buildUploadError("A file is required.");
    }

    if (file.size <= 0) {
      return buildUploadError("The uploaded file is empty.");
    }

    if (file.size > MAX_DOCUMENT_UPLOAD_SIZE_BYTES) {
      return buildUploadError(
        `File size must be ${Math.floor(
          MAX_DOCUMENT_UPLOAD_SIZE_BYTES / (1024 * 1024),
        )}MB or smaller.`,
      );
    }

    if (!isAllowedUploadFile(file, DOCUMENT_UPLOAD_ACCEPT)) {
      return buildUploadError(
        "Unsupported file type. Please upload an image or PDF.",
      );
    }

    console.log("[uploads] file received", {
      userId: session.user.id,
      fileName: file.name,
      mimeType: file.type,
      bytes: file.size,
    });

    const uploaded = await saveFileLocally(file);

    console.log("[uploads] filename generated", {
      userId: session.user.id,
      generatedFileName: uploaded.fileName,
      absolutePath: uploaded.absolutePath,
    });

    console.log("[uploads] file saved", {
      userId: session.user.id,
      absolutePath: uploaded.absolutePath,
      bytes: uploaded.bytes,
    });

    console.log("[uploads] url returned", {
      userId: session.user.id,
      url: uploaded.url,
    });

    return Response.json({
      success: true,
      url: uploaded.url,
    });
  } catch (error) {
    console.error("[uploads] upload failed", error);
    return buildUploadError(
      error instanceof Error ? error.message : "Unable to upload file",
      500,
    );
  }
}
