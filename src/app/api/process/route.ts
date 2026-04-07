import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enqueueDocumentJob } from "@/lib/queue";
import { processSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = processSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const document = await prisma.document.findFirst({
    where: { id: parsed.data.documentId, userId: session.user.id },
    select: { id: true, userId: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const queued = await enqueueDocumentJob("parse-file", {
    documentId: document.id,
    userId: document.userId,
  });

  if (!queued.accepted) {
    return NextResponse.json({ error: "Queue unavailable." }, { status: 503 });
  }

  await prisma.document.update({
    where: { id: document.id },
    data: { status: "queued", errorMessage: null },
  });

  return NextResponse.json({ ok: true });
}
