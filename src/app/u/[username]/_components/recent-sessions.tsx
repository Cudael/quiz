import { copy } from '@/lib/copy'

interface RecentSession {
  id: string
  score: number
  correctCount: number
  totalCount: number
  createdAt: Date
  quiz: { title: string }
}

interface RecentSessionsProps {
  sessions: RecentSession[]
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Recent Sessions</h2>
      <div className="space-y-3">
        {sessions.map((sessionRow) => {
          const accuracy =
            sessionRow.totalCount > 0
              ? Math.round((sessionRow.correctCount / sessionRow.totalCount) * 100)
              : 0
          return (
            <div key={sessionRow.id} className="rounded-lg border border-border p-3 text-sm">
              <p className="font-medium">{sessionRow.quiz.title}</p>
              <p className="text-xs text-muted-foreground">
                {sessionRow.score} pts • {accuracy}% accuracy
              </p>
              <p className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat('en', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(sessionRow.createdAt)}
              </p>
            </div>
          )
        })}
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">{copy.emptyStates.noSessions}</p>
        )}
      </div>
    </section>
  )
}
