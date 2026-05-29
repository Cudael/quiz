import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, prismaMock, verifyPasswordMock, hashPasswordMock, checkRateLimitMock } =
  vi.hoisted(() => ({
    authMock: vi.fn(),
    prismaMock: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
    verifyPasswordMock: vi.fn(),
    hashPasswordMock: vi.fn(),
    checkRateLimitMock: vi.fn().mockResolvedValue(true),
  }))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/password', () => ({
  verifyPassword: verifyPasswordMock,
  hashPassword: hashPasswordMock,
}))
vi.mock('@/server/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { POST } from '@/app/api/me/password/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/me/password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/me/password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)
    checkRateLimitMock.mockResolvedValue(true)
    const response = await POST(createRequest({ currentPassword: 'a', newPassword: 'Password1!' }))
    expect(response.status).toBe(401)
  })

  it('rejects wrong current password', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({ passwordHash: 'hash' })
    verifyPasswordMock.mockResolvedValue(false)
    checkRateLimitMock.mockResolvedValue(true)

    const response = await POST(
      createRequest({ currentPassword: 'wrong-pass', newPassword: 'Password1!' })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to change password.' })
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('updates password when credentials are valid', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({ passwordHash: 'hash' })
    verifyPasswordMock.mockResolvedValue(true)
    hashPasswordMock.mockResolvedValue('new-hash')
    prismaMock.user.update.mockResolvedValue({})
    checkRateLimitMock.mockResolvedValue(true)

    const response = await POST(
      createRequest({ currentPassword: 'Password1!', newPassword: 'NewPassword1!' })
    )

    expect(response.status).toBe(200)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: { passwordHash: 'new-hash' },
    })
  })
})
