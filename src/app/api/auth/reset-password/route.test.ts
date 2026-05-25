import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, hashPasswordMock, checkRateLimitMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      update: vi.fn(),
    },
    verificationToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
  hashPasswordMock: vi.fn(),
  checkRateLimitMock: vi.fn().mockReturnValue(true),
}))

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

const VALID_TOKEN = `RESET:${'a'.repeat(64)}`
const FUTURE_EXPIRY = new Date(Date.now() + 60 * 60 * 1000)

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockReturnValue(true)
  })

  it('rejects a token that does not start with RESET:', async () => {
    const response = await POST(
      createRequest({ token: 'verifytoken123', newPassword: 'Password1!' })
    )
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid or expired reset link.',
    })
  })

  it('rejects a token not found in the database', async () => {
    prismaMock.verificationToken.findUnique.mockResolvedValue(null)
    const response = await POST(createRequest({ token: VALID_TOKEN, newPassword: 'Password1!' }))
    expect(response.status).toBe(400)
  })

  it('rejects an expired token', async () => {
    prismaMock.verificationToken.findUnique.mockResolvedValue({
      identifier: 'user@example.com',
      token: VALID_TOKEN,
      expires: new Date(Date.now() - 1000),
    })
    prismaMock.verificationToken.delete.mockResolvedValue({})

    const response = await POST(createRequest({ token: VALID_TOKEN, newPassword: 'Password1!' }))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('expired'),
    })
    expect(prismaMock.verificationToken.delete).toHaveBeenCalledOnce()
  })

  it('updates the password and deletes the token on success', async () => {
    prismaMock.verificationToken.findUnique.mockResolvedValue({
      identifier: 'user@example.com',
      token: VALID_TOKEN,
      expires: FUTURE_EXPIRY,
    })
    hashPasswordMock.mockResolvedValue('new-hash')
    prismaMock.user.update.mockResolvedValue({})
    prismaMock.verificationToken.delete.mockResolvedValue({})

    const response = await POST(createRequest({ token: VALID_TOKEN, newPassword: 'Password1!' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { passwordHash: 'new-hash' },
    })
    expect(prismaMock.verificationToken.delete).toHaveBeenCalledOnce()
  })

  it('returns 429 when rate limited', async () => {
    checkRateLimitMock.mockReturnValue(false)
    const response = await POST(createRequest({ token: VALID_TOKEN, newPassword: 'Password1!' }))
    expect(response.status).toBe(429)
  })

  it('rejects a weak new password', async () => {
    const response = await POST(createRequest({ token: VALID_TOKEN, newPassword: 'weakpass' }))
    expect(response.status).toBe(400)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })
})
