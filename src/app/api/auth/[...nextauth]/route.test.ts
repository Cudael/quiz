import { beforeEach, describe, expect, it, vi } from 'vitest'

const { checkRateLimitMock, getClientIpMock, nextAuthPostHandlerMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn(),
  getClientIpMock: vi.fn(() => '127.0.0.1'),
  nextAuthPostHandlerMock: vi.fn(async () => new Response(JSON.stringify({ ok: true }))),
}))

vi.mock('@/server/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: getClientIpMock,
}))

vi.mock('@/server/auth', () => ({
  handlers: {
    GET: vi.fn(),
    POST: nextAuthPostHandlerMock,
  },
}))

import { POST } from '@/app/api/auth/[...nextauth]/route'

describe('POST /api/auth/[...nextauth]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkRateLimitMock.mockResolvedValue(true)
  })

  it('rate limits credential callback attempts', async () => {
    checkRateLimitMock.mockResolvedValue(false)

    const response = await POST(new Request('http://localhost/api/auth/callback/email-password'))

    expect(response.status).toBe(429)
    await expect(response.json()).resolves.toEqual({
      error: 'Too many requests. Please try again later.',
    })
    expect(nextAuthPostHandlerMock).not.toHaveBeenCalled()
  })

  it('rate limits credential signin endpoint attempts', async () => {
    checkRateLimitMock.mockResolvedValue(false)

    const response = await POST(new Request('http://localhost/api/auth/signin/email-password'))

    expect(response.status).toBe(429)
    expect(nextAuthPostHandlerMock).not.toHaveBeenCalled()
  })

  it('forwards non-credential providers without this route-level limiter', async () => {
    const response = await POST(new Request('http://localhost/api/auth/callback/google'))

    expect(response.status).toBe(200)
    expect(checkRateLimitMock).not.toHaveBeenCalled()
    expect(nextAuthPostHandlerMock).toHaveBeenCalledOnce()
  })
})
