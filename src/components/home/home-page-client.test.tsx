import { render, screen } from '@testing-library/react'
import type { ImgHTMLAttributes, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  HomePageClient,
  type HomeCurrentUser,
  type HomeFeaturedCategory,
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
  default: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ''} {...props} />
  ),
}))

const featuredCategories: HomeFeaturedCategory[] = [
  {
    slug: 'science',
    name: 'Science',
    icon: '🧪',
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
    category: {
      name: 'Science',
      color: '#10b981',
    },
  },
]

const trendingQuizzes: QuizCardData[] = [
  {
    id: 'quiz-4',
    title: 'Hot history streak',
    difficulty: 'MEDIUM',
    category: {
      name: 'History',
      color: '#0f766e',
    },
  },
]

const personalizedQuizzes: QuizCardData[] = [
  {
    id: 'quiz-3',
    title: 'Physics speed round',
    difficulty: 'HARD',
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

describe('HomePageClient', () => {
  it('renders the guest product view with quiz sections and top players', () => {
    render(
      <HomePageClient
        featuredCategories={featuredCategories}
        topPlayers={topPlayers}
        stats={stats}
        popularQuizzes={popularQuizzes}
        trendingQuizzes={trendingQuizzes}
        newestQuizzes={newestQuizzes}
        personalizedQuizzes={[]}
        recentlyPlayed={[]}
        currentUser={null}
      />
    )

    expect(screen.getByRole('heading', { name: 'Trending Globally' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Most Popular' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Freshly Added' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Challenge a friend to a duel' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Top Players' })).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view full leaderboard/i })).toBeInTheDocument()
    expect(screen.getByText('🧪')).toBeInTheDocument()
    expect(screen.getByText('Experiments and facts')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'For You' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /editor's pick/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /how it works/i })).not.toBeInTheDocument()
    // Guest flow shows the leaderboard section's "Think you can top this?" CTA, not "Your Progress"
    expect(screen.queryByRole('heading', { name: 'Your Progress' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Scroll Most Popular right')).toBeInTheDocument()
    // Hero section CTAs are present
    expect(screen.getByRole('link', { name: /browse quizzes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up free/i })).toBeInTheDocument()

    const exploreByTopic = screen.getByRole('heading', { name: 'Explore by topic' })
    const trendingGlobally = screen.getByRole('heading', { name: 'Trending Globally' })
    expect(trendingGlobally.compareDocumentPosition(exploreByTopic)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('renders the authenticated dashboard and personalized section', () => {
    render(
      <HomePageClient
        featuredCategories={featuredCategories}
        topPlayers={topPlayers}
        stats={stats}
        popularQuizzes={popularQuizzes}
        trendingQuizzes={trendingQuizzes}
        newestQuizzes={newestQuizzes}
        personalizedQuizzes={personalizedQuizzes}
        recentlyPlayed={[]}
        currentUser={currentUser}
      />
    )

    expect(screen.getByRole('heading', { name: "Today's Pick" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'For You' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Most Popular' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your Progress' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Top Players' })).toBeInTheDocument()
    expect(screen.getByText(/based on your activity/i)).toBeInTheDocument()
  })

  it('skips the personalized section when an authenticated user has no history yet', () => {
    render(
      <HomePageClient
        featuredCategories={featuredCategories}
        topPlayers={topPlayers}
        stats={stats}
        popularQuizzes={popularQuizzes}
        trendingQuizzes={trendingQuizzes}
        newestQuizzes={newestQuizzes}
        personalizedQuizzes={[]}
        recentlyPlayed={[]}
        currentUser={currentUser}
      />
    )

    expect(screen.queryByRole('heading', { name: 'For You' })).not.toBeInTheDocument()
  })
})
