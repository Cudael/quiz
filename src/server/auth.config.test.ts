import { describe, expect, it } from 'vitest'
import { authConfig } from '@/server/auth.config'
import type { NextAuthConfig } from 'next-auth'

type JwtCallback = NonNullable<NonNullable<NextAuthConfig['callbacks']>['jwt']>
type JwtParams = Parameters<JwtCallback>[0]
type SessionCallback = NonNullable<NonNullable<NextAuthConfig['callbacks']>['session']>
type SessionParams = Parameters<SessionCallback>[0]
type RedirectCallback = NonNullable<NonNullable<NextAuthConfig['callbacks']>['redirect']>
type RedirectParams = Parameters<RedirectCallback>[0]

describe('authConfig edge callbacks', () => {
  it('stamps role onto the token on sign-in', async () => {
    const jwt = authConfig.callbacks?.jwt
    if (!jwt) throw new Error('Missing jwt callback')
    const token = await jwt({ token: {}, user: { role: 'ADMIN' } } as JwtParams)
    if (!token) throw new Error('Missing token')

    expect(token.role).toBe('ADMIN')
  })

  it('preserves existing token role when user is not present', async () => {
    const jwt = authConfig.callbacks?.jwt
    if (!jwt) throw new Error('Missing jwt callback')
    const token = await jwt({
      token: { role: 'USER' },
      user: undefined as unknown as JwtParams['user'],
    })
    if (!token) throw new Error('Missing token')

    expect(token.role).toBe('USER')
  })

  it('copies role from token onto the session user', async () => {
    const sessionCallback = authConfig.callbacks?.session
    if (!sessionCallback) throw new Error('Missing session callback')

    const session = (await sessionCallback({
      session: { user: { name: 'Admin', email: 'admin@example.com', image: null } },
      token: { role: 'ADMIN' },
    } as unknown as SessionParams)) as { user: { role?: string } }

    expect(session.user.role).toBe('ADMIN')
  })

  it('resolves auth-page callbackUrl redirects to the final destination', async () => {
    const redirectCallback = authConfig.callbacks?.redirect
    if (!redirectCallback) throw new Error('Missing redirect callback')

    const result = await redirectCallback({
      url: 'https://quiz.example/sign-in?callbackUrl=%2Fprofile',
      baseUrl: 'https://quiz.example',
    } as RedirectParams)

    expect(result).toBe('https://quiz.example/profile')
  })

  it('falls back to /profile for auth-page redirects without a callbackUrl', async () => {
    const redirectCallback = authConfig.callbacks?.redirect
    if (!redirectCallback) throw new Error('Missing redirect callback')

    const result = await redirectCallback({
      url: 'https://quiz.example/sign-in',
      baseUrl: 'https://quiz.example',
    } as RedirectParams)

    expect(result).toBe('https://quiz.example/profile')
  })
})
