import { prisma } from "./db";

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

function getWeeklyWindowStart() {
  return new Date(Date.now() - WEEK_IN_MS);
}

export async function getUserUsage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      triesLimit: true,
    },
  });

  if (!user) {
    return { triesUsed: 0, triesLimit: 5, triesRemaining: 0 };
  }

  const weeklyWindowStart = getWeeklyWindowStart();
  const consumed = await prisma.usageEvent.aggregate({
    where: {
      userId,
      eventType: "tries_consumed",
      createdAt: {
        gte: weeklyWindowStart,
      },
    },
    _sum: {
      units: true,
    },
  });

  const triesUsed = consumed._sum.units ?? 0;

  return {
    triesUsed,
    triesLimit: user.triesLimit,
    triesRemaining: Math.max(0, user.triesLimit - triesUsed),
  };
}

export function hasRemainingTries(triesUsed: number, triesLimit: number) {
  return triesUsed < triesLimit;
}
