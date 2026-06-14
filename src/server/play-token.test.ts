import { describe, expect, it, vi, beforeEach } from 'vitest'

// Stub the 'server-only' guard so the module can be imported in tests.
vi.mock('server-only', () => ({}))

// Ensure a deterministic secret for tests.
const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env.PLAY_TOKEN_SECRET = 'test-secret-for-unit-tests'
  process.env.UPSTASH_REDIS_REST_URL = ''
  process.env.UPSTASH_REDIS_REST_TOKEN = ''
  return () => {
    Object.assign(process.env, ORIGINAL_ENV)
  }
})

describe('signPlayToken', () => {
  it('returns a string with two dot-separated base64url segments', async () => {
    const { signPlayToken } = await import('@/server/play-token')
    const token = await signPlayToken('quiz-123')
    const parts = token.split('.')
    expect(parts).toHaveLength(2)
    // Both parts should be non-empty base64url strings
    for (const part of parts) {
      expect(part).toMatch(/^[A-Za-z0-9_-]+$/)
    }
  })

  it('embeds the quizId in the payload', async () => {
    const { signPlayToken } = await import('@/server/play-token')
    const token = await signPlayToken('quiz-abc')
    const payloadB64 = token.split('.')[0]
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    expect(payload.quizId).toBe('quiz-abc')
    expect(payload.issuedAt).toBeTypeOf('number')
    expect(payload.nonce).toBeTypeOf('string')
    expect(payload.nonce.length).toBeGreaterThan(0)
  })
})

describe('verifyPlayToken', () => {
  it('accepts a freshly signed token', async () => {
    const { signPlayToken, verifyPlayToken } = await import('@/server/play-token')
    const token = await signPlayToken('quiz-1')
    const result = await verifyPlayToken(token, 'quiz-1')
    expect(result).toEqual({ valid: true, quizId: 'quiz-1' })
  })

  it('rejects when the quizId does not match', async () => {
    const { signPlayToken, verifyPlayToken } = await import('@/server/play-token')
    const token = await signPlayToken('quiz-1')
    const result = await verifyPlayToken(token, 'quiz-other')
    expect(result).toEqual({ valid: false })
  })

  it('rejects a tampered token (modified signature)', async () => {
    const { signPlayToken, verifyPlayToken } = await import('@/server/play-token')
    const token = await signPlayToken('quiz-1')
    const [payload, sig] = token.split('.')
    const tampered = `${payload}.${sig.slice(0, -2)}AA`
    const result = await verifyPlayToken(tampered, 'quiz-1')
    expect(result).toEqual({ valid: false })
  })

  it('rejects a tampered token (modified payload)', async () => {
    const { signPlayToken, verifyPlayToken } = await import('@/server/play-token')
    const token = await signPlayToken('quiz-1')
    const [, sig] = token.split('.')
    const fakePayload = Buffer.from(
      JSON.stringify({ quizId: 'quiz-1', issuedAt: Date.now(), nonce: 'fake' })
    ).toString('base64url')
    const result = await verifyPlayToken(`${fakePayload}.${sig}`, 'quiz-1')
    expect(result).toEqual({ valid: false })
  })

  it('rejects a replayed token (same nonce consumed twice)', async () => {
    const { signPlayToken, verifyPlayToken } = await import('@/server/play-token')
    const token = await signPlayToken('quiz-1')
    const first = await verifyPlayToken(token, 'quiz-1')
    expect(first.valid).toBe(true)
    const second = await verifyPlayToken(token, 'quiz-1')
    expect(second).toEqual({ valid: false })
  })

  it('rejects an expired token', async () => {
    const { verifyPlayToken } = await import('@/server/play-token')
    // Sign with a back-dated issuedAt so the token is already expired.
    const payload = {
      quizId: 'quiz-1',
      issuedAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
      nonce: crypto.randomUUID(),
    }
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
    // We need to sign it properly, so import the sign helper indirectly.
    // Since signPlayToken always uses Date.now(), we construct the token manually.
    const secret = process.env.PLAY_TOKEN_SECRET!
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64))
    const sigB64 = Buffer.from(sigBuf).toString('base64url')
    const expiredToken = `${payloadB64}.${sigB64}`

    const result = await verifyPlayToken(expiredToken, 'quiz-1')
    expect(result).toEqual({ valid: false })
  })

  it('rejects a malformed token string', async () => {
    const { verifyPlayToken } = await import('@/server/play-token')
    expect(await verifyPlayToken('not-a-token', 'quiz-1')).toEqual({ valid: false })
    expect(await verifyPlayToken('', 'quiz-1')).toEqual({ valid: false })
    expect(await verifyPlayToken('a', 'quiz-1')).toEqual({ valid: false })
  })
})
