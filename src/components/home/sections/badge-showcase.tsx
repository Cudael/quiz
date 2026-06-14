'use client'

import Link from 'next/link'
import { Award } from 'lucide-react'
import type { BadgePreview } from '../home-page-client.types'

interface BadgeShowcaseProps {
  badges: BadgePreview[]
}

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  if (badges.length === 0) return null

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Earn Badges</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Play quizzes, build streaks, and unlock achievements
          </p>
        </div>
        <Link
          href="/badges"
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 transition-colors"
        >
          View all <Award className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9">
        {badges.map((badge) => (
          <div
            key={badge.slug}
            className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card p-3 text-center transition-all duration-200 hover:border-quiz-purple/40 hover:shadow-md"
          >
            <span className="text-3xl" aria-hidden="true">
              {badge.emoji}
            </span>
            <p className="text-xs font-bold leading-tight">{badge.name}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-2">{badge.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
