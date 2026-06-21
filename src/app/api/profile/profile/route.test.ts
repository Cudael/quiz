import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, prismaMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

import { PATCH } from '@/app/api/profile/profile/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/profile/profile', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/profile/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)

    const response = await PATCH(createRequest({}))

    expect(response.status).toBe(401)
  })

  it('updates profile and revalidates old/new username paths', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({ username: 'old-name' })
    prismaMock.$queryRaw.mockResolvedValue([])
    prismaMock.user.update.mockResolvedValue({})

    const response = await PATCH(
      createRequest({
        name: 'New Name',
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
      createRequest({
        name: 'New Name',
        username: 'taken-name',
      })
    )

    expect(response.status).toBe(400)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })
})
