import { Redis } from "@upstash/redis";

let redisClient: Redis | null | undefined;

export function getRedisClient(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({
    url,
    token,
  });

  return redisClient;
}

export async function shouldEmitAlert(dedupeKey: string, ttlSeconds = 600): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return true;

  try {
    const result = await redis.set(dedupeKey, "1", {
      nx: true,
      ex: ttlSeconds,
    });
    return result === "OK";
  } catch (error) {
    console.error("[redis] dedupe set failed", error);
    return true;
  }
}
