import { prisma } from "@/lib/db";
import { removePhysicalFile } from "@/lib/storage";

export async function cleanupExpiredFilesJob() {
  const expiredDocs = await prisma.document.findMany({
    where: {
      expiresAt: { lte: new Date() },
      status: { notIn: ["deleted"] },
    },
    select: { id: true, filePath: true },
  });

  for (const doc of expiredDocs) {
    await removePhysicalFile(doc.filePath);
    await prisma.document.update({
      where: { id: doc.id },
      data: {
        filePath: null,
        rawText: null,
        extractedJson: null,
        status: "deleted",
      },
    });
  }

  return expiredDocs.length;
}
