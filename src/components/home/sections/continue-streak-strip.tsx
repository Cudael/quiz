'use client'

import Link from 'next/link'
import { Award, Flame, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { xpForLevel, xpForNextLevel, xpProgress } from '@/domain/leveling'
import type { QuizCardData } from '@/components/ui/quiz-card'
import type { HomeCurrentUser } from '../home-page-client.types'

interface ContinueStreakStripProps {
  currentUser: HomeCurrentUser
  recommendedQuiz?: QuizCardData
}

export function ContinueStreakStrip({ currentUser, recommendedQuiz }: ContinueStreakStripProps) {
  const progress = xpProgress(currentUser.xp)
  const currentLevelXp = xpForLevel(progress.level)
  const nextLevelXp = xpForNextLevel(progress.level)
  const xpIntoLevel = Math.max(0, currentUser.xp - currentLevelXp)
  const xpNeeded = Math.max(1, nextLevelXp - currentLevelXp)
  const percent = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100))

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-quiz-orange/10 text-quiz-orange">
            <Flame className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold">
              {currentUser.streakDays > 0
                ? `${currentUser.streakDays}-day streak is active`
                : 'Start a streak today'}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {recommendedQuiz
                ? `Keep moving with ${recommendedQuiz.title}`
                : 'Play one quiz today to keep your progress warm.'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Level {progress.level}</span>
            <span>
              {xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-quiz-green" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button asChild className="rounded-xl font-bold">
            <Link href={recommendedQuiz ? `/play/${recommendedQuiz.id}` : '/random-quiz'}>
              <Zap className="mr-2 h-4 w-4" />
              Keep Playing
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/profile/badges">
              <Award className="mr-2 h-4 w-4" />
              Badges
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
