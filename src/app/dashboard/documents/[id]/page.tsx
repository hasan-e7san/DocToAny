import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!document) {
    notFound();
  }

  const exportHref = `/api/documents/${document.id}/export`;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Document Result</h1>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm sm:p-6">
        <p><span className="font-medium text-zinc-900">File:</span> <span className="break-all text-zinc-700">{document.originalName}</span></p>
        <p className="mt-1"><span className="font-medium text-zinc-900">Status:</span> <span className="text-zinc-700">{document.status}</span></p>
        <p className="mt-1"><span className="font-medium text-zinc-900">Output:</span> <span className="text-zinc-700">{document.selectedOutputType}</span></p>
        <p className="mt-1"><span className="font-medium text-zinc-900">Created:</span> <span className="text-zinc-700">{document.createdAt.toLocaleString()}</span></p>
        {document.userInstructions ? (
          <p className="mt-3 whitespace-pre-wrap rounded-md bg-zinc-50 p-3"><span className="font-medium text-zinc-900">Instructions:</span> <span className="text-zinc-700">{document.userInstructions}</span></p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-3">
          <a href={exportHref} className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-center text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 sm:w-auto">Download</a>
        </div>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 sm:p-4">
          {document.formattedOutput ?? "Processing is not complete yet."}
        </pre>
      </div>
    </div>
  );
}
