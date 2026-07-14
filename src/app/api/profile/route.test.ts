import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, prismaMock, cookiesMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
  cookiesMock: {
    delete: vi.fn(),
  },
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue(cookiesMock) }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

import { DELETE, PATCH } from '@/app/api/profile/route'

function createDeleteRequest(body: unknown) {
  return new Request('http://localhost/api/profile', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function createPatchRequest(body: unknown) {
  return new Request('http://localhost/api/profile', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)

    const response = await PATCH(createPatchRequest({}))

    expect(response.status).toBe(401)
  })

  it('updates profile and revalidates old/new username paths', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({ username: 'old-name' })
    prismaMock.$queryRaw.mockResolvedValue([])
    prismaMock.user.update.mockResolvedValue({})

    const response = await PATCH(
      createPatchRequest({
        username: 'new-name',
        bio: 'new bio',
        image: 'https://example.com/avatar.png',
        bannerImage: 'https://example.com/banner.png',
      })
    )

    expect(response.status).toBe(200)
    expect(prismaMock.user.update).toHaveBeenCalledOnce()
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bannerImage: 'https://example.com/banner.png',
        }),
      })
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/u/old-name')
    expect(revalidatePathMock).toHaveBeenCalledWith('/u/new-name')
  })

  it('returns 400 when username is taken', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({ username: 'old-name' })
    prismaMock.$queryRaw.mockResolvedValue([{ id: 'user_2' }])

    const response = await PATCH(
      createPatchRequest({
        username: 'taken-name',
      })
    )

    expect(response.status).toBe(400)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)
    const response = await DELETE(createDeleteRequest({ confirmUsername: '@user' }))
    expect(response.status).toBe(401)
  })

  it('returns 400 for mismatched confirmation username', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({ username: 'player-one' })

    const response = await DELETE(createDeleteRequest({ confirmUsername: '@other' }))
    expect(response.status).toBe(400)
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
  })

  it('deletes account when confirmation matches username', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({ username: 'player-one' })
    prismaMock.user.delete.mockResolvedValue({})

    const response = await DELETE(createDeleteRequest({ confirmUsername: '@player-one' }))

    expect(response.status).toBe(200)
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'user_1' } })
    expect(cookiesMock.delete).toHaveBeenCalled()
  })
})
