import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, issueEmailVerificationMock, isConfiguredMock, checkRateLimitMock } = vi.hoisted(
  () => ({
    prismaMock: { user: { findUnique: vi.fn() } },
    issueEmailVerificationMock: vi.fn(),
    isConfiguredMock: vi.fn(),
    checkRateLimitMock: vi.fn(),
  })
)

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/email-verification', () => ({
  issueEmailVerification: issueEmailVerificationMock,
}))
vi.mock('@/server/email', () => ({ isEmailDeliveryConfigured: isConfiguredMock }))
vi.mock('@/server/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { POST } from './route'

function request(email: string) {
  return new Request('http://localhost/api/auth/resend-verification', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

describe('POST /api/auth/resend-verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isConfiguredMock.mockReturnValue(true)
    checkRateLimitMock.mockResolvedValue(true)
    issueEmailVerificationMock.mockResolvedValue('sent')
  })

  it('sends a fresh code for an unverified account', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ emailVerified: null })

    const response = await POST(request('Player@Example.com'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(issueEmailVerificationMock).toHaveBeenCalledWith('player@example.com')
  })

  it('caps sends per recipient independently of the caller IP', async () => {
    checkRateLimitMock.mockImplementation(async (key: string) =>
      key.startsWith('verify-resend-recipient:') ? false : true
    )

    const response = await POST(request('player@example.com'))

    expect(response.status).toBe(429)
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      'verify-resend-recipient:player@example.com',
      expect.anything()
    )
    expect(issueEmailVerificationMock).not.toHaveBeenCalled()
  })

  it('returns the same response without sending for unknown or verified accounts', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const response = await POST(request('unknown@example.com'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(issueEmailVerificationMock).not.toHaveBeenCalled()
  })

  it('reports unavailable delivery configuration', async () => {
    isConfiguredMock.mockReturnValue(false)

    const response = await POST(request('player@example.com'))

    expect(response.status).toBe(503)
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })
})
