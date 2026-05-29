import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextAuthConfig } from 'next-auth'

const { state, nextAuthMock, prismaMock, generateUniqueUsernameMock, buildOAuthProvidersMock } =
  vi.hoisted(() => {
    const state = { config: null as NextAuthConfig | null }
    return {
      state,
      nextAuthMock: vi.fn((config: NextAuthConfig) => {
        state.config = config
        return {
          handlers: {},
          auth: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
        }
      }),
      prismaMock: {
        user: {
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        account: {
          upsert: vi.fn(),
        },
      },
      generateUniqueUsernameMock: vi.fn(),
      buildOAuthProvidersMock: vi.fn(() => []),
    }
  })

vi.mock('next-auth', () => ({
  default: nextAuthMock,
}))
vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn(() => ({})),
}))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/usernames', () => ({ generateUniqueUsername: generateUniqueUsernameMock }))
vi.mock('@/server/authorize-email-password', () => ({
  authorizeEmailPassword: vi.fn(),
}))
vi.mock('@/server/authorize-guest', () => ({
  authorizeGuest: vi.fn(),
}))
vi.mock('@/server/auth.config', () => ({
  authConfig: {},
  buildOAuthProviders: buildOAuthProvidersMock,
}))

type SignInCallback = NonNullable<NonNullable<NextAuthConfig['callbacks']>['signIn']>

function getSignInCallback(): SignInCallback {
  const callback = state.config?.callbacks?.signIn
  if (!callback) throw new Error('Missing signIn callback')
  return callback
}

describe('auth signIn callback', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    state.config = null
    buildOAuthProvidersMock.mockReturnValue([])
  })

  it('creates and links a database user for OAuth sign-ins', async () => {
    await import('@/server/auth')
    const signIn = getSignInCallback()

    prismaMock.user.findUnique.mockResolvedValue(null)
    generateUniqueUsernameMock.mockResolvedValue('new-user')
    prismaMock.user.create.mockResolvedValue({ id: 'db-user-1', emailVerified: new Date() })
    prismaMock.account.upsert.mockResolvedValue({})

    const user = { id: 'oauth-user', email: 'New@Example.com', name: 'New User', image: 'img' }
    const result = await signIn({
      user,
      account: {
        provider: 'google',
        providerAccountId: 'google-123',
        type: 'oauth',
      },
    } as Parameters<SignInCallback>[0])

    expect(result).toBe(true)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'new@example.com' },
      select: { id: true, emailVerified: true },
    })
    expect(generateUniqueUsernameMock).toHaveBeenCalledWith('New User')
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'New User',
        email: 'new@example.com',
        image: 'img',
        role: 'USER',
        username: 'new-user',
      }),
      select: { id: true, emailVerified: true },
    })
    expect(prismaMock.account.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: 'google-123',
          },
        },
        update: { userId: 'db-user-1' },
      })
    )
    expect(user.id).toBe('db-user-1')
  })

  it('marks existing OAuth users as verified and links their account', async () => {
    await import('@/server/auth')
    const signIn = getSignInCallback()

    prismaMock.user.findUnique.mockResolvedValue({ id: 'db-user-2', emailVerified: null })
    prismaMock.user.update.mockResolvedValue({ id: 'db-user-2', emailVerified: new Date() })
    prismaMock.account.upsert.mockResolvedValue({})

    const user = { id: 'oauth-user', email: 'existing@example.com', name: 'Existing', image: null }
    const result = await signIn({
      user,
      account: {
        provider: 'google',
        providerAccountId: 'google-999',
        type: 'oauth',
      },
    } as Parameters<SignInCallback>[0])

    expect(result).toBe(true)
    expect(prismaMock.user.create).not.toHaveBeenCalled()
    expect(generateUniqueUsernameMock).not.toHaveBeenCalled()
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'db-user-2' },
      data: { emailVerified: expect.any(Date) },
      select: { id: true, emailVerified: true },
    })
    expect(prismaMock.account.upsert).toHaveBeenCalled()
    expect(user.id).toBe('db-user-2')
  })

  it('skips database writes for credentials sign-ins', async () => {
    await import('@/server/auth')
    const signIn = getSignInCallback()

    const result = await signIn({
      user: { id: 'guest-1', email: null },
      account: { provider: 'credentials', providerAccountId: 'guest-1', type: 'credentials' },
    } as Parameters<SignInCallback>[0])

    expect(result).toBe(true)
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
    expect(prismaMock.account.upsert).not.toHaveBeenCalled()
  })
})
