import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import type { RankedLeaderboardRow } from './leaderboard-table'

interface CurrentUserRankProps {
  row: RankedLeaderboardRow
}

export function CurrentUserRank({ row }: CurrentUserRankProps) {
  return (
    <div className="sticky bottom-4 z-10 mt-6 rounded-xl border border-primary/30 bg-background/80 p-3 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Avatar src={row.image} alt={row.displayName} fallback={row.displayName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            You: <span className="tabular-nums">#{row.rank}</span>
            {' — '}
            <span className="tabular-nums">{row.totalScore.toLocaleString()} pts</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {row.plays.toLocaleString()} plays · {row.accuracy.toFixed(1)}% accuracy
          </p>
        </div>
        {row.username ? (
          <Link
            href={`/u/${row.username}`}
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            View profile
          </Link>
        ) : null}
      </div>
    </div>
  )
}
