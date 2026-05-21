import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, RotateCcw, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { ResultsClient } from './results-client'

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session?: string }>
}) {
  const { id } = await params
  const { session: sessionId } = await searchParams

  if (!sessionId) {
    notFound()
  }

  const session = await prisma.playSession.findUnique({
    where: { id: sessionId },
    include: {
      quiz: {
        include: {
          category: true,
          questions: {
            orderBy: { order: 'asc' },
            include: {
              choices: true,
            },
          },
        },
      },
    },
  })

  if (!session || session.quizId !== id) {
    notFound()
  }

  const accuracy =
    session.totalCount > 0 ? Math.round((session.correctCount / session.totalCount) * 100) : 0

  // Find a harder quiz in the same category
  const harderQuiz = await prisma.quiz.findFirst({
    where: {
      categoryId: session.quiz.categoryId,
      difficulty: 'HARD',
      id: { not: id },
      isPublished: true,
    },
    orderBy: { playCount: 'desc' },
  })

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      {/* Confetti + level-up animation */}
      <ResultsClient
        score={session.score}
        accuracy={accuracy}
        sessionId={sessionId}
        quizId={id}
        mode={session.mode}
      />

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl" aria-hidden="true">
          {accuracy >= 100 ? '🏆' : accuracy >= 80 ? '⭐' : accuracy >= 60 ? '🎯' : '📚'}
        </div>
        <h1 className="text-3xl font-extrabold mb-2">
          {accuracy >= 80 ? 'Great job!' : accuracy >= 60 ? 'Nice try!' : 'Keep practicing!'}
        </h1>
        <p className="text-muted-foreground">{session.quiz.title}</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6 pb-4">
            <Trophy className="h-6 w-6 text-quiz-yellow mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-quiz-yellow">{session.score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 pb-4">
            <Zap className="h-6 w-6 text-quiz-purple-light mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-quiz-purple-light">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6 pb-4">
            <span className="text-2xl mb-2 block" aria-hidden="true">
              ⏱
            </span>
            <p className="text-2xl font-extrabold">
              {Math.floor(session.timeTakenMs / 60000)}:
              {String(Math.floor((session.timeTakenMs % 60000) / 1000)).padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground">Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Question breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {session.quiz.questions.map((q, idx) => {
            const correctText = q.choices
              .filter((c) => c.isCorrect)
              .map((c) => c.text)
              .join(', ')

            return (
              <div key={q.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start gap-2 mb-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium leading-snug">{q.prompt}</p>
                </div>
                <p className="text-xs text-muted-foreground pl-7">
                  Correct answer:{' '}
                  <span className="text-quiz-green font-semibold">{correctText}</span>
                </p>
                {q.explanation && (
                  <p className="mt-1 text-xs text-muted-foreground pl-7 italic">{q.explanation}</p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="gradient" size="lg" asChild className="flex-1">
          <Link href={`/play/${id}?mode=${session.mode.toLowerCase()}`}>
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Link>
        </Button>

        {harderQuiz && (
          <Button variant="outline" size="lg" asChild className="flex-1">
            <Link href={`/quiz/${harderQuiz.id}`}>
              Try a Harder One
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
