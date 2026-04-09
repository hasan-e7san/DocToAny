import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enqueueDocumentJob } from "@/lib/queue";
import { enforceRateLimit, getClientIp, isTrustedOrigin } from "@/lib/request-security";
import { saveUploadedFile } from "@/lib/storage";
import { getUserUsage, hasRemainingTries } from "@/lib/usage";
import { isAllowedFile, outputTypeSchema, sanitizeInstructions } from "@/lib/validators";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE_BYTES = Number(process.env.MAX_FILE_SIZE_BYTES ?? 10 * 1024 * 1024);

function logUploadStep(step: string, details: Record<string, unknown> = {}) {
  console.log(`[upload] ${step}`, details);
}

export async function POST(req: Request) {
  logUploadStep("request_received");

  if (!isTrustedOrigin(req)) {
    logUploadStep("validation_failed", { reason: "invalid_origin" });
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    logUploadStep("auth_failed");
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const clientIp = getClientIp(req);
  const rateLimit = await enforceRateLimit({
    key: `ratelimit:upload:${session.user.id}:${clientIp}`,
    limit: 40,
    windowSeconds: 10 * 60,
  });

  if (!rateLimit.allowed) {
    logUploadStep("validation_failed", { reason: "rate_limited", userId: session.user.id, clientIp });
    return NextResponse.json(
      { error: "Too many upload attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  logUploadStep("auth_ok", { userId: session.user.id });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!user) {
    logUploadStep("user_not_found", { userId: session.user.id });
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const usage = await getUserUsage(user.id);

  if (!hasRemainingTries(usage.triesUsed, usage.triesLimit)) {
    logUploadStep("tries_exhausted", { userId: user.id, triesUsed: usage.triesUsed, triesLimit: usage.triesLimit });
    return NextResponse.json({ error: "No tries remaining this week." }, { status: 403 });
  }

  logUploadStep("tries_check_ok", {
    userId: user.id,
    triesUsed: usage.triesUsed,
    triesLimit: usage.triesLimit,
    triesRemaining: usage.triesLimit - usage.triesUsed,
  });

  const formData = await req.formData();
  const file = formData.get("file");
  const outputType = outputTypeSchema.safeParse(formData.get("outputType"));
  const rawInstructions = String(formData.get("instructions") ?? "");
  const instructions = sanitizeInstructions(rawInstructions);

  if (!(file instanceof File)) {
    logUploadStep("validation_failed", { reason: "file_missing" });
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  if (!outputType.success) {
    logUploadStep("validation_failed", { reason: "invalid_output_type" });
    return NextResponse.json({ error: "Invalid output type." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    logUploadStep("validation_failed", { reason: "file_too_large", fileSize: file.size, maxFileSize: MAX_FILE_SIZE_BYTES });
    return NextResponse.json({ error: "File too large." }, { status: 413 });
  }

  if (!isAllowedFile(file.name, file.type)) {
    logUploadStep("validation_failed", { reason: "unsupported_file", fileName: file.name, mimeType: file.type });
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  logUploadStep("validation_ok", {
    userId: user.id,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    outputType: outputType.data,
  });

  const document = await prisma.document.create({
    data: {
      userId: user.id,
      originalName: file.name,
      fileType: file.name.split(".").pop()?.toLowerCase() ?? "unknown",
      mimeType: file.type,
      fileSize: file.size,
      userInstructions: instructions || null,
      selectedOutputType: outputType.data,
      status: "uploaded",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  logUploadStep("document_created", { documentId: document.id, status: document.status });

  try {
    logUploadStep("file_save_started", { documentId: document.id });
    const arrayBuffer = await file.arrayBuffer();
    const filePath = await saveUploadedFile({
      userId: user.id,
      documentId: document.id,
      originalName: file.name,
      bytes: Buffer.from(arrayBuffer),
    });

    logUploadStep("file_saved", { documentId: document.id });

    await prisma.document.update({
      where: { id: document.id },
      data: { filePath },
    });

    logUploadStep("document_file_path_updated", { documentId: document.id });

    logUploadStep("queue_enqueue_started", { documentId: document.id, jobName: "parse-file" });

    const queued = await enqueueDocumentJob("parse-file", {
      documentId: document.id,
      userId: user.id,
    });

    if (!queued.accepted) {
      logUploadStep("queue_enqueue_failed", { documentId: document.id, reason: queued.reason });
      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: "failed",
          errorMessage: "Queue unavailable.",
        },
      });
      return NextResponse.json({ error: "Processing queue unavailable." }, { status: 503 });
    }

    logUploadStep("queue_enqueue_ok", {
      documentId: document.id,
      jobId: queued.jobId,
      queueStatus: queued.queueStatus,
    });

    await prisma.$transaction([
      prisma.document.update({
        where: { id: document.id },
        data: { status: "queued" },
      }),
      prisma.usageEvent.create({
        data: {
          userId: user.id,
          documentId: document.id,
          eventType: "tries_consumed",
          units: 1,
        },
      }),
    ]);

    logUploadStep("post_enqueue_updates_done", {
      documentId: document.id,
      newStatus: "queued",
      queueStatus: queued.queueStatus,
    });

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      status: "queued",
      queueStatus: queued.queueStatus,
    });
  } catch (error) {
    logUploadStep("upload_failed", {
      documentId: document.id,
      error: error instanceof Error ? error.message : "unknown",
    });
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Upload failed",
      },
    });
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
