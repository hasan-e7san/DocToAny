import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadsRoot = path.join(process.cwd(), "uploads");
const exportsRoot = path.join(process.cwd(), "exports");

export async function saveUploadedFile(params: {
  userId: string;
  documentId: string;
  originalName: string;
  bytes: Buffer;
}) {
  const safeOriginalName = params.originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const userFolder = path.join(uploadsRoot, params.userId);
  await mkdir(userFolder, { recursive: true });

  const filePath = path.join(userFolder, `${params.documentId}-${safeOriginalName}`);
  await writeFile(filePath, params.bytes);
  return filePath;
}

export async function removePhysicalFile(filePath: string | null | undefined) {
  if (!filePath) return;
  try {
    await unlink(filePath);
  } catch {
    return;
  }
}

export async function ensureExportFolder(userId: string) {
  const userFolder = path.join(exportsRoot, userId);
  await mkdir(userFolder, { recursive: true });
  return userFolder;
}
