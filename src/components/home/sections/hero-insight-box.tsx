'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Zap, Trophy, Users, X, type LucideIcon } from 'lucide-react'
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
  const [query, setQuery] = useState('')
  const formattedCount = totalQuizCount.toLocaleString()

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Play Free Quizzes & Trivia
          </h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {currentUser
              ? `Welcome back, ${currentUser.username ?? 'quiz champion'}! Continue your streak, take today’s challenge, or discover a new favorite.`
              : 'Explore free quizzes across a growing range of topics and play instantly — no sign-up required.'}
          </p>
        </div>

        {/* Search bar with button */}
        <form action="/categories" method="get" className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to learn today?"
              className="h-12 w-full rounded-md border border-border/60 bg-muted/30 pl-11 pr-10 text-base transition-all focus:bg-background focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
              aria-label="Search quizzes"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-12 rounded-md bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 transition-all inline-flex items-center justify-center"
            aria-label="Search"
          >
            <span className="hidden sm:inline">Search</span>
            <Search className="h-4 w-4 sm:hidden" />
          </button>
        </form>

        {/* Stats inline row */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-quiz-purple/5 px-2.5 py-1 font-semibold text-quiz-purple whitespace-nowrap border border-quiz-purple/10">
            <Zap className="h-3.5 w-3.5 shrink-0" />
            {formattedCount} quizzes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-quiz-orange/5 px-2.5 py-1 font-semibold text-quiz-orange whitespace-nowrap border border-quiz-orange/10">
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            Earn badges & XP
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-quiz-green/5 px-2.5 py-1 font-semibold text-quiz-green whitespace-nowrap border border-quiz-green/10">
            <Users className="h-3.5 w-3.5 shrink-0" />
            Climb leaderboards
          </span>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="inline-flex items-center justify-center sm:justify-start gap-1.5 rounded-md border border-border/50 bg-card p-3 sm:px-4 sm:py-2 text-sm font-bold transition-all hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm active:scale-95"
          >
            <link.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
