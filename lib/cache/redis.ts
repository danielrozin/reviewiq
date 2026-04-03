import { Redis } from "@upstash/redis";

// Singleton Redis client — returns null if env vars are missing
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const globalForRedis = globalThis as unknown as { redis: Redis | null | undefined };
const redis = globalForRedis.redis ?? createRedisClient();
if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// TTL presets in seconds
export const CacheTTL = {
  PRODUCT_LIST: 30 * 60,    // 30 minutes
  PRODUCT_DETAIL: 60 * 60,  // 1 hour
  SEARCH: 15 * 60,          // 15 minutes
  REVIEWS: 30 * 60,         // 30 minutes
} as const;

// Cache key builders
export const CacheKey = {
  productList: (params: string) => `products:list:${params}`,
  productDetail: (slug: string) => `products:detail:${slug}`,
  search: (query: string, limit: number) => `search:${query}:${limit}`,
  reviews: (params: string) => `reviews:list:${params}`,
} as const;

/**
 * Get a cached value. Returns null on miss or if Redis is unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  } catch {
    return null;
  }
}

/**
 * Set a cached value with TTL. Silently fails if Redis is unavailable.
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Graceful degradation — continue without cache
  }
}

/**
 * Delete one or more cache keys. Silently fails if Redis is unavailable.
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // Graceful degradation
  }
}

/**
 * Delete all keys matching a prefix pattern (e.g. "products:*").
 * Uses SCAN to avoid blocking. Silently fails if Redis is unavailable.
 */
export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  if (!redis) return;
  try {
    let cursor = "0";
    do {
      const result = await redis.scan(cursor, { match: `${prefix}*`, count: 100 });
      cursor = String(result[0]);
      const keys = result[1] as string[];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    // Graceful degradation
  }
}

/**
 * Invalidate all product-related caches (lists + detail for a specific slug).
 */
export async function invalidateProductCaches(slug?: string): Promise<void> {
  await cacheInvalidatePrefix("products:list:");
  await cacheInvalidatePrefix("search:");
  if (slug) {
    await cacheDel(CacheKey.productDetail(slug));
  }
}

/**
 * Invalidate review-related caches and the associated product detail cache.
 */
export async function invalidateReviewCaches(productSlug?: string): Promise<void> {
  await cacheInvalidatePrefix("reviews:list:");
  if (productSlug) {
    await cacheDel(CacheKey.productDetail(productSlug));
  }
}
