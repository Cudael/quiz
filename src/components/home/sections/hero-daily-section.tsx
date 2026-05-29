import Link from 'next/link'
import { Flame, Trophy, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizCardFeatured, type QuizCardData } from '@/components/ui/quiz-card'
import { xpProgress } from '@/domain/leveling'
import type { HomeCurrentUser } from '../home-page-client.types'
import { SectionHeader } from './section-primitives'

/**
 * Merged hero: featured "Today's Pick" quiz on the left, daily challenge card on the right
 * with the user's level / streak / XP progress integrated directly — no separate welcome row.
 */
export function HeroDailySection({
  featuredQuiz,
  currentUser,
}: {
  featuredQuiz: QuizCardData | null
  currentUser: HomeCurrentUser
}) {
  const { pct: xpPct } = xpProgress(currentUser.xp)
  const nextLevel = currentUser.level + 1

  return (
    <section>
      <SectionHeader title="Today's Pick" href="/categories" />
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        {/* Left: featured quiz */}
        <div>
          {featuredQuiz ? (
            <div className="focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-3xl h-full">
              <QuizCardFeatured quiz={featuredQuiz} />
            </div>
          ) : (
            <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl border border-dashed bg-accent/20 p-8 text-center text-sm text-muted-foreground">
              Quizzes will appear here soon.
            </div>
          )}
        </div>

        {/* Right: user progress + daily challenge, unified */}
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-orange-500/5 p-4">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-500/20 blur-2xl"
            aria-hidden="true"
          />

          {/* Stat pills */}
          <div className="relative flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-xs font-black text-primary">Lv.{currentUser.level}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-black text-orange-500 dark:text-orange-400">
                {currentUser.streakDays}d streak
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-muted/80 border border-border px-3 py-1">
              <Trophy className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground">
                {currentUser.xp.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="relative space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>
                Level {currentUser.level} → {nextLevel}
              </span>
              <span>{Math.round(xpPct)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>

          {/* Separator */}
          <div className="relative border-t border-orange-500/20" />

          {/* Daily challenge header */}
          <div className="relative flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/25">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">Daily Challenge</span>
                <span className="rounded-full bg-orange-500/15 border border-orange-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Live
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {currentUser.streakDays > 0 ? (
                  <>Keep your streak going!</>
                ) : (
                  'Start your streak today!'
                )}
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="relative flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
              <Zap className="h-3.5 w-3.5 shrink-0 text-orange-500" />
              <span className="text-xs font-semibold">Bonus XP for completing</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
              <Flame className="h-3.5 w-3.5 shrink-0 text-orange-500" />
              <span className="text-xs font-semibold">New challenge every day</span>
            </div>
          </div>

          <div className="relative mt-auto">
            <Button
              asChild
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-bold shadow-sm shadow-orange-500/20 hover:opacity-90"
            >
              <Link href="/random-quiz">Play Challenge →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
