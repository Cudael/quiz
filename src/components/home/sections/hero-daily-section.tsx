import Link from 'next/link'
import { Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizCard, type QuizCardData } from '@/components/ui/quiz-card'
import { xpProgress } from '@/domain/leveling'
import type { HomeCurrentUser } from '../home-page-client.types'
import { SectionHeader } from './section-primitives'

const TODAY_PICK_QUIZ_CARD_STYLES = '[&>div]:h-44'

/**
 * Merged hero: featured "Today's Pick" quiz on the left, daily challenge card on the right
 * with the user's level / streak / XP progress integrated directly — no separate welcome row.
 */
export function HeroDailySection({
  todaysPicks,
  currentUser,
}: {
  todaysPicks: QuizCardData[]
  currentUser: HomeCurrentUser
}) {
  const { pct: xpPct } = xpProgress(currentUser.xp)
  const nextLevel = currentUser.level + 1

  return (
    <section>
      <SectionHeader title="Today's Pick" href="/categories" />
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <div>
          {todaysPicks.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {todaysPicks.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  className={`w-full focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${TODAY_PICK_QUIZ_CARD_STYLES}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl border border-dashed bg-accent/20 p-8 text-center text-sm text-muted-foreground">
              Quizzes will appear here soon.
            </div>
          )}
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
          {/* Decorative background — placeholder for future image */}
          <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-yellow-500/5">
            <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-amber-500/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-28 w-28 rounded-full bg-orange-500/15 blur-2xl" />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Flame className="h-20 w-20 text-orange-500/10" />
          </div>

          {/* Content */}
          <div className="relative flex flex-1 flex-col p-5 pr-24">
            {/* Level & streak inline (kept because they show user context) */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="rounded-md bg-foreground/10 px-2 py-0.5 font-black">
                Lv.{currentUser.level}
              </span>
              <span className="text-muted-foreground">
                {currentUser.streakDays > 0 ? `${currentUser.streakDays}d streak` : 'New'}
              </span>
              <span className="ml-auto text-muted-foreground tabular-nums">
                {currentUser.xp.toLocaleString()} XP
              </span>
            </div>

            <h2 className="mt-3 text-xl font-black tracking-tight">Daily Challenge</h2>
            <p className="mt-1.5 max-w-[70%] text-sm leading-relaxed text-muted-foreground">
              Keep your streak alive and earn bonus XP!
            </p>

            {/* XP progress bar */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>
                  Level {currentUser.level} → {nextLevel}
                </span>
                <span>{Math.round(xpPct)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-foreground/70 transition-all duration-700"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>

            <div className="mt-auto pt-5">
              <Button asChild variant="gradient" className="w-full rounded-xl font-bold">
                <Link href="/random-quiz">Play Challenge</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
