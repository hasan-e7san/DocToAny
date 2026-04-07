import { UploadForm } from "@/components/upload-form";
import { auth } from "@/lib/auth";
import { getUserUsage } from "@/lib/usage";
import { redirect } from "next/navigation";

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const usage = await getUserUsage(session.user.id);
  const triesRemaining = usage.triesRemaining;

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Upload Document</h1>
        <p className="mt-1 text-sm text-zinc-600">Tries remaining this week: {triesRemaining}</p>
      </div>
      <UploadForm triesRemaining={triesRemaining} />
    </div>
  );
}
