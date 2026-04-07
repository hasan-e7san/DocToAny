import { AppLogo } from "@/components/app-logo";
import { LogoutButton } from "@/components/logout-button";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm md:gap-3">
            <AppLogo href="/dashboard" withText={false} className="mr-1" />
            <Link href="/dashboard/upload" className="rounded-lg px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100">Upload</Link>
            <Link href="/dashboard/documents" className="rounded-lg px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100">Documents</Link>
            <Link href="/dashboard/history" className="rounded-lg px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100">History</Link>
            <Link href="/dashboard/settings" className="rounded-lg px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100">Settings</Link>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8 md:py-10">{children}</main>
    </div>
  );
}
