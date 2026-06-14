'use client'

import Link from 'next/link'
import { Search, Zap, Trophy, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="flex flex-col justify-center space-y-5 py-2">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Free Online Quiz & Trivia Platform
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {currentUser
            ? `Welcome back, ${currentUser.name ?? 'quiz champion'}! Pick up where you left off or discover something new.`
            : 'Test your knowledge across thousands of quizzes. No sign-up needed — just pick a quiz and play.'}
        </p>
      </div>

      {/* Search bar */}
      <form action="/categories" method="get" className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          placeholder="What do you want to learn today?"
          className="h-12 w-full rounded-xl border border-border/60 bg-muted/40 pl-12 pr-4 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Search quizzes"
        />
      </form>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
          <Zap className="h-4 w-4 shrink-0 text-quiz-purple" />
          <span className="text-sm font-medium">{formattedCount} quizzes</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
          <Sparkles className="h-4 w-4 shrink-0 text-quiz-yellow" />
          <span className="text-sm font-medium">100% free</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
          <Trophy className="h-4 w-4 shrink-0 text-quiz-orange" />
          <span className="text-sm font-medium">Earn badges & XP</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
          <Users className="h-4 w-4 shrink-0 text-quiz-green" />
          <span className="text-sm font-medium">Climb leaderboards</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="gradient" size="lg" className="rounded-xl font-bold">
          <Link href="/categories">Browse Quizzes</Link>
        </Button>
        {!currentUser && (
          <Button asChild variant="outline" size="lg" className="rounded-xl font-bold">
            <Link href="/sign-up">Sign Up Free</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
