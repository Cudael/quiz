import { describe, expect, it, vi } from 'vitest'
import { evaluateBadgesWithClient } from '@/domain/badges'

interface SessionSeed {
  correctCount: number
  totalCount: number
  timeTakenMs: number
  createdAt: Date
  categorySlug: string
}

function makeClient({
  criterion,
  sessions,
  streakDays = 0,
  quizzesAuthored = 0,
  existingBadgeIds = [],
}: {
  criterion: object
  sessions: SessionSeed[]
  streakDays?: number
  quizzesAuthored?: number
  existingBadgeIds?: string[]
}) {
  const createMany = vi.fn().mockResolvedValue({ count: 1 })

  return {
    badge: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'badge-1',
          slug: 'test-badge',
          name: 'Test Badge',
          description: 'Test badge',
          icon: 'Star',
          criteria: criterion,
        },
      ]),
    },
    userBadge: {
      findMany: vi.fn().mockResolvedValue(existingBadgeIds.map((badgeId) => ({ badgeId }))),
      createMany,
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ streakDays }),
    },
    quiz: {
      count: vi.fn().mockResolvedValue(quizzesAuthored),
    },
    playSession: {
      findMany: vi.fn().mockResolvedValue(
        sessions.map((session) => ({
          ...session,
          quiz: {
            category: {
              slug: session.categorySlug,
            },
          },
        }))
      ),
    },
  } as const
}

const winSession: SessionSeed = {
  correctCount: 7,
  totalCount: 10,
  timeTakenMs: 30000,
  createdAt: new Date('2026-05-21T02:00:00Z'),
  categorySlug: 'science',
}

describe('badge evaluators', () => {
  it('wins badge', async () => {
    const client = makeClient({ criterion: { type: 'wins', count: 1 }, sessions: [winSession] })
    const badges = await evaluateBadgesWithClient(client as never, 'user-1', 'session-1')
    expect(badges).toHaveLength(1)
  })

  it('perfect score badge', async () => {
    const client = makeClient({
      criterion: { type: 'perfectScore' },
      sessions: [{ ...winSession, correctCount: 10 }],
    })
    const badges = await evaluateBadgesWithClient(client as never, 'user-1', 'session-1')
    expect(badges).toHaveLength(1)
  })

  it('streak badge', async () => {
    const client = makeClient({
      criterion: { type: 'streak', days: 7 },
      sessions: [winSession],
      streakDays: 7,
    })
    const badges = await evaluateBadgesWithClient(client as never, 'user-1', 'session-1')
    expect(badges).toHaveLength(1)
  })

  it('quizzes authored badge', async () => {
    const client = makeClient({
      criterion: { type: 'quizzesAuthored', count: 1 },
      sessions: [winSession],
      quizzesAuthored: 1,
    })
    const badges = await evaluateBadgesWithClient(client as never, 'user-1', 'session-1')
    expect(badges).toHaveLength(1)
  })

  it('category master badge', async () => {
    const client = makeClient({
      criterion: { type: 'categoryMaster', categorySlug: 'science', minQuizzes: 2 },
      sessions: [winSession, { ...winSession, createdAt: new Date('2026-05-20T01:00:00Z') }],
    })
    const badges = await evaluateBadgesWithClient(client as never, 'user-1', 'session-1')
    expect(badges).toHaveLength(1)
  })

  it('avg answer ms badge', async () => {
    const client = makeClient({
      criterion: { type: 'avgAnswerMs', lt: 5000 },
      sessions: [{ ...winSession, timeTakenMs: 20000, totalCount: 5 }],
    })
    const badges = await evaluateBadgesWithClient(client as never, 'user-1', 'session-1')
    expect(badges).toHaveLength(1)
  })

  it('played between badge', async () => {
    const client = makeClient({
      criterion: { type: 'playedBetween', fromHour: 0, toHour: 5 },
      sessions: [{ ...winSession, createdAt: new Date('2026-05-21T03:00:00Z') }],
    })
    const badges = await evaluateBadgesWithClient(client as never, 'user-1', 'session-1')
    expect(badges).toHaveLength(1)
  })

  it('plays count badge', async () => {
    const sessions = Array.from({ length: 3 }, (_, index) => ({
      ...winSession,
      createdAt: new Date(`2026-05-2${index}T10:00:00Z`),
    }))
    const client = makeClient({ criterion: { type: 'playsCount', count: 3 }, sessions })
    const badges = await evaluateBadgesWithClient(client as never, 'user-1', 'session-1')
    expect(badges).toHaveLength(1)
  })

  it('is idempotent when badge already awarded', async () => {
    const client = makeClient({
      criterion: { type: 'wins', count: 1 },
      sessions: [winSession],
      existingBadgeIds: ['badge-1'],
    })

    const badges = await evaluateBadgesWithClient(client as never, 'user-1', 'session-1')
    expect(badges).toHaveLength(0)
    expect(client.userBadge.createMany).not.toHaveBeenCalled()
  })
})
