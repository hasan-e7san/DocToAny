import { UploadForm } from "@/components/upload-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { triesUsed: true, triesLimit: true },
  });

  const triesRemaining = Math.max(0, (user?.triesLimit ?? 5) - (user?.triesUsed ?? 0));

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Upload Document</h1>
        <p className="mt-1 text-sm text-zinc-600">Tries remaining: {triesRemaining}</p>
      </div>
      <UploadForm triesRemaining={triesRemaining} />
    </div>
  );
}
