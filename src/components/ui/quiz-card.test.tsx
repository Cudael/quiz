import { render, screen } from '@testing-library/react'
import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  QuizCard,
  QuizCardFeatured,
  QuizCardHorizontal,
  type QuizCardData,
} from '@/components/ui/quiz-card'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: (
    props: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }
  ) => {
    const { alt } = props
    const imgProps = { ...props }
    delete imgProps.fill
    delete imgProps.unoptimized

    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt ?? ''} {...imgProps} />
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: (
      props: HTMLAttributes<HTMLDivElement> & {
        whileHover?: unknown
        transition?: unknown
      }
    ) => {
      const { children, whileHover, transition, ...domProps } = props
      void whileHover
      void transition
      return <div {...domProps}>{children}</div>
    },
  },
  useReducedMotion: () => true,
}))

const baseQuiz: QuizCardData = {
  id: 'quiz-1',
  title: 'Arcade Knowledge Challenge',
  difficulty: 'EASY',
  coverImage: 'https://cdn.example.com/quiz.jpg',
  category: {
    name: 'Science',
    color: '#8b5cf6',
  },
  playCount: 1234,
}

describe('QuizCard difficulty overlay', () => {
  it('renders difficulty pills on the image for QuizCard variants', () => {
    render(
      <>
        <QuizCardHorizontal quiz={baseQuiz} />
        <QuizCard quiz={{ ...baseQuiz, id: 'quiz-2', difficulty: 'MEDIUM' }} />
        <QuizCardFeatured quiz={{ ...baseQuiz, id: 'quiz-3', difficulty: 'HARD' }} />
      </>
    )

    // QuizCardHorizontal and QuizCardFeatured no longer render difficulty pills
    expect(screen.queryByText('EASY')).not.toBeInTheDocument()
    expect(screen.queryByText('HARD')).not.toBeInTheDocument()

    // QuizCard still renders the difficulty pill
    const mediumPill = screen.getByText('MEDIUM')
    expect(mediumPill.className).toContain('bottom-3')
    expect(mediumPill.className).toContain('right-3')
    expect(mediumPill.className).toContain('amber')
  })
})
