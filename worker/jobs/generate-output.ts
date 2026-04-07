import { prisma } from "@/lib/db";

export async function generateOutputJob(data: { documentId: string; userId: string }) {
  const document = await prisma.document.findFirst({
    where: {
      id: data.documentId,
      userId: data.userId,
    },
  });

  if (!document) {
    throw new Error("Document not found.");
  }

  const formattedOutput = document.extractedJson ?? "";

  await prisma.document.update({
    where: { id: document.id },
    data: {
      formattedOutput,
      status: "completed",
      errorMessage: null,
    },
  });

  await prisma.usageEvent.create({
    data: {
      userId: data.userId,
      documentId: data.documentId,
      eventType: "job_completed",
      units: 1,
    },
  });
}
