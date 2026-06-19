import Link from 'next/link'
import { Medal } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import type { LeaderboardRow } from '@/server/leaderboard'

export type RankedLeaderboardRow = LeaderboardRow & { rank: number }

function medal(rank: number) {
  if (rank === 1) return <Medal className="h-4 w-4 text-yellow-400" />
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-300" />
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />
  return null
}

function rankTitle(rank: number) {
  if (rank === 1) return 'Quiz Champion'
  if (rank === 2) return 'Trivia Master'
  if (rank === 3) return 'Knowledge Seeker'
  return null
}

interface LeaderboardTableProps {
  pageRows: RankedLeaderboardRow[]
  currentUserId?: string
}

export function LeaderboardTable({ pageRows, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-right">Best</th>
            <th className="px-4 py-3 text-right">Plays</th>
            <th className="px-4 py-3 text-right">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => {
            const isCurrentUser = !!currentUserId && row.userId === currentUserId
            return (
              <tr
                key={row.key}
                className={`border-t border-border ${isCurrentUser ? 'bg-primary/10' : ''}`}
              >
                <td className="px-4 py-3 font-semibold">
                  <div className="inline-flex items-center gap-1">
                    <span>#{row.rank}</span>
                    {medal(row.rank)}
                    {rankTitle(row.rank) && (
                      <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                        {rankTitle(row.rank)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={row.image}
                      alt={row.displayName}
                      fallback={row.displayName}
                      size="sm"
                    />
                    {row.userId && row.username ? (
                      <Link href={`/u/${row.username}`} className="font-medium hover:underline">
                        {row.displayName}
                      </Link>
                    ) : (
                      <span className="font-medium">{row.displayName}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {row.totalScore.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">{row.bestScore.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{row.plays.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{row.accuracy.toFixed(1)}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
