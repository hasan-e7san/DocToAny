import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const contentTypeByOutputType: Record<string, string> = {
  JSON: "application/json; charset=utf-8",
  Markdown: "text/markdown; charset=utf-8",
  CSV: "text/csv; charset=utf-8",
  Summary: "text/plain; charset=utf-8",
};

const extensionByOutputType: Record<string, string> = {
  JSON: "json",
  Markdown: "md",
  CSV: "csv",
  Summary: "txt",
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      originalName: true,
      formattedOutput: true,
      selectedOutputType: true,
      status: true,
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!document.formattedOutput) {
    return NextResponse.json({ error: "Output is not ready." }, { status: 409 });
  }

  const ext = extensionByOutputType[document.selectedOutputType] ?? "txt";
  const fileName = `${document.originalName}.${ext}`;

  return new NextResponse(document.formattedOutput, {
    headers: {
      "Content-Type": contentTypeByOutputType[document.selectedOutputType] ?? "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
