import 'server-only'
/**
 * Play token — sign/verify HMAC tokens that bind a quizId to a play session.
 * The token is issued server-side at quiz start; the submit endpoint validates it.
 */

const DEV_SECRET = 'quiz-arena-dev-secret-do-not-use-in-prod'

function getSecret(): string {
  const secret = process.env.PLAY_TOKEN_SECRET || process.env.AUTH_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PLAY_TOKEN_SECRET or AUTH_SECRET must be set in production')
    }
    return DEV_SECRET
  }
  return secret
}

// ---------------------------------------------------------------------------
// Encoding helpers
// ---------------------------------------------------------------------------

function encodeBase64url(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString('base64url')
}

function decodeBase64url(str: string): ArrayBuffer {
  const buf = Buffer.from(str, 'base64url')
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

// ---------------------------------------------------------------------------
// HMAC helpers
// ---------------------------------------------------------------------------

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function sign(message: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return encodeBase64url(sig)
}

async function verify(message: string, sigB64: string, key: CryptoKey): Promise<boolean> {
  const enc = new TextEncoder()
  const sig = decodeBase64url(sigB64)
  return crypto.subtle.verify('HMAC', key, sig, enc.encode(message))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

interface PlayTokenPayload {
  quizId: string
  issuedAt: number
}

/**
 * Sign a play token embedding quizId and issuedAt timestamp.
 * Returns a dot-separated string: `<payload_b64>.<sig_b64>`
 */
export async function signPlayToken(quizId: string): Promise<string> {
  const payload: PlayTokenPayload = { quizId, issuedAt: Date.now() }
  const payloadStr = JSON.stringify(payload)
  const payloadB64 = Buffer.from(payloadStr).toString('base64url')
  const key = await importKey(getSecret())
  const sig = await sign(payloadB64, key)
  return `${payloadB64}.${sig}`
}

/**
 * Verify a play token and return the quizId if valid, or null if tampered/expired.
 * Tokens expire after 4 hours.
 */
export async function verifyPlayToken(
  token: string,
  expectedQuizId: string
): Promise<{ valid: boolean; quizId?: string }> {
  try {
    const [payloadB64, sigB64] = token.split('.')
    if (!payloadB64 || !sigB64) return { valid: false }

    const key = await importKey(getSecret())
    const ok = await verify(payloadB64, sigB64, key)
    if (!ok) return { valid: false }

    const payload: PlayTokenPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    )
    // Expire after 4 hours
    if (Date.now() - payload.issuedAt > 4 * 60 * 60 * 1000) return { valid: false }
    if (payload.quizId !== expectedQuizId) return { valid: false }

    return { valid: true, quizId: payload.quizId }
  } catch {
    return { valid: false }
  }
}
