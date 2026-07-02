import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { BookOpen, Users } from 'lucide-react'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'
import { getQuizPath } from '@/lib/quiz-url'

export const metadata: Metadata = {
  robots: { index: false },
}

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  MEDIUM: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  HARD: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
}

function isValidImageUrl(url: string | null): boolean {
  return Boolean(url && (url.startsWith('http://') || url.startsWith('https://')))
}

export default async function EmbedQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quiz = await prisma.quiz.findFirst({
    where: { isPublished: true, OR: [{ id }, { slug: id }] },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      difficulty: true,
      coverImage: true,
      playCount: true,
      category: { select: { name: true } },
      _count: { select: { questions: true } },
    },
  })

  if (!quiz) notFound()

  const playUrl = absoluteUrl(getQuizPath(quiz))

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-3">
      <div className="w-full max-w-sm overflow-hidden rounded-lg border bg-card shadow-sm">
        {isValidImageUrl(quiz.coverImage) ? (
          <div className="relative h-32 w-full">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="384px"
              src={quiz.coverImage as string}
              unoptimized
            />
          </div>
        ) : null}
        <div className="p-4">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <span className="rounded-sm bg-muted px-2 py-0.5">{quiz.category.name}</span>
            <span
              className={`rounded-sm px-2 py-0.5 ${DIFFICULTY_STYLES[quiz.difficulty] ?? DIFFICULTY_STYLES.MEDIUM}`}
            >
              {quiz.difficulty}
            </span>
          </div>
          <h1 className="mb-1 text-lg font-extrabold leading-tight">{quiz.title}</h1>
          {quiz.description ? (
            <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{quiz.description}</p>
          ) : null}
          <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {quiz._count.questions} questions
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {quiz.playCount} plays
            </span>
          </div>
          <a
            className="block w-full rounded-md bg-foreground py-2.5 text-center text-sm font-bold text-background hover:opacity-90"
            href={playUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Play on BusQuiz →
          </a>
        </div>
      </div>
    </div>
  )
}
