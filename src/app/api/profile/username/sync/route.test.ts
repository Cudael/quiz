import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, unstableUpdateMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  unstableUpdateMock: vi.fn(),
  prismaMock: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/server/auth', () => ({ auth: authMock, unstable_update: unstableUpdateMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

import { GET } from './route'

describe('GET /api/profile/username/sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ user: { id: 'user-1' } })
    prismaMock.user.findUnique.mockResolvedValue({ username: 'quiz-fan' })
    unstableUpdateMock.mockResolvedValue({ user: { username: 'quiz-fan' } })
  })

  it('refreshes the JWT from the database and returns to the callback', async () => {
    const response = await GET(
      new Request('http://localhost/api/profile/username/sync?callbackUrl=%2Fprofile')
    )

    expect(unstableUpdateMock).toHaveBeenCalledWith({ user: { username: 'quiz-fan' } })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/profile')
  })

  it('returns an incomplete account to onboarding', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ username: null })

    const response = await GET(
      new Request('http://localhost/api/profile/username/sync?callbackUrl=%2Fcategories')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost/choose-username?callbackUrl=%2Fcategories'
    )
    expect(unstableUpdateMock).not.toHaveBeenCalled()
  })

  it('rejects external callback URLs', async () => {
    const response = await GET(
      new Request(
        'http://localhost/api/profile/username/sync?callbackUrl=https%3A%2F%2Fevil.example'
      )
    )

    expect(response.headers.get('location')).toBe('http://localhost/')
  })
})
