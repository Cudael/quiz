'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { QuizCard, QuizCardHorizontal, type QuizCardData } from '@/components/ui/quiz-card'
import { SectionHeader } from './section-primitives'

const SCROLL_DISTANCE = 600
const MAX_SCROLLER_QUIZZES = 20

export function QuizScrollerSection({
  title,
  quizzes,
  subtitle,
}: {
  title: string
  quizzes: QuizCardData[]
  subtitle?: string
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const visibleQuizzes = quizzes.slice(0, MAX_SCROLLER_QUIZZES)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: dir === 'right' ? SCROLL_DISTANCE : -SCROLL_DISTANCE,
      behavior: 'smooth',
    })
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {visibleQuizzes.length > 0 ? (
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${title} quizzes`}
        >
          {visibleQuizzes.map((quiz) => (
            <QuizCardHorizontal
              key={quiz.id}
              quiz={quiz}
              className="snap-start focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          Quizzes will appear here soon.
        </div>
      )}
    </section>
  )
}

export function QuizDenseGridSection({
  title,
  quizzes,
  maxItems = 12,
  href,
}: {
  title: string
  quizzes: QuizCardData[]
  maxItems?: number
  href?: string
}) {
  const visibleQuizzes = quizzes.slice(0, maxItems)

  return (
    <section>
      <div className="mb-3 border-b border-border/30 pb-2">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <Link
            href={href ?? '/categories'}
            className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            See all →
          </Link>
        </div>
      </div>
      {visibleQuizzes.length > 0 ? (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
          aria-label={`${title} quizzes`}
        >
          {visibleQuizzes.map((quiz) => (
            <QuizCardHorizontal
              key={quiz.id}
              quiz={quiz}
              className="w-full focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-accent/20 p-8 text-center text-sm text-muted-foreground">
          Quizzes will appear here soon.
        </div>
      )}
    </section>
  )
}

export function QuizGridSection({
  title,
  quizzes,
  excludeQuizId,
}: {
  title: string
  quizzes: QuizCardData[]
  excludeQuizId?: string
}) {
  const visibleQuizzes = excludeQuizId
    ? quizzes.filter((quiz) => quiz.id !== excludeQuizId).slice(0, 9)
    : quizzes.slice(0, 9)

  return (
    <section>
      <SectionHeader title={title} href="/categories" />
      {visibleQuizzes.length > 0 ? (
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={`${title} quizzes`}
        >
          {visibleQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              className="w-full focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          Quizzes will appear here soon.
        </div>
      )}
    </section>
  )
}
