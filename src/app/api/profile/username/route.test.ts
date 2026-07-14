import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'

const { authMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

import { POST } from './route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/profile/username', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/profile/username', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ user: { id: 'user-1' } })
    prismaMock.user.findUnique.mockResolvedValue({ username: null })
    prismaMock.user.findFirst.mockResolvedValue(null)
    prismaMock.user.update.mockResolvedValue({ id: 'user-1' })
  })

  it('rejects unauthenticated requests', async () => {
    authMock.mockResolvedValue(null)

    const response = await POST(createRequest({ username: 'quiz-fan' }))

    expect(response.status).toBe(401)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('claims a username for an account without one', async () => {
    const response = await POST(createRequest({ username: 'quiz-fan' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, username: 'quiz-fan' })
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { username: 'quiz-fan' },
      select: { id: true },
    })
  })

  it('rejects malformed usernames', async () => {
    const response = await POST(createRequest({ username: 'Bad Name!' }))

    expect(response.status).toBe(400)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('rejects a case-insensitive username collision', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'other-user' })

    const response = await POST(createRequest({ username: 'quiz-fan' }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'That username is already taken.' })
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { username: { equals: 'quiz-fan', mode: 'insensitive' } },
      select: { id: true },
    })
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('refuses to overwrite an existing username', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ username: 'already-set' })

    const response = await POST(createRequest({ username: 'quiz-fan' }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Username is already set. You can change it in profile settings.',
    })
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('reports taken usernames from the unique constraint', async () => {
    prismaMock.user.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('taken', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['username'] },
      })
    )

    const response = await POST(createRequest({ username: 'quiz-fan' }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'That username is already taken.' })
  })
})
