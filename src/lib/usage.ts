import { prisma } from "./db";

export async function getUserUsage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      triesUsed: true,
      triesLimit: true,
    },
  });

  if (!user) {
    return { triesUsed: 0, triesLimit: 5, triesRemaining: 0 };
  }

  return {
    triesUsed: user.triesUsed,
    triesLimit: user.triesLimit,
    triesRemaining: Math.max(0, user.triesLimit - user.triesUsed),
  };
}

export function hasRemainingTries(triesUsed: number, triesLimit: number) {
  return triesUsed < triesLimit;
}
