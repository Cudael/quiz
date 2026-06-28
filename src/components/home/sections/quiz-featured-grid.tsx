'use client'

import * as React from 'react'
import Link from 'next/link'
import { QuizCardFeatured, QuizCardHorizontal, type QuizCardData } from '@/components/ui/quiz-card'

interface QuizFeaturedGridSectionProps {
  title: string
  subtitle?: string
  quizzes: QuizCardData[]
  href?: string
}

export function QuizFeaturedGridSection({
  title,
  subtitle,
  quizzes,
  href,
}: QuizFeaturedGridSectionProps) {
  if (quizzes.length === 0) return null

  const [featured, ...rest] = quizzes

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
          >
            See all →
          </Link>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Featured card — takes 2 columns */}
        <div className="lg:col-span-2">
          <QuizCardFeatured quiz={featured} className="h-full" />
        </div>

        {/* Remaining cards in a 3-column sub-grid */}
        {rest.length > 0 && (
          <div className="lg:col-span-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rest.slice(0, 6).map((quiz) => (
              <QuizCardHorizontal
                key={quiz.id}
                quiz={quiz}
                className="w-full min-w-0 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
