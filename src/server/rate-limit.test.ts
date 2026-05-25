import { describe, expect, it } from 'vitest'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

describe('checkRateLimit', () => {
  it('allows requests within the limit', () => {
    const key = `test-allow-${Math.random()}`
    expect(checkRateLimit(key, { limit: 3, windowMs: 60_000 })).toBe(true)
    expect(checkRateLimit(key, { limit: 3, windowMs: 60_000 })).toBe(true)
    expect(checkRateLimit(key, { limit: 3, windowMs: 60_000 })).toBe(true)
  })

  it('blocks the request that exceeds the limit', () => {
    const key = `test-block-${Math.random()}`
    checkRateLimit(key, { limit: 2, windowMs: 60_000 })
    checkRateLimit(key, { limit: 2, windowMs: 60_000 })
    expect(checkRateLimit(key, { limit: 2, windowMs: 60_000 })).toBe(false)
  })

  it('resets counter after the window expires', () => {
    const key = `test-reset-${Math.random()}`
    checkRateLimit(key, { limit: 1, windowMs: 0 })
    // Window of 0ms has already expired — next call should start fresh
    expect(checkRateLimit(key, { limit: 1, windowMs: 0 })).toBe(true)
  })

  it('tracks different keys independently', () => {
    const key1 = `test-key1-${Math.random()}`
    const key2 = `test-key2-${Math.random()}`
    checkRateLimit(key1, { limit: 1, windowMs: 60_000 })
    expect(checkRateLimit(key1, { limit: 1, windowMs: 60_000 })).toBe(false)
    expect(checkRateLimit(key2, { limit: 1, windowMs: 60_000 })).toBe(true)
  })
})

describe('getClientIp', () => {
  it('extracts the first IP from x-forwarded-for', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('returns "unknown" when no forwarded header is present', () => {
    const req = new Request('http://localhost/')
    expect(getClientIp(req)).toBe('unknown')
  })
})
