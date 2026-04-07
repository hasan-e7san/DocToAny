"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLogo } from "@/components/app-logo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
    };

    if (payload.name.length < 2) {
      setLoading(false);
      setMessage("Name must be at least 2 characters.");
      return;
    }

    if (!EMAIL_PATTERN.test(payload.email)) {
      setLoading(false);
      setMessage("Please enter a valid email address.");
      return;
    }

    if (payload.password.length < 8) {
      setLoading(false);
      setMessage("Password must be at least 8 characters.");
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setLoading(false);
      setMessage("Registration failed.");
      return;
    }

    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-100 px-6 py-10 md:py-14">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-white md:grid-cols-2">
        <section className="hidden border-r border-zinc-200 bg-zinc-50 p-8 md:block md:p-10">
          <p className="text-sm font-medium text-zinc-600">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Start turning documents into usable output.
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Register to upload files, use custom AI instructions, and keep your results in one place.
          </p>
          <div className="mt-8 space-y-3 text-sm text-zinc-700">
            <p>• 5 free tries per week</p>
            <p>• Background processing workflow</p>
            <p>• Download-ready outputs</p>
          </div>
        </section>

        <section className="p-6 md:p-10">
          <div className="mx-auto w-full max-w-sm">
            <AppLogo className="mb-4" />
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Register</h2>
            <p className="mt-2 text-sm text-zinc-600">Create your account with email and password.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-zinc-700">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                />
              </div>

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
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
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
                  placeholder="At least 8 characters"
                  required
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                />
              </div>

              <button disabled={loading} className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-70">
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {message ? <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{message}</p> : null}

            <p className="mt-6 text-sm text-zinc-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-zinc-900 underline">
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
