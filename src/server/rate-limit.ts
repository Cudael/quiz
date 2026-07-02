/**
 * Rate limiter with Upstash Redis backend and in-memory fallback.
 *
 * When `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set the
 * limiter uses Redis so that counters are shared across all serverless
 * instances and survive cold starts.  When those variables are absent (local
 * dev, CI, or misconfigured environments) it falls back to a simple
 * in-memory fixed-window implementation that gives basic per-instance
 * protection.
 */

import { Redis } from '@upstash/redis'

interface RateLimitEntry {
  count: number
  /** Timestamp (ms) of the oldest request still within the window */
  windowStart: number
}

const store = new Map<string, RateLimitEntry>()

// Lazily initialised so the module can be imported without env vars present.
let redis: Redis | null = null
let warnedMissingRedis = false

function getRedis(): Redis | null {
  if (redis !== null) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    redis = new Redis({ url, token })
  } else if (process.env.NODE_ENV === 'production' && !warnedMissingRedis) {
    warnedMissingRedis = true
    console.error(
      '[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set. ' +
        'Rate limiting is degraded to per-instance in-memory counters, which can be ' +
        'bypassed across serverless instances. Configure Upstash Redis in production.'
    )
  }
  return redis
}

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
}

/**
 * Returns `true` when the request should be allowed, `false` when it exceeds
 * the limit.
 *
 * Uses Upstash Redis for shared counters across serverless instances when the
 * `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars are set;
 * falls back to an in-memory fixed-window counter otherwise.
 */
export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<boolean> {
  const client = getRedis()

  if (client) {
    try {
      const redisKey = `rl:${key}`
      const count = await client.incr(redisKey)
      // Set TTL only when the key is first created so the window resets after
      // windowMs regardless of how many requests arrive in the meantime.
      if (count === 1) {
        await client.pexpire(redisKey, config.windowMs)
      }
      return count <= config.limit
    } catch (error) {
      // Redis unavailable — fall through to in-memory limiter so the app
      // continues to function (with degraded cross-instance enforcement).
      console.warn('[rate-limit] Redis unavailable, falling back to in-memory limiter', error)
    }
  }

  // In-memory fixed-window fallback.
  const now = Date.now()
  const entry = store.get(key)

  // Lazy cleanup: purge expired entries when the store grows large to prevent
  // unbounded memory growth in long-running instances.
  if (store.size >= 10_000) {
    for (const [k, e] of store) {
      if (now - e.windowStart >= config.windowMs) store.delete(k)
    }
  }

  if (!entry || now - entry.windowStart >= config.windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= config.limit) {
    return false
  }

  entry.count += 1
  return true
}

/**
 * Extracts the client IP from a `Request` object.
 * Prefers the `x-real-ip` header (set by Vercel and trusted proxies, not
 * overridable by the client) before falling back to `x-forwarded-for`.
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}
