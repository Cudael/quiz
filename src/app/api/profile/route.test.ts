import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, prismaMock, cookiesMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
  cookiesMock: {
    delete: vi.fn(),
  },
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue(cookiesMock) }))

import { DELETE } from '@/app/api/profile/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/profile', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('DELETE /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)
    const response = await DELETE(createRequest({ confirmUsername: '@user' }))
    expect(response.status).toBe(401)
  })

  it('returns 400 for mismatched confirmation username', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({ username: 'player-one' })

    const response = await DELETE(createRequest({ confirmUsername: '@other' }))
    expect(response.status).toBe(400)
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
  })

  it('deletes account when confirmation matches username', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({ username: 'player-one' })
    prismaMock.user.delete.mockResolvedValue({})

    const response = await DELETE(createRequest({ confirmUsername: '@player-one' }))

    expect(response.status).toBe(200)
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'user_1' } })
    expect(cookiesMock.delete).toHaveBeenCalled()
  })
})
