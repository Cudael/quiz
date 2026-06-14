import { render, screen } from '@testing-library/react'
import type { ImgHTMLAttributes, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { HomePageClient, type HomeCurrentUser } from '@/components/home/home-page-client'
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
  it('renders the guest view with Duel and Daily Challenge CTAs', () => {
    render(
      <HomePageClient
        categoriesWithQuizzes={[]}
        popularQuizzes={popularQuizzes}
        trendingQuizzes={trendingQuizzes}
        newestQuizzes={newestQuizzes}
        personalizedQuizzes={[]}
        recentlyPlayed={[]}
        currentUser={null}
      />
    )

    expect(screen.getByRole('heading', { name: /Duel Mode/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Daily Challenge/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up to duel/i })).toHaveAttribute(
      'href',
      '/sign-up'
    )
    expect(screen.getByRole('link', { name: /sign up to play/i })).toHaveAttribute(
      'href',
      '/sign-up'
    )
    expect(screen.getByRole('heading', { name: /Hall of Fame/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /What's Hot Right Now/ })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: /Fresh Off the Press/ }).length).toBe(1)
    expect(screen.queryByRole('heading', { name: /Picked Just for You/ })).not.toBeInTheDocument()
  })

  it('renders the authenticated view with Duel and Daily Challenge', () => {
    render(
      <HomePageClient
        categoriesWithQuizzes={[]}
        popularQuizzes={popularQuizzes}
        trendingQuizzes={trendingQuizzes}
        newestQuizzes={newestQuizzes}
        personalizedQuizzes={personalizedQuizzes}
        recentlyPlayed={[]}
        currentUser={currentUser}
      />
    )

    expect(screen.getByRole('heading', { name: /Duel Mode/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Daily Challenge/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start a duel/i })).toHaveAttribute('href', '/duel')
    expect(screen.getByRole('link', { name: /play challenge/i })).toHaveAttribute(
      'href',
      '/random-quiz'
    )
    expect(screen.getByRole('heading', { name: /Picked Just for You/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Hall of Fame/ })).toBeInTheDocument()
  })

  it('falls back to popular quizzes when an authenticated user has no history yet', () => {
    render(
      <HomePageClient
        categoriesWithQuizzes={[]}
        popularQuizzes={popularQuizzes}
        trendingQuizzes={trendingQuizzes}
        newestQuizzes={newestQuizzes}
        personalizedQuizzes={[]}
        recentlyPlayed={[]}
        currentUser={currentUser}
      />
    )

    expect(screen.getByRole('heading', { name: /Picked Just for You/ })).toBeInTheDocument()
    expect(screen.getAllByText('World capitals challenge').length).toBeGreaterThan(0)
  })
})
