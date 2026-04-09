import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      originalName: true,
      selectedOutputType: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Documents</h1>
        <p className="mt-1 text-sm text-zinc-600">All uploaded files and processing statuses.</p>
      </div>
      {documents.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">No documents yet.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-5">File</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Status</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell sm:px-5">Output</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell sm:px-5">Created</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3 sm:px-5">
                      <Link href={`/dashboard/documents/${doc.id}`} className="block max-w-[220px] truncate font-medium text-zinc-900 hover:underline sm:max-w-none">
                        {doc.originalName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 sm:px-5">{doc.status}</td>
                    <td className="hidden px-4 py-3 text-zinc-600 sm:table-cell sm:px-5">{doc.selectedOutputType}</td>
                    <td className="hidden px-4 py-3 text-zinc-600 md:table-cell sm:px-5">{doc.createdAt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
