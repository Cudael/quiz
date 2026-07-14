import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, hashPasswordMock, issueEmailVerificationMock, checkRateLimitMock } = vi.hoisted(
  () => ({
    prismaMock: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      verificationToken: {
        create: vi.fn(),
      },
    },
    hashPasswordMock: vi.fn(),
    issueEmailVerificationMock: vi.fn(),
    checkRateLimitMock: vi.fn().mockResolvedValue(true),
  })
)

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/password', () => ({ hashPassword: hashPasswordMock }))
vi.mock('@/server/email-verification', () => ({
  issueEmailVerification: issueEmailVerificationMock,
}))
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
    issueEmailVerificationMock.mockResolvedValue('sent')
  })

  it('creates a user and returns 201 for valid registration data', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    hashPasswordMock.mockResolvedValue('hashed-password')
    prismaMock.user.create.mockResolvedValue({ id: 'user_1', email: 'player@example.com' })

    const response = await POST(
      createRequest({
        username: 'player-one',
        email: 'player@example.com',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ ok: true, emailSent: true })
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'player@example.com',
        passwordHash: 'hashed-password',
        role: 'USER',
        username: 'player-one',
      },
      select: { id: true },
    })
    expect(issueEmailVerificationMock).toHaveBeenCalledWith('player@example.com')
  })

  it('rejects a taken username with a specific error', async () => {
    prismaMock.user.findUnique.mockImplementation(async ({ where }: { where: never }) =>
      'username' in (where as object) ? { id: 'other-user' } : null
    )

    const response = await POST(
      createRequest({
        username: 'player-one',
        email: 'player@example.com',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'That username is already taken.' })
    expect(prismaMock.user.create).not.toHaveBeenCalled()
  })

  it('returns 400 with a generic error when the email is verified (no enumeration)', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'existing',
      emailVerified: new Date(),
      passwordHash: 'hash',
    })

    const response = await POST(
      createRequest({
        username: 'player-one',
        email: 'player@example.com',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to register account.' })
    expect(prismaMock.user.create).not.toHaveBeenCalled()
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('lets a new registrant take over an unverified password-only account', async () => {
    prismaMock.user.findUnique.mockImplementation(async ({ where }: { where: never }) =>
      'email' in (where as object)
        ? { id: 'squatter', emailVerified: null, passwordHash: 'old-hash' }
        : null
    )
    hashPasswordMock.mockResolvedValue('new-hash')
    prismaMock.user.update.mockResolvedValue({ id: 'squatter' })

    const response = await POST(
      createRequest({
        username: 'player-two',
        email: 'player@example.com',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ ok: true, emailSent: true })
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'squatter' },
      data: { username: 'player-two', passwordHash: 'new-hash' },
      select: { id: true },
    })
    expect(prismaMock.user.create).not.toHaveBeenCalled()
    expect(issueEmailVerificationMock).toHaveBeenCalledWith('player@example.com')
  })

  it('never takes over an unverified account without a password (OAuth-created)', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'oauth-user',
      emailVerified: null,
      passwordHash: null,
    })

    const response = await POST(
      createRequest({
        username: 'player-one',
        email: 'player@example.com',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(400)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
    expect(prismaMock.user.create).not.toHaveBeenCalled()
  })

  it('returns 400 when the password is too weak', async () => {
    const response = await POST(
      createRequest({
        username: 'player-one',
        email: 'player@example.com',
        password: 'short',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to register account.' })
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('returns 400 when the username is malformed', async () => {
    const response = await POST(
      createRequest({
        username: 'Player One!',
        email: 'player@example.com',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to register account.' })
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('returns 400 when email is invalid', async () => {
    const response = await POST(
      createRequest({
        username: 'player-one',
        email: 'not-an-email',
        password: 'Password1!',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to register account.' })
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })
})
