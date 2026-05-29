import type { RankedLeaderboardRow } from './leaderboard-table'

interface CurrentUserRankProps {
  row: RankedLeaderboardRow
}

export function CurrentUserRank({ row }: CurrentUserRankProps) {
  return (
    <div className="sticky bottom-4 mt-6 rounded-xl border border-primary/40 bg-background/95 p-3 shadow-xl backdrop-blur">
      <p className="text-sm text-muted-foreground">Your rank</p>
      <p className="font-semibold">
        #{row.rank} • {row.totalScore.toLocaleString()} total • {row.accuracy.toFixed(1)}% accuracy
      </p>
    </div>
  )
}
