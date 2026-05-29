import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, checkRateLimitMock, getClientIpMock, generateUniqueUsernameMock } = vi.hoisted(
  () => ({
    prismaMock: {
      user: {
        create: vi.fn(),
      },
    },
    checkRateLimitMock: vi.fn().mockReturnValue(true),
    getClientIpMock: vi.fn().mockReturnValue('1.2.3.4'),
    generateUniqueUsernameMock: vi.fn().mockResolvedValue('alice123'),
  })
)

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: getClientIpMock,
}))
vi.mock('@/lib/usernames', () => ({ generateUniqueUsername: generateUniqueUsernameMock }))

import { authorizeGuest } from '@/server/authorize-guest'

function makeRequest(ip?: string): Request {
  return new Request('http://localhost/api/auth/callback/credentials', {
    method: 'POST',
    headers: ip ? { 'x-real-ip': ip } : {},
  })
}

describe('authorizeGuest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockReturnValue(true)
    getClientIpMock.mockReturnValue('1.2.3.4')
    generateUniqueUsernameMock.mockResolvedValue('alice123')
    prismaMock.user.create.mockResolvedValue({
      id: 'user_1',
      name: 'Alice',
      username: 'alice123',
      email: null,
      role: 'USER',
    })
  })

  it('creates a guest user on valid credentials', async () => {
    const result = await authorizeGuest({ name: 'Alice' }, makeRequest('1.2.3.4'))

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Alice',
        username: 'alice123',
        email: null,
        role: 'USER',
      },
    })
    expect(result).not.toBeNull()
  })

  it('returns null for invalid credentials without checking the rate limit', async () => {
    const result = await authorizeGuest({ name: '' }, makeRequest())

    expect(result).toBeNull()
    expect(checkRateLimitMock).not.toHaveBeenCalled()
    expect(prismaMock.user.create).not.toHaveBeenCalled()
  })

  it('rate-limits by IP when available', async () => {
    getClientIpMock.mockReturnValue('5.5.5.5')
    await authorizeGuest({ name: 'Alice' }, makeRequest('5.5.5.5'))

    expect(checkRateLimitMock).toHaveBeenCalledWith('guest:5.5.5.5', {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    })
  })

  it('falls back to name-based key when IP is unknown', async () => {
    getClientIpMock.mockReturnValue('unknown')
    await authorizeGuest({ name: 'Alice' }, makeRequest())

    expect(checkRateLimitMock).toHaveBeenCalledWith('guest:name:Alice', expect.any(Object))
  })

  it('falls back to name-based key when no request is provided', async () => {
    await authorizeGuest({ name: 'Alice' })

    expect(checkRateLimitMock).toHaveBeenCalledWith('guest:name:Alice', expect.any(Object))
  })

  it('returns null without creating a user when rate limited', async () => {
    checkRateLimitMock.mockReturnValue(false)

    const result = await authorizeGuest({ name: 'Alice' }, makeRequest())

    expect(result).toBeNull()
    expect(prismaMock.user.create).not.toHaveBeenCalled()
  })
})
