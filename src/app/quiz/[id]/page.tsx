import type { Metadata } from 'next'
import { cache, Suspense } from 'react'
import Image from 'next/image'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, BarChart3, Compass, Users, BookOpen, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { serializeJsonLd } from '@/lib/seo'
import { getDisplayAuthorName } from '@/lib/author-display'
import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import { ReportQuizForm } from '../report-quiz-form'
import { RateQuizForm } from '../rate-quiz-form'
import { RecommendedQuizzes } from './_components/recommended-quizzes'
import { YouMightAlsoLike } from './_components/you-might-also-like'
import { absoluteUrl } from '@/lib/site'
import { getQuizIdFromParam, getQuizPath } from '@/lib/quiz-url'

const difficultyVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
}

const QUIZ_META_SELECT = {
  id: true,
  title: true,
  description: true,
  coverImage: true,
  difficulty: true,
  playCount: true,
  avgScore: true,
  category: true,
  author: { select: { id: true, name: true, image: true, role: true } },
  questions: { select: { id: true } },
} as const

/** Cached quiz fetch — deduplicates across generateMetadata + page render. */
const getQuiz = cache(async (id: string) => {
  return prisma.quiz.findUnique({
    where: { id, isPublished: true },
    select: QUIZ_META_SELECT,
  })
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: idParam } = await params
  const id = getQuizIdFromParam(idParam)
  const quiz = await getQuiz(id)

  if (!quiz) {
    return {
      title: 'Quiz not found | BusQuiz',
      description: 'This quiz could not be found.',
    }
  }

  const title = `${quiz.title} by ${getDisplayAuthorName(quiz.author)} • ${quiz.category.name} | BusQuiz`
  const description = quiz.description || `Take ${quiz.title} and climb the leaderboard on BusQuiz.`
  const path = getQuizPath(quiz)
  const url = absoluteUrl(path)
  const ogImages = quiz.coverImage ? [quiz.coverImage] : ['/og-default.png']

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: { title, description, url, images: ogImages },
    twitter: { card: 'summary_large_image' as const, title, description, images: ogImages },
  }
}

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params
  const id = getQuizIdFromParam(idParam)
  const session = await auth()

  const [quiz, ratingAgg, userRating] = await Promise.all([
    getQuiz(id),
    prisma.rating.aggregate({
      where: { quizId: id },
      _avg: { stars: true },
      _count: { stars: true },
    }),
    session?.user?.id
      ? prisma.rating.findUnique({
          where: {
            userId_quizId: { userId: session.user.id, quizId: id },
          },
          select: { stars: true },
        })
      : null,
  ])

  if (!quiz) {
    notFound()
  }

  const quizPath = getQuizPath(quiz)
  if (idParam !== quizPath.replace('/quiz/', '')) {
    permanentRedirect(quizPath)
  }

  const questionCount = quiz.questions.length
  const educationalLevel =
    quiz.difficulty === 'EASY'
      ? 'beginner'
      : quiz.difficulty === 'HARD'
        ? 'advanced'
        : 'intermediate'

  const avgRating = ratingAgg._avg.stars ?? 0
  const ratingCount = ratingAgg._count.stars

  const quizJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: quiz.title,
    description: quiz.description || `Take ${quiz.title} and climb the leaderboard on BusQuiz.`,
    url: absoluteUrl(quizPath),
    ...(quiz.coverImage ? { image: quiz.coverImage } : {}),
    author: { '@type': 'Person', name: getDisplayAuthorName(quiz.author) },
    educationalLevel,
    numberOfQuestions: questionCount,
    ...(avgRating > 0 && ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating.toFixed(1),
            ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(quizJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
              {
                '@type': 'ListItem',
                position: 2,
                name: quiz.category.name,
                item: absoluteUrl(`/categories/${quiz.category.slug}`),
              },
              { '@type': 'ListItem', position: 3, name: quiz.title, item: absoluteUrl(quizPath) },
            ],
          }),
        }}
      />
      {/* Back */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero card — image left, content right */}
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex flex-col sm:flex-row">
              {/* Image — compact, left side */}
              <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-56 md:w-64">
                {quiz.coverImage ? (
                  <Image
                    src={quiz.coverImage}
                    alt={`${quiz.title} cover image`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 256px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, ${quiz.category.color} 0%, hsl(var(--foreground)) 100%)`,
                    }}
                  />
                )}
              </div>

              {/* Content — right side */}
              <div className="flex flex-col justify-between gap-3 p-4 sm:p-5 md:p-6">
                <div>
                  {/* Badges */}
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <Badge variant="purple">{quiz.category.name}</Badge>
                    <Badge variant={difficultyVariant[quiz.difficulty] ?? 'outline'}>
                      {quiz.difficulty}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl font-extrabold leading-tight md:text-2xl">{quiz.title}</h1>

                  {/* Author */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <Avatar
                      src={quiz.author.role === 'ADMIN' ? null : quiz.author.image}
                      fallback={getDisplayAuthorName(quiz.author)}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground">
                      by {getDisplayAuthorName(quiz.author)}
                    </span>
                  </div>

                  {/* Description */}
                  {quiz.description && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {quiz.description}
                    </p>
                  )}
                </div>

                {/* Play button — prominent */}
                <Button
                  asChild
                  size="lg"
                  variant="gradient"
                  className="w-full sm:w-fit rounded-xl font-bold shadow-lg shadow-quiz-purple/25"
                >
                  <Link href={`/play/${quiz.id}`}>
                    <Zap className="mr-2 h-5 w-5" />
                    Play Quiz
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats strip — below the hero */}
            <div className="grid grid-cols-3 sm:grid-cols-5 border-t">
              <StatStrip
                icon={<Users className="h-3.5 w-3.5" />}
                label="Brave souls"
                value={quiz.playCount}
              />
              <StatStrip
                icon={<BarChart3 className="h-3.5 w-3.5" />}
                label="Avg score"
                value={`${Math.round(quiz.avgScore)}%`}
              />
              <StatStrip
                icon={<BookOpen className="h-3.5 w-3.5" />}
                label="Questions"
                value={questionCount}
              />
              <StatStrip
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Time"
                value={`${Math.round((questionCount * 20) / 60)}m`}
              />
              <StatStrip
                icon={<Star className="h-3.5 w-3.5 text-quiz-yellow" />}
                label="Rating"
                value={avgRating > 0 ? avgRating.toFixed(1) : '—'}
              />
            </div>

            {/* What to Expect */}
            <div className="rounded-lg border border-dashed bg-muted/30 p-4">
              <p className="text-sm font-semibold mb-1">📋 What to Expect</p>
              <p className="text-xs text-muted-foreground">
                {questionCount} questions · ~20 seconds each · Average score is{' '}
                {Math.round(quiz.avgScore)}%
                {quiz.difficulty === 'HARD'
                  ? ' · This one\u2019s rated HARD \u2014 expect tricky questions!'
                  : quiz.difficulty === 'EASY'
                    ? ' · A good warm-up \u2014 perfect for building confidence!'
                    : ' · A solid challenge for any quiz lover!'}
              </p>
            </div>
          </div>

          {/* Rating + Report */}
          <div className="rounded-lg border p-4">
            <RateQuizForm
              quizId={quiz.id}
              userRating={userRating?.stars ?? null}
              avgRating={avgRating}
              ratingCount={ratingCount}
            />
          </div>

          <div>
            <ReportQuizForm quizId={quiz.id} />
          </div>
        </div>

        {/* Sidebar — Recommended Quizzes */}
        <div className="lg:col-span-1">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-quiz-purple-light" />
              <h2 className="text-lg font-bold">Recommended</h2>
            </div>
            <Card className="overflow-hidden">
              <Suspense>
                <RecommendedQuizzes currentQuizId={quiz.id} categorySlug={quiz.category.slug} />
              </Suspense>
            </Card>
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full rounded-xl">
                <Link href="/categories">Browse all quizzes</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* You Might Also Like */}
      <Suspense fallback={null}>
        <YouMightAlsoLike
          currentQuizId={quiz.id}
          categorySlug={quiz.category.slug}
          categoryName={quiz.category.name}
        />
      </Suspense>
    </div>
  )
}

function StatStrip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 border-r border-border px-2 py-2.5 last:border-r-0">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs font-bold tabular-nums">{value}</span>
      </div>
      <p className="text-[10px] text-muted-foreground/70">{label}</p>
    </div>
  )
}
