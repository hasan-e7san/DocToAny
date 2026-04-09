import { getRedisConnection } from "@/lib/redis";

type RateLimitConfig = {
  key: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type LocalRateLimitEntry = {
  count: number;
  expiresAt: number;
};

const localRateLimitStore = new Map<string, LocalRateLimitEntry>();

function normalizeIp(ip: string): string {
  const trimmed = ip.trim();
  if (!trimmed) {
    return "unknown";
  }
  if (trimmed.startsWith("::ffff:")) {
    return trimmed.replace("::ffff:", "");
  }
  return trimmed;
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0] ?? "";
    return normalizeIp(first);
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return normalizeIp(realIp);
  }

  return "unknown";
}

export function isTrustedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(req.url);
    return originUrl.origin === requestUrl.origin;
  } catch {
    return false;
  }
}

function rateLimitWithMemory(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const current = localRateLimitStore.get(config.key);

  if (!current || current.expiresAt <= now) {
    localRateLimitStore.set(config.key, {
      count: 1,
      expiresAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(config.limit - 1, 0),
      retryAfterSeconds: config.windowSeconds,
    };
  }

  current.count += 1;
  localRateLimitStore.set(config.key, current);

  const retryAfterSeconds = Math.max(Math.ceil((current.expiresAt - now) / 1000), 1);
  const remaining = Math.max(config.limit - current.count, 0);

  return {
    allowed: current.count <= config.limit,
    remaining,
    retryAfterSeconds,
  };
}

export async function enforceRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const redis = getRedisConnection();

  if (!redis) {
    return rateLimitWithMemory(config);
  }

  try {
    const transaction = redis.multi();
    transaction.incr(config.key);
    transaction.expire(config.key, config.windowSeconds, "NX");
    transaction.ttl(config.key);

    const result = await transaction.exec();

    const incremented = Number(result?.[0]?.[1] ?? 1);
    const ttl = Number(result?.[2]?.[1] ?? config.windowSeconds);
    const retryAfterSeconds = ttl > 0 ? ttl : config.windowSeconds;
    const remaining = Math.max(config.limit - incremented, 0);

    return {
      allowed: incremented <= config.limit,
      remaining,
      retryAfterSeconds,
    };
  } catch {
    return rateLimitWithMemory(config);
  }
}