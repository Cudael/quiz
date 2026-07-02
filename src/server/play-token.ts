import 'server-only'
/**
 * Play token — sign/verify HMAC tokens that bind a quizId to a play session.
 * The token is issued server-side at quiz start; the submit endpoint validates it.
 *
 * Each token includes a random nonce so that every issued token is unique.
 * `verifyPlayToken` consumes the nonce on first use, preventing replay attacks
 * (submitting the same token twice to inflate scores).
 */

import { Redis } from '@upstash/redis'

const DEV_SECRET = 'busquiz-dev-secret-do-not-use-in-prod'

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
// Redis client (shared with rate-limit.ts pattern)
// ---------------------------------------------------------------------------

let redis: Redis | null = null
let warnedMissingRedis = false

function getRedis(): Redis | null {
  if (redis !== null) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    redis = new Redis({ url, token })
  } else if (process.env.NODE_ENV === 'production' && !warnedMissingRedis) {
    warnedMissingRedis = true
    console.error(
      '[play-token] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set. ' +
        'Nonce replay protection is degraded to per-instance in-memory tracking. ' +
        'Configure Upstash Redis in production.'
    )
  }
  return redis
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
// Nonce tracking — prevents a token from being submitted more than once
// ---------------------------------------------------------------------------

/**
 * In-memory fallback when Redis is unavailable. Maps nonce → expiry timestamp.
 * Entries are cleaned up lazily.
 *
 * **Serverless limitation:** This map is local to each server instance. On
 * platforms such as Vercel, isolated function instances do not share memory.
 * When Redis is configured (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN),
 * the nonce is tracked atomically across all instances via SET NX PX.
 */
const usedNonces = new Map<string, number>()

/**
 * Token TTL: 4 hours.
 *
 * Rationale: A quiz play session should not take longer than 4 hours.
 * This provides ample buffer for slow connections while bounding the
 * window in which a token could theoretically be replayed.
 */
const TOKEN_TTL_MS = 4 * 60 * 60 * 1000

/**
 * Attempts to consume `nonce`. Returns `true` on the first call (nonce is
 * fresh) and `false` on any subsequent call (nonce already used).
 *
 * Uses Redis SET NX PX for atomic cross-instance enforcement when available;
 * falls back to in-memory tracking with a warning log.
 */
async function consumeNonce(nonce: string, expiresAt: number): Promise<boolean> {
  const now = Date.now()
  const rawTtl = expiresAt - now
  if (rawTtl <= 0) {
    // Token already expired — reject without storing
    return false
  }
  const ttlMs = Math.max(rawTtl, 1000) // minimum 1s TTL for Redis PX

  const client = getRedis()
  if (client) {
    try {
      // SET NX: only succeeds if the key does not already exist (atomic).
      // PX: auto-expires after the token's remaining TTL.
      const result = await client.set(`nonce:${nonce}`, '1', { nx: true, px: ttlMs })
      return result === 'OK'
    } catch (err) {
      // Redis unavailable — fall through to in-memory with warning.
      console.warn('[play-token] Redis unavailable for nonce check, using in-memory fallback', err)
    }
  }

  // In-memory fallback: purge expired nonces when the map grows large.
  if (usedNonces.size >= 10_000) {
    for (const [n, exp] of usedNonces) {
      if (exp < now) usedNonces.delete(n)
    }
  }

  if (usedNonces.has(nonce)) return false
  usedNonces.set(nonce, expiresAt)
  return true
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

interface PlayTokenPayload {
  quizId: string
  issuedAt: number
  nonce: string
}

/**
 * Sign a play token embedding quizId, issuedAt timestamp, and a random nonce.
 * Returns a dot-separated string: `<payload_b64>.<sig_b64>`
 */
export async function signPlayToken(quizId: string): Promise<string> {
  const payload: PlayTokenPayload = {
    quizId,
    issuedAt: Date.now(),
    nonce: crypto.randomUUID(),
  }
  const payloadStr = JSON.stringify(payload)
  const payloadB64 = Buffer.from(payloadStr).toString('base64url')
  const key = await importKey(getSecret())
  const sig = await sign(payloadB64, key)
  return `${payloadB64}.${sig}`
}

/**
 * Verify a play token and return the quizId if valid, or null if tampered/expired/replayed.
 * Tokens expire after 4 hours and may only be verified (consumed) once.
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
    if (Date.now() - payload.issuedAt > TOKEN_TTL_MS) return { valid: false }
    if (payload.quizId !== expectedQuizId) return { valid: false }
    if (!payload.nonce) return { valid: false }

    const expiresAt = payload.issuedAt + TOKEN_TTL_MS
    if (!(await consumeNonce(payload.nonce, expiresAt))) return { valid: false }

    return { valid: true, quizId: payload.quizId }
  } catch {
    return { valid: false }
  }
}
