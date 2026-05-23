import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  HomePageClient,
  type HomeCurrentUser,
  type HomeFeaturedCategory,
  type HomeRecentSession,
  type HomeStats,
  type HomeTopPlayer,
} from '@/components/home/home-page-client'
import type { QuizCardData } from '@/components/ui/quiz-card'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

const featuredCategories: HomeFeaturedCategory[] = [
  {
    slug: 'science',
    name: 'Science',
    icon: 'S',
    color: 'linear-gradient(135deg, #7c3aed, #ec4899)',
    description: 'Experiments and facts',
    quizCount: 12,
  },
]

const topPlayers: HomeTopPlayer[] = [
  { userId: 'u1', name: 'Ada Lovelace', image: null, totalScore: 3200 },
]

const stats: HomeStats = {
  totalPlayers: 1200,
  totalQuizzes: 84,
  totalQuestions: 960,
  totalCategories: 14,
}

const popularQuizzes: QuizCardData[] = [
  {
    id: 'quiz-1',
    title: 'World capitals challenge',
    difficulty: 'MEDIUM',
    playCount: 1234,
    avgScore: 87,
    category: {
      name: 'Geography',
      color: '#7c3aed',
    },
  },
]

const newestQuizzes: QuizCardData[] = [
  {
    id: 'quiz-2',
    title: 'Fresh science facts',
    difficulty: 'EASY',
    playCount: 0,
    avgScore: 0,
    category: {
      name: 'Science',
      color: '#10b981',
    },
  },
]

const personalizedQuizzes: QuizCardData[] = [
  {
    id: 'quiz-3',
    title: 'Physics speed round',
    difficulty: 'HARD',
    playCount: 8,
    avgScore: 0.72,
    category: {
      name: 'Science',
      color: '#f59e0b',
    },
  },
]

const currentUser: HomeCurrentUser = {
  name: 'Cudael',
  xp: 2450,
  level: 7,
  streakDays: 4,
}

const recentSessions: HomeRecentSession[] = [
  {
    id: 'session-1',
    quizId: 'quiz-1',
    title: 'World capitals challenge',
    coverImage: null,
    score: 420,
    playedAt: '2026-05-23T10:00:00.000Z',
  },
]

describe('HomePageClient', () => {
  it('renders the guest product view with quiz sections and top players', () => {
    render(
      <HomePageClient
        featuredCategories={featuredCategories}
        topPlayers={topPlayers}
        stats={stats}
        popularQuizzes={popularQuizzes}
        newestQuizzes={newestQuizzes}
        personalizedQuizzes={[]}
        recentSessions={[]}
        currentUser={null}
      />
    )

    expect(
      screen.getByRole('heading', { name: /play great quizzes right now/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '🔥 Trending' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '✨ Just Added' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Top Players' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'For You' })).not.toBeInTheDocument()
  })

  it('renders the authenticated dashboard and personalized section', () => {
    render(
      <HomePageClient
        featuredCategories={featuredCategories}
        topPlayers={topPlayers}
        stats={stats}
        popularQuizzes={popularQuizzes}
        newestQuizzes={newestQuizzes}
        personalizedQuizzes={personalizedQuizzes}
        recentSessions={recentSessions}
        currentUser={currentUser}
      />
    )

    expect(screen.getByRole('heading', { name: /welcome back, cudael! 👋/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Continue Playing' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Play Again' })).toHaveAttribute('href', '/play/quiz-1')
    expect(screen.getByRole('heading', { name: 'For You' })).toBeInTheDocument()
    expect(screen.getByText(/based on your activity/i)).toBeInTheDocument()
    expect(screen.getAllByText(/🎮 1,234 plays/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/⭐ 72% avg score/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Top Players' })).not.toBeInTheDocument()
  })

  it('skips the personalized section when an authenticated user has no history yet', () => {
    render(
      <HomePageClient
        featuredCategories={featuredCategories}
        topPlayers={topPlayers}
        stats={stats}
        popularQuizzes={popularQuizzes}
        newestQuizzes={newestQuizzes}
        personalizedQuizzes={[]}
        recentSessions={[]}
        currentUser={currentUser}
      />
    )

    expect(screen.getByRole('heading', { name: /welcome back, cudael! 👋/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'For You' })).not.toBeInTheDocument()
  })
})
