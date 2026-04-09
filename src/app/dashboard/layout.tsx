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
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm md:gap-3">
            <AppLogo href="/dashboard" withText={false} className="mr-1 shrink-0" />
            <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
              <Link href="/dashboard/upload" className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 sm:px-3 sm:text-sm">Upload</Link>
              <Link href="/dashboard/documents" className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 sm:px-3 sm:text-sm">Documents</Link>
              <Link href="/dashboard/history" className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 sm:px-3 sm:text-sm">History</Link>
              <Link href="/dashboard/settings" className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 sm:px-3 sm:text-sm">Settings</Link>
            </nav>
          </div>
          <div className="self-end sm:self-auto">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">{children}</main>
    </div>
  );
}
