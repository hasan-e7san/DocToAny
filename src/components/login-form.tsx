"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const callbackUrl = "/dashboard";
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!result?.ok) {
      setError("Invalid credentials.");
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-100 px-6 py-10 md:py-14">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-white md:grid-cols-2">
        <section className="hidden border-r border-zinc-200 bg-zinc-50 p-8 md:block md:p-10">
          <p className="text-sm font-medium text-zinc-600">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Continue processing your documents.
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Login to upload files, track processing status, and export your output.
          </p>
          <div className="mt-8 space-y-3 text-sm text-zinc-700">
            <p>• PDF, DOCX, XLSX uploads</p>
            <p>• JSON, Markdown, CSV, Summary output</p>
            <p>• 5 free tries per account</p>
          </div>
        </section>

        <section className="p-6 md:p-10">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Login</h2>
            <p className="mt-2 text-sm text-zinc-600">Use your email and password to access the dashboard.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {error ? <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

            <p className="mt-6 text-sm text-zinc-600">
              New here?{" "}
              <Link href="/register" className="font-medium text-zinc-900 underline">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
