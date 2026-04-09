import { prisma } from "@/lib/db";
import { enforceRateLimit, getClientIp, isTrustedOrigin } from "@/lib/request-security";
import { registerSchema } from "@/lib/validators";
import { sanitizeTextInput } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const clientIp = getClientIp(req);
  const rateLimit = await enforceRateLimit({
    key: `ratelimit:register:${clientIp}`,
    limit: 10,
    windowSeconds: 15 * 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
  }

  const name = sanitizeTextInput(parsed.data.name, 80);
  const email = sanitizeTextInput(parsed.data.email, 255).toLowerCase();
  const password = parsed.data.password;

  if (name.length < 2) {
    return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (exists) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      triesLimit: 5,
      triesUsed: 0,
    },
  });

  return NextResponse.json({ ok: true });
}
