import { createHash, timingSafeEqual } from 'node:crypto'

export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return false
  }

  const authorization = request.headers.get('authorization') ?? ''
  // Hash both values before comparing so the comparison is constant-time
  // regardless of input length (timingSafeEqual requires equal-length buffers,
  // and a raw length check would leak the secret's length).
  const provided = createHash('sha256').update(authorization).digest()
  const expected = createHash('sha256').update(`Bearer ${secret}`).digest()
  return timingSafeEqual(provided, expected)
}
