import { auth } from "@/lib/auth";
import { getUserUsage } from "@/lib/usage";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const usage = await getUserUsage(session.user.id);
  return NextResponse.json({ usage });
}
