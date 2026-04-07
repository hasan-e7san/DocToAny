import { auth } from "@/lib/auth";
import { getUserUsage } from "@/lib/usage";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [usage, recentDocuments] = await Promise.all([
    getUserUsage(session.user.id),
    prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, originalName: true, status: true, selectedOutputType: true, createdAt: true },
    }),
  ]);

  const triesUsed = usage.triesUsed;
  const triesRemaining = usage.triesRemaining;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">Overview of your usage and latest documents.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Tries Used (7d)</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{triesUsed}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Tries Remaining (7d)</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{triesRemaining}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Plan</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">Free</p>
        </div>
      </section>

      {triesRemaining <= 0 ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No tries remaining this week. Upload is disabled.
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Recent Documents</h2>
          <Link href="/dashboard/documents" className="text-sm font-medium text-zinc-700 underline">
            View all
          </Link>
        </div>
        {recentDocuments.length === 0 ? (
          <p className="px-5 py-6 text-sm text-zinc-600">No documents yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">File</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Output</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((doc) => (
                  <tr key={doc.id} className="border-t border-zinc-200">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/documents/${doc.id}`} className="font-medium text-zinc-900 hover:underline">
                        {doc.originalName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-600">{doc.status}</td>
                    <td className="px-5 py-3 text-zinc-600">{doc.selectedOutputType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
