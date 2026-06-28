import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowUpRight, CalendarDays, CheckCircle2, RotateCcw, Trophy } from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function CompletedQuizzesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/profile/completed')
  }

  const sessions = await prisma.playSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          difficulty: true,
          category: { select: { name: true, color: true } },
          _count: { select: { questions: true } },
        },
      },
    },
  })

  const completedByQuiz = Array.from(
    sessions
      .reduce((map, playSession) => {
        const existing = map.get(playSession.quizId)
        if (!existing) {
          map.set(playSession.quizId, {
            latest: playSession,
            attempts: 1,
            bestScore: playSession.score,
            bestAccuracy:
              playSession.totalCount > 0
                ? Math.round((playSession.correctCount / playSession.totalCount) * 100)
                : 0,
          })
          return map
        }

        existing.attempts += 1
        if (playSession.score > existing.bestScore) {
          existing.bestScore = playSession.score
          existing.bestAccuracy =
            playSession.totalCount > 0
              ? Math.round((playSession.correctCount / playSession.totalCount) * 100)
              : 0
        }
        return map
      }, new Map<string, { latest: (typeof sessions)[number]; attempts: number; bestScore: number; bestAccuracy: number }>())
      .values()
  )

  const totalAttempts = sessions.length
  const averageAccuracy =
    totalAttempts > 0
      ? Math.round(
          (sessions.reduce((sum, playSession) => {
            if (playSession.totalCount <= 0) return sum
            return sum + playSession.correctCount / playSession.totalCount
          }, 0) /
            totalAttempts) *
            100
        )
      : 0

  return (
    <div className="space-y-6">
      <section className="rounded-md border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Completed Quizzes</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review your latest runs, revisit mistakes, and retake quizzes when you want a better
              score.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:w-64">
            <div className="rounded-md border bg-background px-3 py-2">
              <p className="text-xl font-black">{completedByQuiz.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-md border bg-background px-3 py-2">
              <p className="text-xl font-black">{averageAccuracy}%</p>
              <p className="text-xs text-muted-foreground">Avg accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {completedByQuiz.length === 0 ? (
        <section className="rounded-md border border-dashed bg-muted/30 p-10 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h2 className="font-bold">No completed quizzes yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Play your first quiz and it will appear here with your best score.
          </p>
          <Button asChild className="mt-5 rounded-md">
            <Link href="/categories">Browse Quizzes</Link>
          </Button>
        </section>
      ) : (
        <section className="space-y-3">
          {completedByQuiz.map(({ latest, attempts, bestScore, bestAccuracy }) => (
            <article key={latest.quizId} className="rounded-md border bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{latest.quiz.category.name}</Badge>
                    <Badge variant="secondary">{latest.quiz.difficulty}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {latest.quiz._count.questions} questions
                    </span>
                  </div>
                  <h2 className="truncate text-lg font-bold">{latest.quiz.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-quiz-yellow" />
                      Best {bestScore} pts · {bestAccuracy}%
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Last played{' '}
                      {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
                        latest.createdAt
                      )}
                    </span>
                    <span>
                      {attempts} attempt{attempts === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/play/${latest.quizId}/results?session=${latest.id}`}>
                      <ArrowUpRight className="mr-1.5 h-4 w-4" />
                      Result
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/play/${latest.quizId}`}>
                      <RotateCcw className="mr-1.5 h-4 w-4" />
                      Retake
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
