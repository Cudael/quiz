'use client'

import { Search, Zap, Trophy, Users } from 'lucide-react'
import type { HomeCurrentUser } from '../home-page-client.types'

interface HeroInsightBoxProps {
  currentUser: HomeCurrentUser | null
  totalQuizCount: number
}

export function HeroInsightBox({ currentUser, totalQuizCount }: HeroInsightBoxProps) {
  const formattedCount =
    totalQuizCount >= 1000
      ? `${(totalQuizCount / 1000).toFixed(1).replace(/\.0$/, '')}K+`
      : `${totalQuizCount}+`

  return (
    <div className="flex flex-col space-y-3">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Free Online Quiz & Trivia Platform
        </h1>
        <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
          {currentUser
            ? `Welcome back, ${currentUser.name ?? 'quiz champion'}! Pick up where you left off or discover something new.`
            : 'Test your knowledge across thousands of quizzes. No sign-up needed — just pick a quiz and play.'}
        </p>
      </div>

      {/* Search bar with button */}
      <form action="/categories" method="get" className="flex">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="What do you want to learn today?"
            className="h-11 w-full rounded-l-lg rounded-r-none border border-r-0 border-border/60 bg-muted/40 pl-11 pr-4 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search quizzes"
          />
        </div>
        <button
          type="submit"
          className="h-11 shrink-0 rounded-r-lg rounded-l-none bg-orange-500 px-3 text-sm font-bold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Stats inline row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Zap className="h-4 w-4 shrink-0 text-quiz-purple" />
          {formattedCount} quizzes
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Trophy className="h-4 w-4 shrink-0 text-quiz-orange" />
          Earn badges & XP
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Users className="h-4 w-4 shrink-0 text-quiz-green" />
          Climb leaderboards
        </span>
      </div>
    </div>
  )
}
