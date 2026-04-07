"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (response.ok) {
      event.currentTarget.reset();
      setMessage("Your message was sent successfully.");
      return;
    }

    setMessage("Failed to send message. Please try again.");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-100 px-6 py-10 md:py-14">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 md:p-10">
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
