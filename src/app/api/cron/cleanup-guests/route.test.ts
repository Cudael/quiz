import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  userFindManyMock,
  userDeleteManyMock,
  playSessionFindManyMock,
  playSessionDeleteManyMock,
  duelParticipantFindManyMock,
  duelParticipantDeleteManyMock,
  transactionMock,
} = vi.hoisted(() => ({
  userFindManyMock: vi.fn(),
  userDeleteManyMock: vi.fn(),
  playSessionFindManyMock: vi.fn(),
  playSessionDeleteManyMock: vi.fn(),
  duelParticipantFindManyMock: vi.fn(),
  duelParticipantDeleteManyMock: vi.fn(),
  transactionMock: vi.fn(),
}))

vi.mock('@/server/prisma', () => ({
  prisma: {
    user: {
      findMany: userFindManyMock,
      deleteMany: userDeleteManyMock,
    },
    playSession: {
      findMany: playSessionFindManyMock,
      deleteMany: playSessionDeleteManyMock,
    },
    duelParticipant: {
      findMany: duelParticipantFindManyMock,
      deleteMany: duelParticipantDeleteManyMock,
    },
    $transaction: transactionMock,
  },
}))

import { GET } from '@/app/api/cron/cleanup-guests/route'

describe('GET /api/cron/cleanup-guests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-cron-secret'

    userFindManyMock.mockResolvedValue([{ id: 'guest-user-1' }, { id: 'guest-user-2' }])
    playSessionFindManyMock.mockResolvedValue([{ id: 'guest-session-1' }])
    duelParticipantFindManyMock.mockResolvedValue([{ id: 'guest-duel-1' }, { id: 'guest-duel-2' }])

    userDeleteManyMock.mockReturnValue({ _tag: 'users-delete' })
    playSessionDeleteManyMock.mockReturnValue({ _tag: 'sessions-delete' })
    duelParticipantDeleteManyMock.mockReturnValue({ _tag: 'duels-delete' })

    transactionMock.mockResolvedValue([{ count: 2 }, { count: 1 }, { count: 2 }])
  })

  it('rejects unauthorized requests', async () => {
    const response = await GET(new Request('http://localhost/api/cron/cleanup-guests'))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(userFindManyMock).not.toHaveBeenCalled()
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it('executes bounded guest cleanup when authorized and returns summary counts', async () => {
    const response = await GET(
      new Request('http://localhost/api/cron/cleanup-guests', {
        headers: { authorization: 'Bearer test-cron-secret' },
      })
    )

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.ok).toBe(true)
    expect(body.retentionDays).toBe(30)
    expect(typeof body.cutoff).toBe('string')
    expect(body.deleted).toEqual({
      users: 2,
      playSessions: 1,
      duelParticipants: 2,
    })
  })

  it('uses guest-only deletion filters so non-guest accounts are never targeted', async () => {
    await GET(
      new Request('http://localhost/api/cron/cleanup-guests', {
        headers: { authorization: 'Bearer test-cron-secret' },
      })
    )

    expect(userFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          email: null,
          role: 'USER',
        }),
      })
    )

    expect(userDeleteManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          email: null,
          id: { in: ['guest-user-1', 'guest-user-2'] },
        }),
      })
    )

    expect(playSessionDeleteManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: null,
          id: { in: ['guest-session-1'] },
        }),
      })
    )

    expect(duelParticipantDeleteManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: null,
          id: { in: ['guest-duel-1', 'guest-duel-2'] },
        }),
      })
    )
  })
})
