import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, sendVerificationEmailMock, checkRateLimitMock } = vi.hoisted(() => ({
  prismaMock: {
    verificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    user: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  sendVerificationEmailMock: vi.fn(),
  checkRateLimitMock: vi.fn(),
}))

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/email', () => ({ sendVerificationEmail: sendVerificationEmailMock }))
vi.mock('@/server/rate-limit', () => ({ checkRateLimit: checkRateLimitMock }))

import { issueEmailVerification, verifyEmailCode } from '@/server/email-verification'
import { hashVerificationCode } from '@/server/token-hash'

const EMAIL = 'player@example.com'

describe('issueEmailVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('AUTH_SECRET', 'test-secret')
    prismaMock.verificationToken.deleteMany.mockReturnValue({ operation: 'delete' })
    prismaMock.verificationToken.create.mockReturnValue({ operation: 'create' })
    prismaMock.$transaction.mockResolvedValue([])
    sendVerificationEmailMock.mockResolvedValue('sent')
  })

  it('invalidates prior codes and emails one fresh 6-digit code', async () => {
    const before = Date.now()

    await expect(issueEmailVerification(EMAIL)).resolves.toBe('sent')

    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: EMAIL },
    })
    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      { operation: 'delete' },
      { operation: 'create' },
    ])

    const code = sendVerificationEmailMock.mock.calls[0][1] as string
    expect(code).toMatch(/^\d{6}$/)

    const created = prismaMock.verificationToken.create.mock.calls[0][0].data
    expect(created.identifier).toBe(EMAIL)
    // Only the keyed hash is persisted, never the raw code.
    expect(created.token).toBe(hashVerificationCode(EMAIL, code))
    const expires = created.expires as Date
    expect(expires.getTime()).toBeGreaterThanOrEqual(before + 15 * 60 * 1000)
    expect(expires.getTime()).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000)
  })
})

describe('verifyEmailCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('AUTH_SECRET', 'test-secret')
    checkRateLimitMock.mockResolvedValue(true)
    prismaMock.user.updateMany.mockReturnValue({ operation: 'verify-user' })
    prismaMock.verificationToken.deleteMany.mockReturnValue({ operation: 'delete' })
    prismaMock.$transaction.mockResolvedValue([{ count: 1 }, {}])
  })

  function storeCode(code: string, expiresInMs: number) {
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      token: hashVerificationCode(EMAIL, code),
      expires: new Date(Date.now() + expiresInMs),
    })
  }

  it('rejects attempts over the rate limit before touching the database', async () => {
    checkRateLimitMock.mockResolvedValue(false)

    await expect(verifyEmailCode(EMAIL, '123456')).resolves.toBe('rate-limited')

    expect(checkRateLimitMock).toHaveBeenCalledWith(`verify-code:${EMAIL}`, expect.anything())
    expect(prismaMock.verificationToken.findFirst).not.toHaveBeenCalled()
  })

  it('returns invalid when no code is pending for the email', async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue(null)

    await expect(verifyEmailCode(EMAIL, '123456')).resolves.toBe('invalid')
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('returns invalid for a wrong code without revealing expiry', async () => {
    storeCode('654321', -60_000)

    await expect(verifyEmailCode(EMAIL, '123456')).resolves.toBe('invalid')
    expect(prismaMock.verificationToken.deleteMany).not.toHaveBeenCalled()
  })

  it('consumes an expired code only when the code itself is correct', async () => {
    storeCode('123456', -60_000)

    await expect(verifyEmailCode(EMAIL, '123456')).resolves.toBe('expired')
    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: EMAIL },
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('verifies the user and consumes the code atomically on success', async () => {
    storeCode('123456', 60_000)

    await expect(verifyEmailCode(EMAIL, '123456')).resolves.toBe('verified')

    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      where: { email: EMAIL, emailVerified: null },
      data: { emailVerified: expect.any(Date) },
    })
    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      { operation: 'verify-user' },
      { operation: 'delete' },
    ])
  })

  it('does not report success when the account no longer exists', async () => {
    storeCode('123456', 60_000)
    prismaMock.$transaction.mockResolvedValue([{ count: 0 }, {}])

    await expect(verifyEmailCode(EMAIL, '123456')).resolves.toBe('invalid')
  })
})
