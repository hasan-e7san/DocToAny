import { prisma } from "@/lib/db";
import { generateWithOpenAI } from "@/lib/openai";
import { buildPrompt } from "@/lib/prompt-builder";
import { enqueueDocumentJob } from "@/lib/queue";

export async function extractWithOpenAiJob(data: { documentId: string; userId: string }) {
  const document = await prisma.document.findFirst({
    where: {
      id: data.documentId,
      userId: data.userId,
    },
  });

  if (!document) {
    throw new Error("Document not found.");
  }

  const parsedContent = document.rawText?.trim();
  if (!parsedContent) {
    throw new Error("No parsed content available.");
  }

  const prompt = buildPrompt({
    fileType: document.fileType,
    parsedContent,
    outputType: document.selectedOutputType,
    userInstructions: document.userInstructions,
  });

  const output = await generateWithOpenAI(prompt);

  await prisma.documentRun.create({
    data: {
      documentId: document.id,
      userId: data.userId,
      modelName: "gpt-4.1-mini",
      status: "completed",
      completedAt: new Date(),
    },
  });

  await prisma.document.update({
    where: { id: document.id },
    data: {
      extractedJson: output,
      status: "formatting_output",
    },
  });

  await enqueueDocumentJob("generate-output", {
    documentId: document.id,
    userId: data.userId,
  });
}
