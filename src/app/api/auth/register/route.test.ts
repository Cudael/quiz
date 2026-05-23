import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, hashPasswordMock, generateUniqueUsernameMock } = vi.hoisted(() => ({
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
}))

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/password', () => ({ hashPassword: hashPasswordMock }))
vi.mock('@/lib/usernames', () => ({ generateUniqueUsername: generateUniqueUsernameMock }))

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
    vi.spyOn(console, 'log').mockImplementation(() => {})
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
        password: 'password123',
      })
    )

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(prismaMock.user.create).toHaveBeenCalledOnce()
    expect(prismaMock.verificationToken.create).toHaveBeenCalledOnce()
    expect(console.log).toHaveBeenCalled()
  })

  it('returns 409 when the email already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'existing' })

    const response = await POST(
      createRequest({
        name: 'Player One',
        email: 'player@example.com',
        password: 'password123',
      })
    )

    expect(response.status).toBe(409)
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
        password: 'password123',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Unable to register account.' })
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })
})
