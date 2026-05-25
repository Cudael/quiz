/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Suitable for serverless deployments (Vercel) where each cold start gets a
 * fresh Map. Provides basic brute-force protection within a single instance.
 */

interface RateLimitEntry {
  count: number
  /** Timestamp (ms) of the oldest request still within the window */
  windowStart: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
}

/**
 * Returns `true` when the request should be allowed, `false` when it exceeds
 * the limit.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart >= config.windowMs) {
    // No existing entry or window has expired — start a fresh window.
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
 * Prefers the `x-forwarded-for` header (set by Vercel / proxies).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}
