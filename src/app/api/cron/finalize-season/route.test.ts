import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  seasonResultCountMock,
  seasonResultCreateManyMock,
  playSessionGroupByMock,
  badgeUpsertMock,
  userBadgeCreateManyMock,
  notificationCreateManyMock,
} = vi.hoisted(() => ({
  seasonResultCountMock: vi.fn(),
  seasonResultCreateManyMock: vi.fn(),
  playSessionGroupByMock: vi.fn(),
  badgeUpsertMock: vi.fn(),
  userBadgeCreateManyMock: vi.fn(),
  notificationCreateManyMock: vi.fn(),
}))

vi.mock('@/server/prisma', () => ({
  prisma: {
    seasonResult: {
      count: seasonResultCountMock,
      createMany: seasonResultCreateManyMock,
    },
    playSession: {
      groupBy: playSessionGroupByMock,
    },
    badge: {
      upsert: badgeUpsertMock,
    },
    userBadge: {
      createMany: userBadgeCreateManyMock,
    },
    notification: {
      createMany: notificationCreateManyMock,
    },
  },
}))

import { GET } from '@/app/api/cron/finalize-season/route'

describe('GET /api/cron/finalize-season', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-cron-secret'

    seasonResultCountMock.mockResolvedValue(0)
    seasonResultCreateManyMock.mockResolvedValue({ count: 2 })
    playSessionGroupByMock.mockResolvedValue([
      { userId: 'user-1', _sum: { score: 900 }, _count: { _all: 12 } },
      { userId: 'user-2', _sum: { score: 500 }, _count: { _all: 8 } },
    ])
    badgeUpsertMock.mockImplementation(({ where }: { where: { slug: string } }) =>
      Promise.resolve({ id: `badge-${where.slug}` })
    )
    userBadgeCreateManyMock.mockResolvedValue({ count: 2 })
    notificationCreateManyMock.mockResolvedValue({ count: 2 })
  })

  it('rejects unauthorized requests', async () => {
    const response = await GET(new Request('http://localhost/api/cron/finalize-season'))

    expect(response.status).toBe(401)
    expect(playSessionGroupByMock).not.toHaveBeenCalled()
  })

  it('skips already finalized seasons', async () => {
    seasonResultCountMock.mockResolvedValue(50)

    const response = await GET(
      new Request('http://localhost/api/cron/finalize-season', {
        headers: { authorization: 'Bearer test-cron-secret' },
      })
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.skipped).toBe(true)
    expect(playSessionGroupByMock).not.toHaveBeenCalled()
  })

  it('ranks players, stores results, awards badges, and notifies the top players', async () => {
    const response = await GET(
      new Request('http://localhost/api/cron/finalize-season', {
        headers: { authorization: 'Bearer test-cron-secret' },
      })
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.ok).toBe(true)
    expect(body.ranked).toBe(2)

    expect(seasonResultCreateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({ userId: 'user-1', rank: 1, score: 900, plays: 12 }),
          expect.objectContaining({ userId: 'user-2', rank: 2, score: 500, plays: 8 }),
        ],
        skipDuplicates: true,
      })
    )

    expect(userBadgeCreateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          { userId: 'user-1', badgeId: 'badge-season-champion' },
          { userId: 'user-2', badgeId: 'badge-season-podium' },
        ],
        skipDuplicates: true,
      })
    )

    expect(notificationCreateManyMock).toHaveBeenCalledTimes(1)
    const notificationArgs = notificationCreateManyMock.mock.calls[0][0]
    expect(notificationArgs.data).toHaveLength(2)
    expect(notificationArgs.data[0]).toMatchObject({ userId: 'user-1', type: 'SEASON_RESULT' })
  })
})
