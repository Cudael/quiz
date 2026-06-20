'use client'

import Link from 'next/link'
import { Award, User } from 'lucide-react'
import type { BadgePreview, HomeCurrentUser } from '../home-page-client.types'

interface BadgeShowcaseProps {
  badges: BadgePreview[]
  currentUser: HomeCurrentUser | null
}

export function BadgeShowcase({ badges, currentUser }: BadgeShowcaseProps) {
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
        <div className="flex items-center gap-3">
          {currentUser && (
            <Link
              href="/me/badges"
              className="flex items-center gap-1 text-sm font-semibold text-quiz-purple hover:text-quiz-purple/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 transition-colors"
            >
              My Badges <User className="h-3.5 w-3.5" />
            </Link>
          )}
          <Link
            href="/badges"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 transition-colors"
          >
            View all <Award className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {badges.map((badge) => (
          <div
            key={badge.slug}
            className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card p-3 text-center transition-all duration-200 hover:border-quiz-purple/40 hover:shadow-md snap-start shrink-0 w-[120px]"
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
