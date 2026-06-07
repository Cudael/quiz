'use client'

import Link from 'next/link'
import { ArrowRight, Flame, Trophy, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { xpProgress } from '@/domain/leveling'
import type { HomeCurrentUser, HomeTopPlayer } from '../home-page-client.types'

const leaderboardRanks = ['🥇', '🥈', '🥉', '4.'] as const

export function DailyDashboard({
  currentUser,
  topPlayers,
}: {
  currentUser: HomeCurrentUser
  topPlayers: HomeTopPlayer[]
}) {
  const { pct: xpPct } = xpProgress(currentUser.xp)
  const nextLevel = currentUser.level + 1

  return (
    <section className="space-y-4">
      {/* Daily Challenge Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-background p-5 md:p-6">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <Flame className="h-3 w-3" />
              {currentUser.streakDays > 0 ? `${currentUser.streakDays}d streak` : 'New'}
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Daily Challenge</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep your streak alive and earn bonus XP!
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-bold shadow-md shadow-orange-500/20 hover:opacity-90"
          >
            <Link href="/random-quiz">
              <Zap className="h-4 w-4" />
              Play Challenge
            </Link>
          </Button>
        </div>
      </div>

      {/* Progress + Leaderboard side by side */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Progress Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-black text-base">Your Progress</h3>
          </div>

          <div className="space-y-3">
            {/* Level + XP bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                <span>
                  Level {currentUser.level} → {nextLevel}
                </span>
                <span>{Math.round(xpPct)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-quiz-purple transition-all duration-700"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-orange-500/8 border border-orange-500/15 px-3 py-2.5">
                <Flame className="h-4 w-4 shrink-0 text-orange-500" />
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Streak
                  </p>
                  <p className="text-sm font-black text-orange-500">
                    {currentUser.streakDays} days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-primary/8 border border-primary/15 px-3 py-2.5">
                <Trophy className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Total XP
                  </p>
                  <p className="text-sm font-black text-primary">
                    {currentUser.xp.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Leaderboard */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-quiz-yellow" />
              <h3 className="font-black text-base">Top Players</h3>
            </div>
            <Link
              href="/leaderboard"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-1.5">
            {topPlayers.slice(0, 4).map((player, index) => (
              <div
                key={player.userId}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors',
                  index === 0 ? 'bg-amber-500/8 border border-amber-500/12' : 'hover:bg-accent/30'
                )}
              >
                <span className="w-5 text-center text-sm font-black tabular-nums">
                  {leaderboardRanks[index] ?? `${index + 1}.`}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-[11px] font-black border border-primary/10">
                  {(player.name || '?').charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{player.name}</span>
                <span className="shrink-0 text-xs font-bold text-muted-foreground tabular-nums">
                  {player.totalScore.toLocaleString()} pts
                </span>
              </div>
            ))}
            {topPlayers.length === 0 ? (
              <p className="py-3 text-center text-xs text-muted-foreground">
                No players yet. Be the first!
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
