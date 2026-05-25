import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, sendPasswordResetEmailMock, checkRateLimitMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
    },
    verificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
  sendPasswordResetEmailMock: vi.fn(),
  checkRateLimitMock: vi.fn().mockReturnValue(true),
}))

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/email', () => ({ sendPasswordResetEmail: sendPasswordResetEmailMock }))
vi.mock('@/server/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { POST } from '@/app/api/auth/forgot-password/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockReturnValue(true)
  })

  it('always returns 200 when email does not exist (prevent enumeration)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const response = await POST(createRequest({ email: 'nobody@example.com' }))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled()
  })

  it('creates a hashed reset token and sends email when user exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1' })
    prismaMock.verificationToken.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.verificationToken.create.mockResolvedValue({})

    const response = await POST(createRequest({ email: 'user@example.com' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(prismaMock.verificationToken.create).toHaveBeenCalledOnce()
    const createdData = prismaMock.verificationToken.create.mock.calls[0][0].data
    // Token is stored as a SHA-256 hex hash (64 characters), not the raw token
    expect(createdData.token).toMatch(/^[0-9a-f]{64}$/)
    // Identifier uses the "reset:" prefix to distinguish from verify tokens
    expect(createdData.identifier).toBe('reset:user@example.com')
    expect(sendPasswordResetEmailMock).toHaveBeenCalledOnce()
  })

  it('deletes existing reset tokens before creating a new one', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1' })
    prismaMock.verificationToken.deleteMany.mockResolvedValue({ count: 1 })
    prismaMock.verificationToken.create.mockResolvedValue({})

    await POST(createRequest({ email: 'user@example.com' }))

    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'reset:user@example.com' },
    })
  })

  it('returns 200 when rate limited (prevents enumeration via timing)', async () => {
    checkRateLimitMock.mockReturnValue(false)
    const response = await POST(createRequest({ email: 'user@example.com' }))
    expect(response.status).toBe(200)
  })

  it('returns 200 for invalid email input', async () => {
    const response = await POST(createRequest({ email: 'not-an-email' }))
    expect(response.status).toBe(200)
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })
})
