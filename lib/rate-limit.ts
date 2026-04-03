// Simple in-memory rate limiter for Next.js API routes
// Usage: const limiter = createRateLimiter({ interval: 60000, limit: 60 })
//        const result = limiter.check(ip) → { success: boolean, remaining: number }

interface RateLimitConfig {
  interval: number; // ms
  limit: number;    // max requests per interval
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const tokens = new Map<string, { count: number; resetAt: number }>();

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tokens) {
      if (value.resetAt < now) tokens.delete(key);
    }
  }, config.interval * 2);

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const entry = tokens.get(key);

      if (!entry || entry.resetAt < now) {
        tokens.set(key, { count: 1, resetAt: now + config.interval });
        return { success: true, remaining: config.limit - 1, reset: now + config.interval };
      }

      if (entry.count >= config.limit) {
        return { success: false, remaining: 0, reset: entry.resetAt };
      }

      entry.count++;
      return { success: true, remaining: config.limit - entry.count, reset: entry.resetAt };
    }
  };
}

// Pre-configured limiters for different endpoints
export const reviewLimiter = createRateLimiter({ interval: 3600000, limit: 5 });   // 5/hour
export const searchLimiter = createRateLimiter({ interval: 60000, limit: 60 });    // 60/min
export const authLimiter = createRateLimiter({ interval: 600000, limit: 10 });     // 10/10min
