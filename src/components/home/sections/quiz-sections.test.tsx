import { render, screen } from '@testing-library/react'
import type { ReactNode, ImgHTMLAttributes } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CategoryRowSection } from '@/components/home/sections/quiz-sections'
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

function createQuiz(id: number): QuizCardData {
  return {
    id: `quiz-${id}`,
    title: `Quiz ${id}`,
    slug: `quiz-${id}`,
    difficulty: 'MEDIUM',
    category: {
      name: 'Science',
      color: '#22c55e',
    },
    playCount: 100 - id,
    avgScore: 75,
    authorName: 'Author',
  }
}

describe('CategoryRowSection', () => {
  it('renders at most 12 quizzes in category rows', () => {
    const category = {
      slug: 'science',
      name: 'Science',
      icon: '🧪',
      color: '#22c55e',
      quizzes: Array.from({ length: 14 }, (_, index) => createQuiz(index + 1)),
    }

    render(<CategoryRowSection category={category} />)

    expect(screen.getByText('Quiz 12')).toBeInTheDocument()
    expect(screen.queryByText('Quiz 13')).not.toBeInTheDocument()
    expect(screen.queryByText('Quiz 14')).not.toBeInTheDocument()
  })

  it('returns null when category has no quizzes', () => {
    const category = {
      slug: 'science',
      name: 'Science',
      icon: '🧪',
      color: '#22c55e',
      quizzes: [],
    }

    render(<CategoryRowSection category={category} />)

    expect(screen.queryByRole('heading', { name: 'Science' })).not.toBeInTheDocument()
  })
})
