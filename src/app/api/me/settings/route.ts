import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { settingsUpdateSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = settingsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const name = parsed.data.name?.trim();
  const email = parsed.data.email?.trim().toLowerCase();
  const currentPassword = parsed.data.currentPassword;
  const newPassword = parsed.data.newPassword;

  if (!name && !email && !newPassword) {
    return NextResponse.json({ error: "No changes provided." }, { status: 400 });
  }

  if (email && email !== user.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (emailTaken) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }
  }

  let passwordHashToSave: string | undefined;

  if (newPassword) {
    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required." }, { status: 400 });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatch) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
    }

    passwordHashToSave = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name ?? undefined,
      email: email ?? undefined,
      passwordHash: passwordHashToSave,
    },
    select: {
      name: true,
      email: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}
