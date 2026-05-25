import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, sendPasswordResetEmailMock, checkRateLimitMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
    },
    verificationToken: {
      findMany: vi.fn(),
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

  it('creates a reset token and sends email when user exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1' })
    prismaMock.verificationToken.findMany.mockResolvedValue([])
    prismaMock.verificationToken.create.mockResolvedValue({})

    const response = await POST(createRequest({ email: 'user@example.com' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(prismaMock.verificationToken.create).toHaveBeenCalledOnce()
    const createdData = prismaMock.verificationToken.create.mock.calls[0][0].data
    expect(createdData.token).toMatch(/^RESET:/)
    expect(sendPasswordResetEmailMock).toHaveBeenCalledOnce()
  })

  it('deletes existing reset tokens before creating a new one', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1' })
    prismaMock.verificationToken.findMany.mockResolvedValue([
      { token: 'RESET:oldtoken123' },
      { token: 'verifytoken456' },
    ])
    prismaMock.verificationToken.deleteMany.mockResolvedValue({ count: 1 })
    prismaMock.verificationToken.create.mockResolvedValue({})

    await POST(createRequest({ email: 'user@example.com' }))

    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'user@example.com', token: { in: ['RESET:oldtoken123'] } },
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
