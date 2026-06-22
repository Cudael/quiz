import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, RotateCcw, Zap, ChevronRight, Award, Medal, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { prisma } from '@/server/prisma'
import { ResultsClient } from './results-client'
import { LevelProgress } from '@/components/ui/level-progress'
import { auth } from '@/server/auth'
import { RateQuizForm } from '@/app/quiz/rate-quiz-form'
import { QuestionBreakdown } from './_components/question-breakdown'
import { copy } from '@/lib/copy'

export const metadata: Metadata = {
  title: 'Quiz Results',
  robots: { index: false },
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

  const targetDifficulty =
    accuracy >= 85 ? 'HARD' : accuracy < 60 ? 'EASY' : sessionRow.quiz.difficulty
  const nextQuizzes = await prisma.quiz.findMany({
    where: {
      categoryId: sessionRow.quiz.categoryId,
      difficulty: targetDifficulty,
      id: { not: id },
      isPublished: true,
    },
    orderBy: { playCount: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      difficulty: true,
      playCount: true,
      category: { select: { name: true } },
      questions: { select: { id: true } },
    },
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
  const hasMistakes = sessionRow.correctCount < sessionRow.totalCount

  // Fetch rating data for this quiz + user's existing rating
  const [ratingAgg, userRating] = await Promise.all([
    prisma.rating.aggregate({
      where: { quizId: id },
      _avg: { stars: true },
      _count: { stars: true },
    }),
    authSession?.user?.id
      ? prisma.rating.findUnique({
          where: {
            userId_quizId: { userId: authSession.user.id, quizId: id },
          },
          select: { stars: true },
        })
      : null,
  ])

  const avgRating = ratingAgg._avg.stars ?? 0
  const ratingCount = ratingAgg._count.stars

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
        {(() => {
          const tier =
            copy.results.headlines.find((h) => accuracy >= h.min && accuracy <= h.max) ??
            copy.results.headlines[copy.results.headlines.length - 1]
          return (
            <>
              <div className="mb-4 text-6xl" aria-hidden="true">
                {tier.emoji}
              </div>
              <h1 className="mb-2 text-3xl font-extrabold">{tier.title}</h1>
              <p className="text-muted-foreground">{tier.subtitle}</p>
            </>
          )
        })()}
        <p className="mt-2 text-sm text-muted-foreground">{sessionRow.quiz.title}</p>
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

      {(newBadgeNames.length > 0 || leveledUp || isPersonalBest || accuracy === 100) && (
        <Card className="mb-6 border-quiz-green/30 bg-quiz-green/5">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Medal className="h-5 w-5 text-quiz-green" />
              <h2 className="font-bold">Run Highlights</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {accuracy === 100 && (
                <HighlightPill icon={<Star className="h-4 w-4" />} title="Perfect score" />
              )}
              {isPersonalBest && (
                <HighlightPill icon={<Trophy className="h-4 w-4" />} title="New personal best" />
              )}
              {leveledUp && (
                <HighlightPill
                  icon={<Zap className="h-4 w-4" />}
                  title={`Leveled up to ${newLevel}`}
                />
              )}
              {newBadgeNames.map((badgeName) => (
                <HighlightPill
                  key={badgeName}
                  icon={<Award className="h-4 w-4" />}
                  title={`Badge unlocked: ${badgeName}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {hasMistakes && (
        <div className="mb-6 text-center">
          <Button variant="outline" asChild>
            <Link href="#question-breakdown">Review Mistakes</Link>
          </Button>
        </div>
      )}

      <div id="question-breakdown" className="scroll-mt-24">
        <QuestionBreakdown questions={sessionRow.quiz.questions} answers={sessionRow.answers} />
      </div>

      {/* Rating */}
      <div className="mt-8 mb-8 rounded-lg border p-4">
        <RateQuizForm
          quizId={id}
          userRating={userRating?.stars ?? null}
          avgRating={avgRating}
          ratingCount={ratingCount}
        />
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <NextStepCard
          title="Play Again"
          description="Retake this quiz and chase a better run."
          href={`/play/${id}`}
          icon={<RotateCcw className="h-5 w-5" />}
          primary
        />
        {nextQuizzes.slice(0, 2).map((quiz, index) => (
          <NextStepCard
            key={quiz.id}
            title={
              index === 0
                ? accuracy >= 85
                  ? 'Try a Harder One'
                  : accuracy < 60
                    ? 'Build Confidence'
                    : 'Keep Practicing'
                : 'Similar Quiz'
            }
            description={`${quiz.title} · ${quiz.questions.length} questions`}
            href={`/quiz/${quiz.id}`}
            icon={<ChevronRight className="h-5 w-5" />}
          />
        ))}
      </section>
    </div>
  )
}

function HighlightPill({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-quiz-green/25 bg-background/80 px-3 py-2 text-sm font-semibold text-quiz-green">
      {icon}
      <span>{title}</span>
    </div>
  )
}

function NextStepCard({
  title,
  description,
  href,
  icon,
  primary = false,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 ${
        primary ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-card'
      }`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 text-primary">
        {icon}
      </div>
      <h2 className="font-bold">{title}</h2>
      <p
        className={`mt-1 text-sm ${primary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
      >
        {description}
      </p>
    </Link>
  )
}
