'use client'

import Link from 'next/link'
import { ArrowRight, Flame, Swords, Trophy, Users } from 'lucide-react'
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
    <section>
      <div className="grid gap-4 md:grid-cols-2">
        {/* LEFT COLUMN: Daily Challenge + Duel */}
        <div className="space-y-4">
          {/* Daily Challenge */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-yellow-500/5">
              <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-amber-500/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-28 w-28 rounded-full bg-orange-500/15 blur-2xl" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Flame className="h-20 w-20 text-orange-500/10" />
            </div>
            <div className="relative flex flex-col p-6 pr-24">
              <h2 className="text-xl font-black tracking-tight">Daily Challenge</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Keep your streak alive and earn bonus XP!
              </p>
              <Button asChild variant="gradient" className="mt-4 w-fit rounded-xl font-bold">
                <Link href="/random-quiz">Play Challenge</Link>
              </Button>
            </div>
          </div>

          {/* Duel Mode */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-fuchsia-500/5">
              <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-violet-500/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-28 w-28 rounded-full bg-fuchsia-500/15 blur-2xl" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Swords className="h-20 w-20 rotate-12 text-violet-500/10" />
            </div>
            <div className="relative flex flex-col p-6 pr-24">
              <h2 className="text-xl font-black tracking-tight">Duel Mode</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Challenge a friend and see who comes out on top!
              </p>
              <Button asChild variant="outline" className="mt-4 w-fit rounded-xl font-bold">
                <Link href="/duel">Start a Duel</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Progress + Top Players */}
        <div className="space-y-4">
          {/* Progress Card */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-black text-base">Your Progress</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                  <span>
                    Level {currentUser.level} → {nextLevel}
                  </span>
                  <span>{Math.round(xpPct)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
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

          {/* Top Players */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
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
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black border border-primary/10">
                    {(player.name || '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {player.name}
                  </span>
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
      </div>
    </section>
  )
}
