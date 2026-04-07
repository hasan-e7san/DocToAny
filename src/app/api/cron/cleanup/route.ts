import { prisma } from "@/lib/db";
import { removePhysicalFile } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.CLEANUP_SECRET;
  const provided = req.headers.get("x-cleanup-secret") ?? "";

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const expired = await prisma.document.findMany({
    where: {
      expiresAt: { lte: new Date() },
      status: { notIn: ["deleted"] },
    },
    select: {
      id: true,
      filePath: true,
    },
  });

  for (const doc of expired) {
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

  return NextResponse.json({ ok: true, deletedCount: expired.length });
}
