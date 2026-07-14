import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UserProfilePage from '@/app/u/[username]/page'

const {
  authMock,
  userFindUniqueMock,
  badgeFindManyMock,
  followFindUniqueMock,
  toggleFollowActionMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  badgeFindManyMock: vi.fn(),
  followFindUniqueMock: vi.fn(),
  toggleFollowActionMock: vi.fn(async () => {}),
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({
  prisma: {
    user: { findUnique: userFindUniqueMock },
    badge: { findMany: badgeFindManyMock },
    follow: { findUnique: followFindUniqueMock },
  },
}))

vi.mock('@/app/u/[username]/follow-actions', () => ({
  toggleFollowAction: toggleFollowActionMock,
}))

vi.mock('@/lib/seo', () => ({ serializeJsonLd: vi.fn(() => '{}') }))

vi.mock('@/components/ui/avatar', () => ({ Avatar: () => <div>Avatar</div> }))
vi.mock('@/components/ui/level-progress', () => ({
  LevelProgress: () => <div>Level Progress</div>,
}))
vi.mock('@/components/ui/streak-flame', () => ({
  StreakFlame: () => <div>Streak Flame</div>,
}))
vi.mock('@/components/ui/badges-grid', () => ({ BadgesGrid: () => <div>Badges Grid</div> }))
vi.mock('@/app/u/[username]/_components/published-quizzes', () => ({
  PublishedQuizzes: () => <div>Published Quizzes</div>,
}))
vi.mock('@/app/u/[username]/_components/recent-sessions', () => ({
  RecentSessions: () => <div>Recent Sessions</div>,
}))

describe('UserProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    authMock.mockResolvedValue({ user: { id: 'viewer-1' } })

    userFindUniqueMock.mockResolvedValue({
      id: 'user-1',
      username: 'alice',
      image: null,
      bio: 'Hi there',
      bannerImage: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      xp: 120,
      streakDays: 2,
      bestStreak: 5,
      badges: [{ badgeId: 'badge-1', awardedAt: new Date('2026-01-03T00:00:00.000Z') }],
      sessions: [],
      quizzes: [],
      _count: {
        followers: 12,
        following: 7,
      },
    })

    badgeFindManyMock
      .mockResolvedValueOnce([
        {
          id: 'badge-1',
          slug: 'starter',
          name: 'Starter',
          description: 'First badge',
          criteria: { type: 'sessions', count: 1 },
        },
      ])
      .mockResolvedValueOnce([{ id: 'badge-1', awards: [] }])
  })

  it('renders follower/following counts from _count and keeps follow button logic', async () => {
    followFindUniqueMock.mockResolvedValue(null)

    const element = await UserProfilePage({
      params: Promise.resolve({ username: 'alice' }),
    })

    render(element)

    expect(screen.getByText('Followers')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '@alice' })).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Following')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument()

    expect(userFindUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          _count: { select: { followers: true, following: true } },
        }),
      })
    )

    const includeArg = userFindUniqueMock.mock.calls[0][0].include
    expect(includeArg.followers).toBeUndefined()
    expect(includeArg.following).toBeUndefined()

    expect(followFindUniqueMock).toHaveBeenCalledWith({
      where: {
        followerId_followingId: {
          followerId: 'viewer-1',
          followingId: 'user-1',
        },
      },
      select: { followerId: true },
    })
  })

  it('shows Unfollow when viewer already follows profile user', async () => {
    followFindUniqueMock.mockResolvedValue({ followerId: 'viewer-1' })

    const element = await UserProfilePage({
      params: Promise.resolve({ username: 'alice' }),
    })

    render(element)

    expect(screen.getByRole('button', { name: 'Unfollow' })).toBeInTheDocument()
  })
})
