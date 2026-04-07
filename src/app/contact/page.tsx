"use client";

import { FormEvent, useState } from "react";
import { AppLogo } from "@/components/app-logo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setMessage("");

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
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

    if (payload.subject.length < 2) {
      setLoading(false);
      setMessage("Subject must be at least 2 characters.");
      return;
    }

    if (payload.message.length < 5) {
      setLoading(false);
      setMessage("Message must be at least 5 characters.");
      return;
    }

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (response.ok) {
      form.reset();
      setMessage("Your message was sent successfully.");
      return;
    }

    setMessage("Failed to send message. Please try again.");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-100 px-6 py-10 md:py-14">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 md:p-10">
        <AppLogo className="mb-4" />
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-2 text-sm text-zinc-600">Send us your question and we will get back to you soon.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-zinc-700">Name</label>
              <input id="name" name="name" placeholder="Your name" required className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">Email</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="subject" className="text-sm font-medium text-zinc-700">Subject</label>
            <input id="subject" name="subject" placeholder="What do you need help with?" required className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="message" className="text-sm font-medium text-zinc-700">Message</label>
            <textarea id="message" name="message" placeholder="Write your message" required rows={7} className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500" />
          </div>

          <button disabled={loading} className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-70">
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-md bg-zinc-100 p-3 text-sm text-zinc-700">{message}</p> : null}
      </div>
    </main>
  );
}
