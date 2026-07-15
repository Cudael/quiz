import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { QuizCardHorizontal, type QuizCardData } from '@/components/ui/quiz-card'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'
import { WEEK_IN_MS } from '@/lib/time'
import { getDisplayAuthorName } from '@/lib/author-display'
import { isQuizListingIndexable } from '@/lib/seo-metadata'

const trendingMetadata: Metadata = {
  title: 'Trending Quizzes',
  description:
    'The quizzes everyone is playing this week. See what is trending on BusQuiz right now.',
  alternates: { canonical: '/trending' },
  openGraph: {
    title: 'Trending Quizzes — BusQuiz',
    description: 'The quizzes everyone is playing this week.',
    url: absoluteUrl('/trending'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending Quizzes — BusQuiz',
    description: 'The quizzes everyone is playing this week.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const oneWeekAgo = new Date(Date.now() - WEEK_IN_MS)
  const activeQuizGroups = await prisma.playSession.groupBy({
    by: ['quizId'],
    where: { createdAt: { gte: oneWeekAgo }, quiz: { isPublished: true } },
  })
  return isQuizListingIndexable(activeQuizGroups.length)
    ? trendingMetadata
    : { ...trendingMetadata, robots: { index: false, follow: true } }
}

export default async function TrendingQuizzesPage() {
  const oneWeekAgo = new Date()
  oneWeekAgo.setTime(oneWeekAgo.getTime() - WEEK_IN_MS)

  const quizGroups = await prisma.playSession.groupBy({
    by: ['quizId'],
    where: { createdAt: { gte: oneWeekAgo } },
    _count: { quizId: true },
    orderBy: [{ _count: { quizId: 'desc' } }],
    take: 50,
  })

  let quizzes: QuizCardData[] = []

  if (quizGroups.length > 0) {
    const raw = await prisma.quiz.findMany({
      where: {
        id: { in: quizGroups.map((g) => g.quizId) },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        difficulty: true,
        playCount: true,
        avgScore: true,
        author: { select: { username: true, role: true } },
        category: { select: { slug: true, name: true, icon: true, color: true } },
        _count: { select: { ratings: true } },
        ratings: { select: { stars: true } },
      },
    })

    const quizzesById = new Map(raw.map((q) => [q.id, q]))

    quizzes = quizGroups
      .map((g) => quizzesById.get(g.quizId))
      .filter((q): q is NonNullable<typeof q> => !!q)
      .map((quiz) => {
        const ratingCount = quiz._count.ratings
        const avgRating =
          ratingCount > 0
            ? quiz.ratings.reduce((sum, r) => sum + r.stars, 0) / ratingCount
            : undefined

        return {
          id: quiz.id,
          title: quiz.title,
          slug: quiz.slug,
          coverImage: quiz.coverImage,
          difficulty: quiz.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
          category: {
            name: quiz.category.name,
            color: quiz.category.color || 'var(--background-image-card-gradient)',
          },
          playCount: quiz.playCount,
          avgScore: quiz.avgScore ?? undefined,
          avgRating,
          ratingCount,
          authorName: quiz.author ? getDisplayAuthorName(quiz.author) : undefined,
        }
      })
  }

  return (
    <div className="container mx-auto px-4 py-10 md:px-6 md:py-16">
      <PageHeader
        eyebrow="Hot this week"
        accent="pink"
        back={
          <Button variant="ghost" asChild className="-ml-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        }
        title="Trending Right Now Quizzes"
        description="The quizzes everyone is playing this week — ranked by recent plays."
      />

      {quizzes.length === 0 ? (
        <div className="rounded-md border border-dashed bg-accent/20 p-12 text-center">
          <p className="text-muted-foreground">No trending quizzes yet. Be the first to play!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {quizzes.map((quiz) => (
            <QuizCardHorizontal key={quiz.id} quiz={quiz} className="w-full min-w-0" />
          ))}
        </div>
      )}
    </div>
  )
}
