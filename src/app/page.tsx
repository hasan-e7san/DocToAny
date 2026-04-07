import Link from "next/link";
import { auth } from "@/lib/auth";
import { AppLogo } from "@/components/app-logo";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <div className="flex-1 bg-zinc-100 text-zinc-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 md:py-14">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-zinc-100" />
          <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <AppLogo className="mb-4" />
              <span className="inline-flex rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
                AI Document Processing SaaS
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
                Turn messy files into usable output in minutes.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
                Upload PDF, DOCX, or XLSX files, add optional AI instructions, pick the format you need,
                and get structured results quickly.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    Open dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                    >
                      Get started
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-sm font-medium text-zinc-700">How it works</p>
              <ol className="mt-3 space-y-2 text-sm text-zinc-600">
                <li>1. Upload a supported file</li>
                <li>2. Choose output format</li>
                <li>3. Add optional instructions</li>
                <li>4. Get processed result</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-medium text-zinc-500">Supported Types</h2>
            <p className="mt-2 text-lg font-semibold">PDF, DOCX, XLSX</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-medium text-zinc-500">Output Options</h2>
            <p className="mt-2 text-lg font-semibold">JSON, Markdown, CSV, Summary</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-medium text-zinc-500">Custom Instructions</h2>
            <p className="mt-2 text-sm text-zinc-700">Optional instructions to control extraction and formatting behavior.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-medium text-zinc-500">Free Plan</h2>
            <p className="mt-2 text-lg font-semibold">5 tries per week</p>
          </div>
        </section>

        <footer className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>
              Questions? <Link href="/contact" className="font-medium text-zinc-900 underline">Contact us</Link>
            </span>
            <a
              href="http://hasan-ehsan.cloud/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 underline"
            >
              Profile
            </a>
            <a
              href="http://blog.hasan-ehsan.cloud/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 underline"
            >
              Blog
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
