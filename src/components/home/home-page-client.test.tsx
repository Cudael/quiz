import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  HomePageClient,
  type HomeCurrentUser,
  type HomeFeaturedCategory,
  type HomeQuizCard,
  type HomeStats,
  type HomeTopPlayer,
} from '@/components/home/home-page-client'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
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

const popularQuizzes: HomeQuizCard[] = [
  {
    id: 'quiz-1',
    title: 'World capitals challenge',
    difficulty: 'MEDIUM',
    playCount: 420,
    avgScore: 73,
    category: {
      slug: 'geography',
      name: 'Geography',
      icon: '🌍',
      color: '#7c3aed',
    },
  },
]

const newestQuizzes: HomeQuizCard[] = [
  {
    id: 'quiz-2',
    title: 'Fresh science facts',
    difficulty: 'EASY',
    playCount: 12,
    avgScore: 81,
    category: {
      slug: 'science',
      name: 'Science',
      icon: '🧪',
      color: '#10b981',
    },
  },
]

const personalizedQuizzes: HomeQuizCard[] = [
  {
    id: 'quiz-3',
    title: 'Physics speed round',
    difficulty: 'HARD',
    playCount: 155,
    avgScore: 62,
    category: {
      slug: 'science',
      name: 'Science',
      icon: '🧪',
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
        currentUser={currentUser}
      />
    )

    expect(screen.getByRole('heading', { name: /welcome back, cudael! 👋/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'For You' })).toBeInTheDocument()
    expect(screen.getByText(/based on your activity/i)).toBeInTheDocument()
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
        currentUser={currentUser}
      />
    )

    expect(screen.getByRole('heading', { name: /welcome back, cudael! 👋/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'For You' })).not.toBeInTheDocument()
  })
})
