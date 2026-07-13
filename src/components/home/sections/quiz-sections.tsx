'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { QuizCard, QuizCardHorizontal, type QuizCardData } from '@/components/ui/quiz-card'
import type { CategoryWithQuizzes } from '../home-page-client.types'
import { SectionHeader } from './section-primitives'

const MAX_SCROLLER_QUIZZES = 20
const MAX_CATEGORY_QUIZZES = 12

// 6 columns visible; additional cards overflow into scroll area
const SCROLL_ROW_CLASS =
  'grid grid-flow-col auto-cols-[calc((100%_-_3.75rem)_/_6)] snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

// Responsive: 2 cards on mobile → 3 on sm → 4 on md → 5 on lg → 6 on xl
const CATEGORY_SCROLL_ROW_CLASS =
  'grid grid-flow-col auto-cols-[44%] sm:auto-cols-[calc((100%_-_1.5rem)_/_3)] md:auto-cols-[calc((100%_-_2.25rem)_/_4)] lg:auto-cols-[calc((100%_-_3rem)_/_5)] xl:auto-cols-[calc((100%_-_3.75rem)_/_6)] snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

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

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el || typeof el.scrollTo !== 'function') return
    el.scrollTo({ left: 0, behavior: 'instant' })
  }, [])

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: dir === 'right' ? scrollRef.current.clientWidth : -scrollRef.current.clientWidth,
      behavior: 'smooth',
    })
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {visibleQuizzes.length > 0 ? (
        <div ref={scrollRef} className={SCROLL_ROW_CLASS} aria-label={`${title} quizzes`}>
          {visibleQuizzes.map((quiz) => (
            <QuizCardHorizontal
              key={quiz.id}
              quiz={quiz}
              className="snap-start focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          This corner&apos;s quiet… for now. Be the first to shake things up! 🎉
        </div>
      )}
    </section>
  )
}

export function QuizDenseGridSection({
  title,
  subtitle,
  quizzes,
  maxItems = 12,
  href,
}: {
  title: string
  subtitle?: string
  quizzes: QuizCardData[]
  maxItems?: number
  href?: string
}) {
  const visibleQuizzes = quizzes.slice(0, maxItems)

  return (
    <section>
      <div className="mb-3 border-b border-border/30 pb-2">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <Link
            href={href ?? '/popular'}
            className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
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
              className="w-full min-w-0 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed bg-accent/20 p-8 text-center text-sm text-muted-foreground">
          This corner&apos;s quiet… for now. Be the first to shake things up! 🎉
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
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          This corner&apos;s quiet… for now. Be the first to shake things up! 🎉
        </div>
      )}
    </section>
  )
}

export function CategoryRowSection({ category }: { category: CategoryWithQuizzes }) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const visibleQuizzes = category.quizzes.slice(0, MAX_CATEGORY_QUIZZES)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el || typeof el.scrollTo !== 'function') return
    el.scrollTo({ left: 0, behavior: 'instant' })
  }, [])

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: dir === 'right' ? scrollRef.current.clientWidth : -scrollRef.current.clientWidth,
      behavior: 'smooth',
    })
  }

  if (visibleQuizzes.length === 0) return null

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold tracking-tight">{category.name} Quizzes</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/categories/${category.slug}`}
            className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${category.name} left`}
            className="hidden h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${category.name} right`}
            className="hidden h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className={CATEGORY_SCROLL_ROW_CLASS}
        aria-label={`${category.name} quizzes`}
      >
        {visibleQuizzes.map((quiz) => (
          <QuizCardHorizontal
            key={quiz.id}
            quiz={quiz}
            className="snap-start focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          />
        ))}
      </div>
    </section>
  )
}
