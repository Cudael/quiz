import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, hashPasswordMock, checkRateLimitMock } = vi.hoisted(() => {
  const prismaMock = {
    user: {
      update: vi.fn(),
    },
    verificationToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  }
  // Array-form $transaction: await all operation promises passed in.
  prismaMock.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
    Promise.all(operations)
  )
  return {
    prismaMock,
    hashPasswordMock: vi.fn(),
    checkRateLimitMock: vi.fn().mockResolvedValue(true),
  }
})

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/password', () => ({ hashPassword: hashPasswordMock }))
vi.mock('@/server/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { POST } from '@/app/api/auth/reset-password/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/auth/reset-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// A valid raw token (64 hex chars) as the user would receive in their email
const VALID_RAW_TOKEN = 'a'.repeat(64)
const FUTURE_EXPIRY = new Date(Date.now() + 60 * 60 * 1000)

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockResolvedValue(true)
    prismaMock.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations)
    )
  })

  it('rejects a token not found in the database', async () => {
    prismaMock.verificationToken.findUnique.mockResolvedValue(null)
    const response = await POST(
      createRequest({ token: VALID_RAW_TOKEN, newPassword: 'Password1!' })
    )
    expect(response.status).toBe(400)
  })

  it('rejects a token without the reset: identifier prefix', async () => {
    // Token exists in DB but has a verify identifier, not a reset: one
    prismaMock.verificationToken.findUnique.mockResolvedValue({
      identifier: 'user@example.com', // no "reset:" prefix
      token: 'somehash',
      expires: FUTURE_EXPIRY,
    })
    const response = await POST(
      createRequest({ token: VALID_RAW_TOKEN, newPassword: 'Password1!' })
    )
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid or expired reset link.',
    })
  })

  it('rejects an expired token', async () => {
    prismaMock.verificationToken.findUnique.mockResolvedValue({
      identifier: 'reset:user@example.com',
      token: 'somehash',
      expires: new Date(Date.now() - 1000),
    })
    prismaMock.verificationToken.delete.mockResolvedValue({})

    const response = await POST(
      createRequest({ token: VALID_RAW_TOKEN, newPassword: 'Password1!' })
    )
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('expired'),
    })
    expect(prismaMock.verificationToken.delete).toHaveBeenCalledOnce()
  })

  it('updates the password and deletes the token on success', async () => {
    prismaMock.verificationToken.findUnique.mockResolvedValue({
      identifier: 'reset:user@example.com',
      token: 'somehash',
      expires: FUTURE_EXPIRY,
    })
    hashPasswordMock.mockResolvedValue('new-hash')
    prismaMock.user.update.mockResolvedValue({})
    prismaMock.verificationToken.delete.mockResolvedValue({})

    const response = await POST(
      createRequest({ token: VALID_RAW_TOKEN, newPassword: 'Password1!' })
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { passwordHash: 'new-hash' },
    })
    expect(prismaMock.verificationToken.delete).toHaveBeenCalledOnce()
  })

  it('returns 400 when the token was already consumed by a concurrent request', async () => {
    prismaMock.verificationToken.findUnique.mockResolvedValue({
      identifier: 'reset:user@example.com',
      token: 'somehash',
      expires: FUTURE_EXPIRY,
    })
    hashPasswordMock.mockResolvedValue('new-hash')
    // Simulate the transaction failing because the token row no longer exists.
    prismaMock.$transaction.mockRejectedValue(new Error('Record to delete does not exist.'))

    const response = await POST(
      createRequest({ token: VALID_RAW_TOKEN, newPassword: 'Password1!' })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid or expired reset link.',
    })
  })

  it('returns 429 when rate limited', async () => {
    checkRateLimitMock.mockResolvedValue(false)
    const response = await POST(
      createRequest({ token: VALID_RAW_TOKEN, newPassword: 'Password1!' })
    )
    expect(response.status).toBe(429)
  })

  it('rejects a weak new password', async () => {
    const response = await POST(createRequest({ token: VALID_RAW_TOKEN, newPassword: 'weakpass' }))
    expect(response.status).toBe(400)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })
})
