import { prisma } from "@/lib/db";
import { enqueueDocumentJob } from "@/lib/queue";
import { readFile } from "node:fs/promises";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import XLSX from "xlsx";

export async function parseFileJob(data: { documentId: string; userId: string }) {
  const document = await prisma.document.findFirst({
    where: { id: data.documentId, userId: data.userId },
  });

  if (!document?.filePath) {
    throw new Error("Document or file path not found.");
  }

  await prisma.document.update({
    where: { id: document.id },
    data: { status: "parsing", errorMessage: null },
  });

  let rawText = "";

  if (document.fileType === "pdf") {
    const buffer = await readFile(document.filePath);
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    rawText = parsed.text;
    await parser.destroy();
  } else if (document.fileType === "docx") {
    const parsed = await mammoth.extractRawText({ path: document.filePath });
    rawText = parsed.value;
  } else if (document.fileType === "xlsx") {
    const workbook = XLSX.readFile(document.filePath);
    rawText = workbook.SheetNames.map((name) => {
      const ws = workbook.Sheets[name];
      return `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(ws)}`;
    }).join("\n\n");
  } else {
    throw new Error("Unsupported file type.");
  }

  await prisma.document.update({
    where: { id: document.id },
    data: {
      rawText,
      status: "extracting",
    },
  });

  await enqueueDocumentJob("extract-with-openai", {
    documentId: document.id,
    userId: data.userId,
  });
}
