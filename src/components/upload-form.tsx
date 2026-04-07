"use client";

import { OutputType } from "@prisma/client";
import { FormEvent, useEffect, useState } from "react";

const OUTPUT_LOCAL_KEY = "upload_output_type";
const INSTRUCTIONS_LOCAL_KEY = "upload_instructions_draft";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "docx", "xlsx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function UploadForm({ triesRemaining }: { triesRemaining: number }) {
  const [outputType, setOutputType] = useState<OutputType>(() => {
    if (typeof window === "undefined") {
      return "JSON";
    }
    const stored = localStorage.getItem(OUTPUT_LOCAL_KEY) as OutputType | null;
    if (stored && ["JSON", "Markdown", "CSV", "Summary"].includes(stored)) {
      return stored;
    }
    return "JSON";
  });
  const [instructions, setInstructions] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem(INSTRUCTIONS_LOCAL_KEY) ?? "";
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(OUTPUT_LOCAL_KEY, outputType);
  }, [outputType]);

  useEffect(() => {
    localStorage.setItem(INSTRUCTIONS_LOCAL_KEY, instructions);
  }, [instructions]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (triesRemaining <= 0) {
      setStatus("No tries remaining.");
      return;
    }

    setLoading(true);
    setStatus("");

    const formData = new FormData(form);
    formData.set("outputType", outputType);
    formData.set("instructions", instructions);

    const fileCandidate = formData.get("file");
    if (!(fileCandidate instanceof File)) {
      setLoading(false);
      setStatus("Please select a file.");
      return;
    }

    const extension = fileCandidate.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(extension) || !ALLOWED_MIME_TYPES.includes(fileCandidate.type)) {
      setLoading(false);
      setStatus("Only PDF, DOCX, and XLSX files are supported.");
      return;
    }

    if (fileCandidate.size > MAX_FILE_SIZE_BYTES) {
      setLoading(false);
      setStatus("File is too large. Max size is 10MB.");
      return;
    }

    if (instructions.length > 1000) {
      setLoading(false);
      setStatus("Instructions must be 1000 characters or less.");
      return;
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Upload failed.");
      return;
    }

    setStatus("Upload accepted and queued. Make sure worker is running (npm run worker).");
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 md:p-7">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">File</label>
        <input
          name="file"
          type="file"
          required
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-200"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">Output Type</label>
        <select
          name="outputType"
          value={outputType}
          onChange={(event) => setOutputType(event.target.value as OutputType)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
        >
          <option value="JSON">JSON</option>
          <option value="Markdown">Markdown</option>
          <option value="CSV">CSV</option>
          <option value="Summary">Summary</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">Custom AI Instructions (optional)</label>
        <textarea
          name="instructions"
          maxLength={1000}
          rows={5}
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
          placeholder="Example: return JSON only, format dates as YYYY-MM-DD"
        />
        <p className="text-xs text-zinc-500">Max 1000 characters.</p>
      </div>

      <button
        type="submit"
        disabled={loading || triesRemaining <= 0}
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Upload and process"}
      </button>

      {status ? <p className="rounded-md bg-zinc-100 p-3 text-sm text-zinc-700">{status}</p> : null}
    </form>
  );
}
