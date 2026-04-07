import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function generateWithOpenAI(params: { system: string; user: string }) {
  if (!openai) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: params.system }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: params.user }],
      },
    ],
  });

  return response.output_text;
}
