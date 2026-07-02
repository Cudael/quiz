import Link from 'next/link'
import { CheckCircle2, Sparkles } from 'lucide-react'
import type { QuestBoardEntry } from '@/server/quests'

const periodLabels: Record<QuestBoardEntry['period'], string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
}

const periodStyles: Record<QuestBoardEntry['period'], string> = {
  DAILY: 'bg-quiz-orange/15 text-quiz-orange',
  WEEKLY: 'bg-quiz-purple/15 text-quiz-purple',
  MONTHLY: 'bg-quiz-green/15 text-quiz-green',
}

const periodBarStyles: Record<QuestBoardEntry['period'], string> = {
  DAILY: 'bg-quiz-orange',
  WEEKLY: 'bg-quiz-purple',
  MONTHLY: 'bg-quiz-green',
}

interface QuestBoardProps {
  quests: QuestBoardEntry[]
  isSignedIn: boolean
}

export function QuestBoard({ quests, isSignedIn }: QuestBoardProps) {
  if (quests.length === 0) return null

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Quests</h2>
          <p className="text-sm text-muted-foreground">
            Complete quests to earn bonus XP. They reset daily, weekly, and monthly.
          </p>
        </div>
        {!isSignedIn ? (
          <Link
            href="/sign-in?callbackUrl=/challenges"
            className="shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Sign in to track progress
          </Link>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quests.map((quest) => {
          const percent =
            quest.target > 0 ? Math.min(100, (quest.progress / quest.target) * 100) : 0
          return (
            <div
              key={quest.id}
              className={`rounded-md border bg-card p-4 ${
                quest.completed ? 'border-quiz-green/60' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${periodStyles[quest.period]}`}
                >
                  {periodLabels[quest.period]}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-quiz-yellow" />+{quest.xpReward} XP
                </span>
              </div>
              <h3 className="mt-2 font-bold">{quest.title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{quest.description}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  {quest.completed ? (
                    <span className="inline-flex items-center gap-1 text-quiz-green">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Progress</span>
                  )}
                  <span>
                    {quest.progress} / {quest.target}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-sm bg-muted">
                  <div
                    className={`h-full transition-all ${quest.completed ? 'bg-quiz-green' : periodBarStyles[quest.period]}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
