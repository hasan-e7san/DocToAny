import { prisma } from "@/lib/db";
import { enforceRateLimit, getClientIp, isTrustedOrigin } from "@/lib/request-security";
import { contactSchema } from "@/lib/validators";
import { sanitizeTextInput } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const clientIp = getClientIp(req);
  const rateLimit = await enforceRateLimit({
    key: `ratelimit:contact:${clientIp}`,
    limit: 8,
    windowSeconds: 10 * 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact form data." }, { status: 400 });
  }

  const name = sanitizeTextInput(parsed.data.name, 120);
  const email = sanitizeTextInput(parsed.data.email, 255).toLowerCase();
  const subject = sanitizeTextInput(parsed.data.subject, 160);
  const message = sanitizeTextInput(parsed.data.message, 5000);

  if (name.length < 2 || subject.length < 2 || message.length < 5) {
    return NextResponse.json({ error: "Invalid contact form data." }, { status: 400 });
  }

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
    },
  });

  return NextResponse.json({ ok: true });
}
