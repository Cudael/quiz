import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from '@/app/profile/page'

const { authMock, redirectMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
  prismaMock: {
    user: { findUnique: vi.fn() },
    quiz: { count: vi.fn() },
    badge: { count: vi.fn() },
    playSession: { aggregate: vi.fn() },
  },
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

vi.mock('@/components/ui/level-progress', () => ({
  LevelProgress: () => <div>Level Progress</div>,
}))
vi.mock('@/components/ui/streak-flame', () => ({
  StreakFlame: () => <div>Streak Flame</div>,
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <button type="button">{children}</button>,
}))
vi.mock('@/lib/badge-display', () => ({
  getBadgeEmoji: () => '🏅',
}))

describe('ProfilePage aggregate dedupe', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    authMock.mockResolvedValue({ user: { id: 'user-1' } })
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'alice',
      xp: 1200,
      streakDays: 3,
      bestStreak: 8,
      badges: [
        {
          badgeId: 'badge-1',
          badge: { slug: 'starter', name: 'Starter', description: 'First badge' },
        },
      ],
      sessions: [],
    })
    prismaMock.quiz.count.mockResolvedValue(2)
    prismaMock.badge.count.mockResolvedValue(10)
    prismaMock.playSession.aggregate.mockResolvedValue({
      _count: { _all: 3 },
      _avg: { score: 75.2 },
      _sum: { correctCount: 40, totalCount: 50 },
    })
  })

  it('derives accuracy and summary stats from a single aggregate call', async () => {
    const element = await ProfilePage()
    render(element)

    expect(prismaMock.playSession.aggregate).toHaveBeenCalledTimes(1)
    expect(prismaMock.playSession.aggregate).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      _count: { _all: true },
      _avg: { score: true },
      _sum: { correctCount: true, totalCount: true },
    })

    expect(screen.getByText('Quizzes Played')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('80% accuracy')).toBeInTheDocument()

    expect(screen.getByText('Avg Score')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('40 correct answers')).toBeInTheDocument()
  })
})
