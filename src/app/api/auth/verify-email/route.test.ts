import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    verificationToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

import { GET } from '@/app/api/auth/verify-email/route'

describe('GET /api/auth/verify-email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to sign-in for missing token', async () => {
    const response = await GET(new Request('http://localhost/api/auth/verify-email'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/sign-in')
  })

  it('verifies a valid token and redirects with success query', async () => {
    prismaMock.verificationToken.findUnique.mockResolvedValue({
      identifier: 'player@example.com',
      token: 'token_123',
      expires: new Date(Date.now() + 60_000),
    })
    prismaMock.user.update.mockResolvedValue({})
    prismaMock.verificationToken.delete.mockResolvedValue({})

    const response = await GET(
      new Request('http://localhost/api/auth/verify-email?token=token_123')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/sign-in?verified=1')
    expect(prismaMock.user.update).toHaveBeenCalledOnce()
    expect(prismaMock.verificationToken.delete).toHaveBeenCalledOnce()
  })

  it('deletes expired tokens and redirects to sign-in', async () => {
    prismaMock.verificationToken.findUnique.mockResolvedValue({
      identifier: 'player@example.com',
      token: 'token_123',
      expires: new Date(Date.now() - 60_000),
    })
    prismaMock.verificationToken.delete.mockResolvedValue({})

    const response = await GET(
      new Request('http://localhost/api/auth/verify-email?token=token_123')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/sign-in')
    expect(prismaMock.user.update).not.toHaveBeenCalled()
    expect(prismaMock.verificationToken.delete).toHaveBeenCalledOnce()
  })
})
