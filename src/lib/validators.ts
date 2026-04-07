import { OutputType } from "@prisma/client";
import { z } from "zod";

export const MAX_INSTRUCTIONS_LENGTH = 1000;

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(255),
  subject: z.string().min(2).max(160),
  message: z.string().min(5).max(5000),
});

export const processSchema = z.object({
  documentId: z.string().min(1),
});

export const settingsUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().max(255).optional(),
  currentPassword: z.string().min(8).max(128).optional(),
  newPassword: z.string().min(8).max(128).optional(),
});

export const outputTypeSchema = z.nativeEnum(OutputType);

const ALLOWED_EXTENSIONS = ["pdf", "docx", "xlsx"] as const;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function isAllowedFile(fileName: string, mimeType: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return (
    Boolean(extension) &&
    ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number]) &&
    ALLOWED_MIME_TYPES.includes(mimeType)
  );
}

export function sanitizeInstructions(input: string): string {
  return input.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, MAX_INSTRUCTIONS_LENGTH);
}
