import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const documents = await prisma.document.findMany({
    where: {
      userId: session.user.id,
      status: {
        in: ["completed", "failed", "expired", "deleted"],
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      originalName: true,
      status: true,
      selectedOutputType: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">History</h1>
        <p className="mt-1 text-sm text-zinc-600">Completed and archived document runs.</p>
      </div>
      {documents.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          No completed results yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">File</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Output</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t border-zinc-200">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/documents/${doc.id}`} className="font-medium text-zinc-900 hover:underline">
                        {doc.originalName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-600">{doc.status}</td>
                    <td className="px-5 py-3 text-zinc-600">{doc.selectedOutputType}</td>
                    <td className="px-5 py-3 text-zinc-600">{doc.createdAt.toLocaleString()}</td>
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
