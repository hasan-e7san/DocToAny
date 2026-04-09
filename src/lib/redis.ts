import IORedis from "ioredis";

let redisClient: IORedis | null = null;

export function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  redisClient = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    enableOfflineQueue: true,
  });

  redisClient.on("error", (error) => {
    console.error("[redis] connection error", error.message);
  });

  return redisClient;
}
