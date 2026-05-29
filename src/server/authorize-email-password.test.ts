import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, verifyPasswordMock, checkRateLimitMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
    },
  },
  verifyPasswordMock: vi.fn(),
  checkRateLimitMock: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/password', () => ({ verifyPassword: verifyPasswordMock }))
vi.mock('@/server/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
}))

import { authorizeEmailPassword } from '@/server/authorize-email-password'

const validUser = {
  id: 'user_1',
  name: 'Ada',
  email: 'ada@example.com',
  image: null,
  role: 'USER',
  emailVerified: null,
  passwordHash: 'hashed',
}

describe('authorizeEmailPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockResolvedValue(true)
  })

  it('returns the user on valid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(validUser)
    verifyPasswordMock.mockResolvedValue(true)

    const result = await authorizeEmailPassword({
      email: 'ada@example.com',
      password: 'correct-horse',
    })

    expect(result).toEqual({
      id: 'user_1',
      name: 'Ada',
      email: 'ada@example.com',
      image: null,
      role: 'USER',
      emailVerified: null,
    })
  })

  it('rate-limits keyed by the normalized submitted email', async () => {
    prismaMock.user.findUnique.mockResolvedValue(validUser)
    verifyPasswordMock.mockResolvedValue(true)

    await authorizeEmailPassword({ email: 'Ada@Example.com', password: 'x' })

    expect(checkRateLimitMock).toHaveBeenCalledWith('login:ada@example.com', {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
  })

  it('returns null without touching the database when rate limited', async () => {
    checkRateLimitMock.mockResolvedValue(false)

    const result = await authorizeEmailPassword({
      email: 'ada@example.com',
      password: 'correct-horse',
    })

    expect(result).toBeNull()
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
    expect(verifyPasswordMock).not.toHaveBeenCalled()
  })

  it('returns null for invalid input without checking the rate limit', async () => {
    const result = await authorizeEmailPassword({ email: 'not-an-email', password: '' })

    expect(result).toBeNull()
    expect(checkRateLimitMock).not.toHaveBeenCalled()
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('returns null when the user has no password set', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...validUser, passwordHash: null })

    const result = await authorizeEmailPassword({
      email: 'ada@example.com',
      password: 'whatever',
    })

    expect(result).toBeNull()
    expect(verifyPasswordMock).not.toHaveBeenCalled()
  })

  it('returns null when the password is incorrect', async () => {
    prismaMock.user.findUnique.mockResolvedValue(validUser)
    verifyPasswordMock.mockResolvedValue(false)

    const result = await authorizeEmailPassword({
      email: 'ada@example.com',
      password: 'wrong',
    })

    expect(result).toBeNull()
  })
})
