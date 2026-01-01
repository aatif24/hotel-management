import { redis, cacheKeys } from "@lib/redis";

export async function withCircuitBreaker<T>(fn: () => Promise<T>): Promise<T> {
  const isOpen = await redis.get(cacheKeys.circuitBreaker());
  if (isOpen) throw new Error("DB temporarily unavailable");

  try {
    return await fn();
  } catch (err) {
    await redis.set(cacheKeys.circuitBreaker(), "open", { ex: 10 }); // 10 sec
    throw err;
  }
}
