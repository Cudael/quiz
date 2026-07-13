import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, hashTokenMock, sendVerificationEmailMock } = vi.hoisted(() => ({
  prismaMock: {
    verificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  hashTokenMock: vi.fn(),
  sendVerificationEmailMock: vi.fn(),
}))

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/token-hash', () => ({ hashToken: hashTokenMock }))
vi.mock('@/server/email', () => ({ sendVerificationEmail: sendVerificationEmailMock }))

import { issueEmailVerification } from '@/server/email-verification'

describe('issueEmailVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.verificationToken.deleteMany.mockReturnValue({ operation: 'delete' })
    prismaMock.verificationToken.create.mockReturnValue({ operation: 'create' })
    prismaMock.$transaction.mockResolvedValue([])
    hashTokenMock.mockReturnValue('hashed-token')
    sendVerificationEmailMock.mockResolvedValue('sent')
  })

  it('invalidates prior links before issuing one fresh verification token', async () => {
    const before = Date.now()

    await expect(issueEmailVerification('player@example.com')).resolves.toBe('sent')

    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'player@example.com' },
    })
    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      { operation: 'delete' },
      { operation: 'create' },
    ])
    expect(prismaMock.verificationToken.create).toHaveBeenCalledWith({
      data: {
        identifier: 'player@example.com',
        token: 'hashed-token',
        expires: expect.any(Date),
      },
    })

    const expires = prismaMock.verificationToken.create.mock.calls[0][0].data.expires as Date
    expect(expires.getTime()).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000)
    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
      'player@example.com',
      expect.stringContaining('/api/auth/verify-email?token=')
    )
  })
})
