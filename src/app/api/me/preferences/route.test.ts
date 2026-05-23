import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

import { PATCH } from '@/app/api/me/preferences/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/me/preferences', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/me/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)
    const response = await PATCH(createRequest({ preferences: { defaultMode: 'CLASSIC' } }))
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid payload', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    const response = await PATCH(createRequest({ preferences: { unknownPreference: true } }))
    expect(response.status).toBe(400)
  })

  it('merges and persists preferences', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.user.findUnique.mockResolvedValue({
      preferences: JSON.stringify({ defaultMode: 'CLASSIC', reducedMotion: false }),
    })
    prismaMock.user.update.mockResolvedValue({})

    const response = await PATCH(createRequest({ preferences: { defaultDifficulty: 'HARD' } }))

    expect(response.status).toBe(200)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: {
        preferences: JSON.stringify({
          defaultMode: 'CLASSIC',
          reducedMotion: false,
          defaultDifficulty: 'HARD',
        }),
      },
    })
  })
})
