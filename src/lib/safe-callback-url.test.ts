import { describe, expect, it, beforeEach } from 'vitest'
import { safeCallbackUrl } from '@/lib/safe-callback-url'

describe('safeCallbackUrl', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_URL = undefined
  })

  it('returns defaultUrl when callbackUrl is undefined', () => {
    expect(safeCallbackUrl(undefined, '/me')).toBe('/me')
  })

  it('returns defaultUrl when callbackUrl is empty', () => {
    expect(safeCallbackUrl('', '/me')).toBe('/me')
  })

  it('allows a simple relative path', () => {
    expect(safeCallbackUrl('/me', '/fallback')).toBe('/me')
  })

  it('allows a relative path with query string', () => {
    expect(safeCallbackUrl('/quiz/123?mode=timed', '/fallback')).toBe('/quiz/123?mode=timed')
  })

  it('rejects protocol-relative URL (//evil.com)', () => {
    expect(safeCallbackUrl('//evil.com', '/me')).toBe('/me')
  })

  it('rejects an absolute external URL', () => {
    expect(safeCallbackUrl('https://evil.com/steal', '/me')).toBe('/me')
  })

  it('allows an absolute URL matching NEXTAUTH_URL origin', () => {
    process.env.NEXTAUTH_URL = 'https://busquiz.com'
    expect(safeCallbackUrl('https://busquiz.com/me', '/fallback')).toBe('https://busquiz.com/me')
  })

  it('rejects an absolute URL with different origin even when NEXTAUTH_URL is set', () => {
    process.env.NEXTAUTH_URL = 'https://busquiz.com'
    expect(safeCallbackUrl('https://other.com/page', '/fallback')).toBe('/fallback')
  })

  it('rejects an invalid absolute URL gracefully', () => {
    process.env.NEXTAUTH_URL = 'https://busquiz.com'
    expect(safeCallbackUrl('not-a-url', '/fallback')).toBe('/fallback')
  })
})
