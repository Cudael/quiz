import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Trophy,
  RotateCcw,
  Zap,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/server/prisma'
import { ResultsClient } from './results-client'
import { LevelProgress } from '@/components/ui/level-progress'
import { auth } from '@/server/auth'
import { copy } from '@/lib/copy'
import { GuestUpgradePrompt } from '@/components/auth/guest-upgrade-prompt'
import { renderFillBlankPrompt } from '@/domain/quiz-constants'

function parseChosenIds(value: string) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    session?: string
    xpEarned?: string
    leveledUp?: string
    newLevel?: string
    newBadges?: string
  }>
}) {
  const { id } = await params
  const {
    session: sessionId,
    xpEarned: xpEarnedParam,
    leveledUp: leveledUpParam,
    newLevel: newLevelParam,
    newBadges,
  } = await searchParams

  if (!sessionId) {
    notFound()
  }

  const [sessionRow, authSession] = await Promise.all([
    prisma.playSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: true,
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
    }),
    auth(),
  ])

  if (!sessionRow || sessionRow.quizId !== id) {
    notFound()
  }

  const accuracy =
    sessionRow.totalCount > 0
      ? Math.round((sessionRow.correctCount / sessionRow.totalCount) * 100)
      : 0

  const harderQuiz = await prisma.quiz.findFirst({
    where: {
      categoryId: sessionRow.quiz.categoryId,
      difficulty: 'HARD',
      id: { not: id },
      isPublished: true,
    },
    orderBy: { playCount: 'desc' },
  })

  const userStats = authSession?.user?.id
    ? await prisma.user.findUnique({
        where: { id: authSession.user.id },
        select: { xp: true },
      })
    : null

  const xpEarned = Number(xpEarnedParam ?? 0) || 0
  const leveledUp = leveledUpParam === '1'
  const newLevel = Number(newLevelParam ?? 1) || 1
  const newBadgeNames = newBadges
    ? newBadges
        .split('|')
        .map((name) => decodeURIComponent(name.trim()))
        .filter(Boolean)
    : []

  const personalBest =
    sessionRow.userId !== null
      ? (() => {
          return prisma.playSession
            .findFirst({
              where: {
                userId: sessionRow.userId,
                quizId: sessionRow.quizId,
                id: { not: sessionRow.id },
              },
              orderBy: { score: 'desc' },
              select: { score: true },
            })
            .then((best) => !best || sessionRow.score > best.score)
        })()
      : Promise.resolve(false)

  const isPersonalBest = await personalBest
  const answersByQuestionId = new Map(
    sessionRow.answers.map((answer) => [
      answer.questionId,
      {
        ...answer,
        chosenIds: parseChosenIds(answer.chosenIds),
      },
    ])
  )

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <ResultsClient
        score={sessionRow.score}
        accuracy={accuracy}
        sessionId={sessionId}
        quizId={id}
        mode={sessionRow.mode}
        unlockedBadges={newBadgeNames}
        leveledUp={leveledUp}
        personalBest={isPersonalBest}
      />

      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl" aria-hidden="true">
          {accuracy >= 100 ? '🏆' : accuracy >= 80 ? '⭐' : accuracy >= 60 ? '🎯' : '📚'}
        </div>
        <h1 className="mb-2 text-3xl font-extrabold">
          {accuracy >= 80 ? 'Great job!' : accuracy >= 60 ? 'Nice try!' : 'Keep practicing!'}
        </h1>
        <p className="text-muted-foreground">{sessionRow.quiz.title}</p>
      </div>

      <GuestUpgradePrompt variant="strong" />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center justify-between text-sm">
            <p>
              XP earned: <span className="font-semibold text-quiz-purple-light">+{xpEarned}</span>
            </p>
            <p>
              Level: <span className="font-semibold">{newLevel}</span>{' '}
              {leveledUp ? <span className="text-quiz-green">(Leveled up!)</span> : null}
            </p>
          </div>
          <LevelProgress xp={userStats?.xp ?? xpEarned} size="md" />
        </CardContent>
      </Card>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pb-4 pt-6">
            <Trophy className="mx-auto mb-2 h-6 w-6 text-quiz-yellow" />
            <p className="text-2xl font-extrabold text-quiz-yellow">{sessionRow.score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pb-4 pt-6">
            <Zap className="mx-auto mb-2 h-6 w-6 text-quiz-purple-light" />
            <p className="text-2xl font-extrabold text-quiz-purple-light">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pb-4 pt-6">
            <span className="mb-2 block text-2xl" aria-hidden="true">
              ⏱
            </span>
            <p className="text-2xl font-extrabold">
              {Math.floor(sessionRow.timeTakenMs / 60000)}:
              {String(Math.floor((sessionRow.timeTakenMs % 60000) / 1000)).padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground">Time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessionRow.quiz.questions.map((q, idx) => {
            const correctText = q.choices
              .filter((c) => c.isCorrect)
              .map((c) => c.text)
              .join(', ')
            const displayPrompt =
              q.type === 'FILL_BLANK' ? renderFillBlankPrompt(q.prompt) : q.prompt
            const answer = answersByQuestionId.get(q.id) ?? null
            const chosenIds = new Set(answer?.chosenIds ?? [])
            const hasAnswerData = answer !== null
            const isCorrectAnswer = answer?.isCorrect === true
            const statusIcon = !hasAnswerData ? (
              <MinusCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            ) : isCorrectAnswer ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-quiz-green" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            )
            const containerClassName = !hasAnswerData
              ? 'border-border'
              : isCorrectAnswer
                ? 'border-quiz-green/40 bg-quiz-green/5'
                : 'border-destructive/40 bg-destructive/5'

            return (
              <div key={q.id} className={`rounded-lg border p-3 ${containerClassName}`}>
                <div className="mb-2 flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  {statusIcon}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium leading-snug">{displayPrompt}</p>
                      {hasAnswerData ? (
                        <span
                          className={`text-xs font-semibold ${
                            isCorrectAnswer ? 'text-quiz-green' : 'text-destructive'
                          }`}
                        >
                          {isCorrectAnswer ? 'Correct' : 'Incorrect'}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          Legacy session
                        </span>
                      )}
                    </div>

                    {hasAnswerData ? (
                      <div className="mt-3 space-y-2">
                        {q.choices.map((choice) => {
                          const isChosen = chosenIds.has(choice.id)
                          const isCorrect = choice.isCorrect

                          return (
                            <div
                              key={choice.id}
                              className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs ${
                                isCorrect
                                  ? 'border-quiz-green/40 bg-quiz-green/10'
                                  : isChosen
                                    ? 'border-destructive/40 bg-destructive/10'
                                    : 'border-border bg-background/80'
                              }`}
                            >
                              <span>{choice.text}</span>
                              <span className="shrink-0 font-semibold text-muted-foreground">
                                {isChosen ? 'Selected' : null}
                                {isChosen && isCorrect ? ' • ' : null}
                                {isCorrect ? 'Correct' : null}
                              </span>
                            </div>
                          )
                        })}
                        {!isCorrectAnswer && chosenIds.size === 0 && q.type === 'FILL_BLANK' ? (
                          <p className="text-xs text-muted-foreground">
                            No accepted answer was recorded for this response.
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Answer details are unavailable for this session.
                      </p>
                    )}
                  </div>
                </div>
                <p className="pl-7 text-xs text-muted-foreground">
                  {hasAnswerData && !isCorrectAnswer
                    ? copy.quiz.wrongAnswer(correctText)
                    : `Accepted answer${correctText.includes(',') ? 's' : ''}: ${correctText}`}
                </p>
                {q.explanation && (
                  <p className="mt-1 pl-7 text-xs italic text-muted-foreground">{q.explanation}</p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="gradient" size="lg" asChild className="flex-1">
          <Link href={`/play/${id}?mode=${sessionRow.mode.toLowerCase()}`}>
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
