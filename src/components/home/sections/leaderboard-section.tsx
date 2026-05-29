import Link from 'next/link'
import { ArrowRight, Trophy, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { HomeCurrentUser, HomeStats, HomeTopPlayer } from '../home-page-client.types'

const leaderboardRanks = ['🥇', '🥈', '🥉', '4.', '5.'] as const

export function LeaderboardSection({
  topPlayers,
  stats,
  currentUser,
}: {
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
  currentUser: HomeCurrentUser | null
}) {
  return (
    <section className="grid gap-5 md:grid-cols-[1fr_300px]">
      {/* Top Players */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-quiz-yellow" />
          <h3 className="text-xl font-black tracking-tight">Top Players</h3>
        </div>
        <div className="space-y-2">
          {topPlayers.slice(0, 5).map((player, index) => (
            <div
              key={player.userId}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors',
                index === 0
                  ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/15'
                  : index === 1
                    ? 'bg-surface-1/60 hover:bg-surface-2/60'
                    : 'hover:bg-accent/30'
              )}
            >
              <span className="w-6 text-center text-base font-black">
                {leaderboardRanks[index] ?? `${index + 1}.`}
              </span>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-sm font-black shadow-inner border border-primary/10">
                {(player.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="truncate text-sm font-bold">{player.name}</span>
                <span className="shrink-0 rounded-xl bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground shadow-sm border border-border/40">
                  {player.totalScore.toLocaleString()} pts
                </span>
              </div>
            </div>
          ))}
          {topPlayers.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No players on the board yet. Be the first!
            </p>
          ) : null}
        </div>
        <div className="mt-4 pt-4 border-t border-border/30">
          <Link
            href="/leaderboard"
            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View full leaderboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* CTA card */}
      {currentUser ? (
        <div className="rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/6 via-primary/3 to-transparent p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-black text-lg">Your Stats</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Level', value: `⚡ ${currentUser.level}`, accent: 'text-primary' },
              {
                label: 'Streak',
                value: `🔥 ${currentUser.streakDays} days`,
                accent: 'text-orange-500',
              },
              {
                label: 'Total XP',
                value: currentUser.xp.toLocaleString(),
                accent: 'text-foreground',
              },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-background/50 px-4 py-2.5 border border-border/30"
              >
                <span className="font-semibold text-muted-foreground">{label}</span>
                <span className={cn('font-black', accent)}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/6 via-primary/3 to-transparent p-7 text-center shadow-sm">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-quiz-purple to-quiz-pink shadow-lg shadow-quiz-purple/30 mb-4"
            aria-hidden="true"
          >
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Think you can top this?</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Join <span className="font-black text-foreground">{stats.totalPlayers}</span> players
            competing globally.
          </p>
          <Button
            asChild
            variant="gradient"
            className="mt-6 w-full rounded-2xl font-bold shadow-md shadow-quiz-purple/25"
          >
            <Link href="/sign-up">
              <Zap className="h-4 w-4" />
              Create Free Account
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}
