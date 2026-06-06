import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, RotateCcw, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { prisma } from '@/server/prisma'
import { ResultsClient } from './results-client'
import { LevelProgress } from '@/components/ui/level-progress'
import { auth } from '@/server/auth'
import { QuestionBreakdown } from './_components/question-breakdown'

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

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <ResultsClient
        score={sessionRow.score}
        accuracy={accuracy}
        sessionId={sessionId}
        quizId={id}
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

      <QuestionBreakdown questions={sessionRow.quiz.questions} answers={sessionRow.answers} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="gradient" size="lg" asChild className="flex-1">
          <Link href={`/play/${id}`}>
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
