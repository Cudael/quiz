import 'server-only'
import { createHash, createHmac } from 'node:crypto'

/**
 * Hash a raw token with SHA-256 before storing it in the database.
 * The raw token is emailed to the user; only the hash is persisted.
 * Verification hashes the incoming token and compares against the stored hash.
 */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

/**
 * Hash a short emailed verification code before storing it in the database.
 * A 6-digit code has only 10^6 possibilities, so a plain hash could be
 * brute-forced offline from a leaked table — keying the hash with AUTH_SECRET
 * prevents that. The email is mixed in so identical codes issued to different
 * addresses never collide on the unique token column.
 */
export function hashVerificationCode(email: string, code: string): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET must be set to issue or verify email codes')
  }
  return createHmac('sha256', secret).update(`${email}:${code}`).digest('hex')
}
