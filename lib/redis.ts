// lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache utilities
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get<T>(key);

  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

export async function invalidateCache(pattern: string) {
  // Get all keys matching pattern
  const keys = await redis.keys(pattern);

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Cache key builders
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userPermissions: (userId: string) => `user:${userId}:permissions`,
  menuItems: () => "menu:items",
  menuItem: (id: string) => `menu:item:${id}`,
  menuByCategory: (category: string) => `menu:category:${category}`,
  table: (id: number) => `table:${id}`,
  tables: () => "tables",
  order: (id: string) => `order:${id}`,
  ordersByTable: (tableId: number) => `orders:table:${tableId}`,
  activeOrders: () => "orders:active",
};
