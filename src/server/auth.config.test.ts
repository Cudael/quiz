import { describe, expect, it } from 'vitest'
import { authConfig } from '@/server/auth.config'

describe('authConfig edge callbacks', () => {
  it('stamps role onto the token on sign-in', async () => {
    const jwt = authConfig.callbacks?.jwt
    if (!jwt) throw new Error('Missing jwt callback')
    const token = await jwt({ token: {}, user: { role: 'ADMIN' } as never })
    if (!token) throw new Error('Missing token')

    expect(token.role).toBe('ADMIN')
  })

  it('preserves existing token role when user is not present', async () => {
    const jwt = authConfig.callbacks?.jwt
    if (!jwt) throw new Error('Missing jwt callback')
    const token = await jwt({ token: { role: 'USER' }, user: undefined as never })
    if (!token) throw new Error('Missing token')

    expect(token.role).toBe('USER')
  })

  it('copies role from token onto the session user', async () => {
    const sessionCallback = authConfig.callbacks?.session
    if (!sessionCallback) throw new Error('Missing session callback')

    const session = (await sessionCallback({
      session: { user: { name: 'Admin', email: 'admin@example.com', image: null } },
      token: { role: 'ADMIN' },
    } as never)) as { user: { role?: string } }

    expect(session.user.role).toBe('ADMIN')
  })
})
