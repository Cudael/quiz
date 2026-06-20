'use client'

import Link from 'next/link'
import { Search, Zap, Trophy, Users, type LucideIcon } from 'lucide-react'
import type { HomeCurrentUser } from '../home-page-client.types'

interface QuickLink {
  label: string
  href: string
  icon: LucideIcon
}

interface HeroInsightBoxProps {
  currentUser: HomeCurrentUser | null
  totalQuizCount: number
  quickLinks: QuickLink[]
}

export function HeroInsightBox({ currentUser, totalQuizCount, quickLinks }: HeroInsightBoxProps) {
  const formattedCount =
    totalQuizCount >= 1000
      ? `${(totalQuizCount / 1000).toFixed(1).replace(/\.0$/, '')}K+`
      : `${totalQuizCount}+`

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Free Online Quiz & Trivia Platform
          </h1>
          <p className="mt-2 text-lg leading-relaxed text-muted-foreground">
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
        <div className="flex items-center gap-x-2 gap-y-1 text-xs sm:text-sm sm:gap-x-4 whitespace-nowrap overflow-x-auto">
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

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <link.icon className="h-3.5 w-3.5" />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
