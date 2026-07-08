import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpenCheck, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { getQuizPath } from '@/lib/quiz-url'

export const metadata: Metadata = {
  title: 'Practice Mode',
  description: 'Review and replay the questions you got wrong — no pressure, no XP, just learning.',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function PracticePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/practice')
  }

  // Most recent answer per question for this user, newest sessions first.
  const answers = await prisma.questionAnswer.findMany({
    where: { session: { userId: session.user.id } },
    orderBy: { session: { createdAt: 'desc' } },
    take: 2000,
    select: {
      questionId: true,
      isCorrect: true,
      question: { select: { quizId: true } },
    },
  })

  const latestByQuestion = new Map<string, { isCorrect: boolean; quizId: string }>()
  for (const answer of answers) {
    if (!latestByQuestion.has(answer.questionId)) {
      latestByQuestion.set(answer.questionId, {
        isCorrect: answer.isCorrect,
        quizId: answer.question.quizId,
      })
    }
  }

  const missedByQuiz = new Map<string, number>()
  for (const entry of latestByQuestion.values()) {
    if (!entry.isCorrect) {
      missedByQuiz.set(entry.quizId, (missedByQuiz.get(entry.quizId) ?? 0) + 1)
    }
  }

  const quizzes =
    missedByQuiz.size > 0
      ? await prisma.quiz.findMany({
          where: { id: { in: [...missedByQuiz.keys()] }, isPublished: true },
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
            category: { select: { name: true } },
            _count: { select: { questions: true } },
          },
        })
      : []

  const items = quizzes
    .map((quiz) => ({ quiz, missed: missedByQuiz.get(quiz.id) ?? 0 }))
    .filter((item) => item.missed > 0)
    .sort((a, b) => b.missed - a.missed)

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-quiz-green/10 px-4 py-1.5 text-sm font-semibold text-quiz-green">
          <BookOpenCheck className="h-4 w-4" />
          Practice Mode
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Turn misses into mastery
        </h1>
        <p className="mt-2 text-muted-foreground">
          Replay only the questions you got wrong. Practice runs don&apos;t affect XP, streaks, or
          leaderboards.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-semibold">Nothing to review — nice work!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When you miss questions in a quiz, they&apos;ll show up here for practice.
          </p>
          <Button asChild className="mt-4" variant="accent">
            <Link href="/categories">Find a quiz</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(({ quiz, missed }) => (
            <li
              key={quiz.id}
              className="flex flex-col gap-3 rounded-md border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={getQuizPath({ id: quiz.id, slug: quiz.slug })}
                  className="font-bold hover:underline"
                >
                  {quiz.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{quiz.category.name}</Badge>
                  <span>
                    {missed} missed of {quiz._count.questions} questions
                  </span>
                </div>
              </div>
              <Button asChild variant="accent" className="shrink-0 font-bold">
                <Link href={`/play/${quiz.id}?mode=practice`}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Practice {missed} question{missed === 1 ? '' : 's'}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
