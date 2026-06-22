import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, BarChart3, Clock, Eye, FilePenLine, Target, Users } from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Quiz Analytics',
  robots: { index: false },
}

export default async function QuizAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/studio')
  }

  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      authorId: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
      category: { select: { name: true } },
      ratings: { select: { stars: true } },
      sessions: {
        select: {
          score: true,
          correctCount: true,
          totalCount: true,
          timeTakenMs: true,
          createdAt: true,
        },
      },
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          prompt: true,
          type: true,
          points: true,
          choices: { select: { id: true, text: true, isCorrect: true } },
          answers: {
            select: {
              isCorrect: true,
              timeTakenMs: true,
              chosenIds: true,
            },
          },
        },
      },
    },
  })

  if (!quiz) notFound()
  if (quiz.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/studio')
  }

  const attempts = quiz.sessions.length
  const averageAccuracy =
    attempts > 0
      ? Math.round(
          (quiz.sessions.reduce((sum, playSession) => {
            if (playSession.totalCount <= 0) return sum
            return sum + playSession.correctCount / playSession.totalCount
          }, 0) /
            attempts) *
            100
        )
      : 0
  const averageTimeMs =
    attempts > 0
      ? Math.round(
          quiz.sessions.reduce((sum, playSession) => sum + playSession.timeTakenMs, 0) / attempts
        )
      : 0
  const ratingAverage =
    quiz.ratings.length > 0
      ? quiz.ratings.reduce((sum, rating) => sum + rating.stars, 0) / quiz.ratings.length
      : null

  const questionStats = quiz.questions.map((question, index) => {
    const answerCount = question.answers.length
    const correctCount = question.answers.filter((answer) => answer.isCorrect).length
    const correctRate = answerCount > 0 ? Math.round((correctCount / answerCount) * 100) : null
    const averageAnswerMs =
      answerCount > 0
        ? Math.round(
            question.answers.reduce((sum, answer) => sum + answer.timeTakenMs, 0) / answerCount
          )
        : null
    const choiceCounts = question.choices.map((choice) => ({
      id: choice.id,
      text: choice.text || 'Untitled choice',
      isCorrect: choice.isCorrect,
      count: question.answers.filter((answer) => answer.chosenIds.includes(choice.id)).length,
    }))
    const mostPickedWrong = choiceCounts
      .filter((choice) => !choice.isCorrect)
      .sort((a, b) => b.count - a.count)[0]

    return {
      id: question.id,
      index: index + 1,
      prompt: question.prompt,
      type: question.type,
      points: question.points,
      answerCount,
      correctRate,
      averageAnswerMs,
      mostPickedWrong,
      needsAttention:
        answerCount > 0 &&
        (correctRate === null || correctRate < 45 || (mostPickedWrong?.count ?? 0) > correctCount),
    }
  })

  const mostMissed = [...questionStats]
    .filter((question) => question.correctRate !== null)
    .sort((a, b) => (a.correctRate ?? 100) - (b.correctRate ?? 100))
    .slice(0, 3)

  return (
    <div className="container mx-auto space-y-6 px-4 py-10 md:px-6">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link href="/studio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Studio
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="outline">{quiz.category.name}</Badge>
              <Badge variant="secondary">{quiz.difficulty}</Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">{quiz.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              See where players struggle, which questions are too easy, and what to improve before
              your next publish pass.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href={`/quiz/${quiz.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href={`/studio/quiz/${quiz.id}/edit`}>
                <FilePenLine className="mr-2 h-4 w-4" />
                Edit Quiz
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AnalyticsStat icon={<Users className="h-4 w-4" />} label="Attempts" value={attempts} />
        <AnalyticsStat
          icon={<Target className="h-4 w-4" />}
          label="Accuracy"
          value={`${averageAccuracy}%`}
        />
        <AnalyticsStat
          icon={<BarChart3 className="h-4 w-4" />}
          label="Avg score"
          value={`${Math.round(quiz.avgScore)}%`}
        />
        <AnalyticsStat
          icon={<Clock className="h-4 w-4" />}
          label="Avg time"
          value={formatDuration(averageTimeMs)}
        />
        <AnalyticsStat
          icon={<BarChart3 className="h-4 w-4" />}
          label="Rating"
          value={ratingAverage ? ratingAverage.toFixed(1) : '—'}
        />
      </section>

      {mostMissed.length > 0 && (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-lg font-bold">Most Missed Questions</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {mostMissed.map((question) => (
              <div key={question.id} className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-bold text-muted-foreground">Question {question.index}</p>
                <p className="mt-1 line-clamp-3 text-sm font-semibold">{question.prompt}</p>
                <p className="mt-3 text-2xl font-black text-destructive">{question.correctRate}%</p>
                <p className="text-xs text-muted-foreground">correct rate</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Question Performance</h2>
            <p className="text-sm text-muted-foreground">
              Low correct rates and heavily picked wrong choices are good candidates for rewrites.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{questionStats.length} questions</span>
        </div>
        <div className="space-y-3">
          {questionStats.map((question) => (
            <article key={question.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">#{question.index}</Badge>
                    <Badge variant="secondary">{question.type}</Badge>
                    {question.needsAttention ? (
                      <Badge variant="warning">Needs attention</Badge>
                    ) : null}
                  </div>
                  <h3 className="font-semibold leading-snug">{question.prompt}</h3>
                  {question.mostPickedWrong && question.mostPickedWrong.count > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Most picked wrong answer:{' '}
                      <span className="font-semibold text-foreground">
                        {question.mostPickedWrong.text}
                      </span>{' '}
                      ({question.mostPickedWrong.count})
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center lg:w-72">
                  <MiniStat label="Answers" value={question.answerCount} />
                  <MiniStat
                    label="Correct"
                    value={question.correctRate === null ? '—' : `${question.correctRate}%`}
                  />
                  <MiniStat
                    label="Avg time"
                    value={
                      question.averageAnswerMs === null
                        ? '—'
                        : formatDuration(question.averageAnswerMs)
                    }
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function formatDuration(ms: number) {
  if (ms <= 0) return '—'
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function AnalyticsStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background px-2 py-2">
      <p className="text-sm font-black">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  )
}
