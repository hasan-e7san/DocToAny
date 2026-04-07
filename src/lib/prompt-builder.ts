import { OutputType } from "@prisma/client";

export function buildPrompt(params: {
  fileType: string;
  parsedContent: string;
  outputType: OutputType;
  userInstructions?: string | null;
}) {
  const baseSystemRules = [
    "You are DocToObject extraction engine.",
    "Do not invent data that is missing from the document.",
    "If a value is unknown, explicitly mark it as unknown.",
    "Follow the requested output format strictly.",
    "Prioritize extracted content over assumptions.",
  ].join(" ");

  const outputInstructions = {
    JSON: "Return valid JSON only.",
    Markdown: "Return markdown with clear headings and lists.",
    CSV: "Return CSV content with header row. Use best-effort flattening.",
    Summary: "Return a concise human-readable summary.",
  } satisfies Record<OutputType, string>;

  const userSegment = params.userInstructions?.trim()
    ? `User instructions: ${params.userInstructions.trim()}`
    : "User instructions: none";

  return {
    system: baseSystemRules,
    user: [
      `File type: ${params.fileType}`,
      `Output type: ${params.outputType}`,
      outputInstructions[params.outputType],
      userSegment,
      "Document content:",
      params.parsedContent,
    ].join("\n\n"),
  };
}
