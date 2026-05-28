import { describe, expect, it } from 'vitest'
import { guestOnlyAuthRoutes, isGuestOnlyAuthRoute, middlewareMatcher } from '@/server/auth-routes'

describe('auth routes', () => {
  it('contains sign-in and sign-up in guest-only routes', () => {
    expect(guestOnlyAuthRoutes).toEqual(['/sign-in', '/sign-up'])
  })

  it('exposes middleware matcher including auth pages', () => {
    expect(middlewareMatcher).toContain('/sign-in')
    expect(middlewareMatcher).toContain('/sign-up')
  })

  it('detects guest-only auth routes correctly', () => {
    expect(isGuestOnlyAuthRoute('/sign-in')).toBe(true)
    expect(isGuestOnlyAuthRoute('/sign-up')).toBe(true)
    expect(isGuestOnlyAuthRoute('/studio')).toBe(false)
  })
})
