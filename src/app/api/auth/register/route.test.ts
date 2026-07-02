import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  prismaMock,
  hashPasswordMock,
  generateUniqueUsernameMock,
  sendVerificationEmailMock,
  checkRateLimitMock,
} = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    verificationToken: {
      create: vi.fn(),
    },
  },
  hashPasswordMock: vi.fn(),
  generateUniqueUsernameMock: vi.fn(),
  sendVerificationEmailMock: vi.fn(),
  checkRateLimitMock: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/password', () => ({ hashPassword: hashPasswordMock }))
vi.mock('@/lib/usernames', () => ({ generateUniqueUsername: generateUniqueUsernameMock }))
vi.mock('@/server/email', () => ({ sendVerificationEmail: sendVerificationEmailMock }))
vi.mock('@/server/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { POST } from '@/app/api/auth/register/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockResolvedValue(true)
  })

  it('creates a user and returns 201 for valid registration data', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    hashPasswordMock.mockResolvedValue('hashed-password')
    generateUniqueUsernameMock.mockResolvedValue('player-one')
    prismaMock.user.create.mockResolvedValue({ id: 'user_1', email: 'player@example.com' })
    prismaMock.verificationToken.create.mockResolvedValue({})

    const response = await POST(
      createRequest({
        name: 'Player One',
        email: 'player@example.com',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(prismaMock.user.create).toHaveBeenCalledOnce()
    expect(prismaMock.verificationToken.create).toHaveBeenCalledOnce()
    expect(sendVerificationEmailMock).toHaveBeenCalledOnce()
    expect(sendVerificationEmailMock.mock.calls[0][1]).toMatch(
      /^http:\/\/localhost:3000\/api\/auth\/verify-email\?token=/
    )
  })

  it('returns 400 with a generic error when the email already exists (no enumeration)', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'existing' })

    const response = await POST(
      createRequest({
        name: 'Player One',
        email: 'player@example.com',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to register account.' })
    expect(prismaMock.user.create).not.toHaveBeenCalled()
  })

  it('returns 400 when the password is too weak', async () => {
    const response = await POST(
      createRequest({
        name: 'Player One',
        email: 'player@example.com',
        password: 'short',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to register account.' })
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('returns 400 when email is invalid', async () => {
    const response = await POST(
      createRequest({
        name: 'Player One',
        email: 'not-an-email',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to register account.' })
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })
})
