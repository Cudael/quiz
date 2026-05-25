import 'server-only'
import { createHash } from 'node:crypto'

/**
 * Hash a raw token with SHA-256 before storing it in the database.
 * The raw token is emailed to the user; only the hash is persisted.
 * Verification hashes the incoming token and compares against the stored hash.
 */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
