import { beforeEach, describe, expect, it, vi } from 'vitest'

const { verifyEmailCodeMock } = vi.hoisted(() => ({ verifyEmailCodeMock: vi.fn() }))

vi.mock('@/server/email-verification', () => ({ verifyEmailCode: verifyEmailCodeMock }))

import { GET, POST } from '@/app/api/auth/verify-email/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/auth/verify-email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/verify-email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verifies a correct code', async () => {
    verifyEmailCodeMock.mockResolvedValue('verified')

    const response = await POST(createRequest({ email: 'Player@Example.com', code: '123456' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(verifyEmailCodeMock).toHaveBeenCalledWith('player@example.com', '123456')
  })

  it('rejects malformed codes without hitting verification', async () => {
    const response = await POST(createRequest({ email: 'player@example.com', code: '12345' }))

    expect(response.status).toBe(400)
    expect(verifyEmailCodeMock).not.toHaveBeenCalled()
  })

  it('returns 400 for a wrong code', async () => {
    verifyEmailCodeMock.mockResolvedValue('invalid')

    const response = await POST(createRequest({ email: 'player@example.com', code: '123456' }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Incorrect code. Check the email and try again.',
    })
  })

  it('returns 400 with a distinct message for an expired code', async () => {
    verifyEmailCodeMock.mockResolvedValue('expired')

    const response = await POST(createRequest({ email: 'player@example.com', code: '123456' }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'That code has expired. Request a new one below.',
    })
  })

  it('returns 429 when attempts are rate-limited', async () => {
    verifyEmailCodeMock.mockResolvedValue('rate-limited')

    const response = await POST(createRequest({ email: 'player@example.com', code: '123456' }))

    expect(response.status).toBe(429)
  })
})

describe('GET /api/auth/verify-email (legacy emailed links)', () => {
  it('redirects old verification links to the code entry page', async () => {
    const response = await GET(
      new Request('http://localhost/api/auth/verify-email?token=legacy_token')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/verify-email')
  })
})
