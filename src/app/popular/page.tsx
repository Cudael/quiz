import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { QuizCardHorizontal, type QuizCardData } from '@/components/ui/quiz-card'
import { prisma } from '@/server/prisma'
import { absoluteUrl } from '@/lib/site'
import { getDisplayAuthorName } from '@/lib/author-display'

export const metadata: Metadata = {
  title: 'Most Popular Quizzes',
  description:
    'The all-time most played quizzes on BusQuiz. See what thousands of players are enjoying.',
  alternates: { canonical: '/popular' },
  openGraph: {
    title: 'Most Popular Quizzes — BusQuiz',
    description: 'The all-time most played quizzes on BusQuiz.',
    url: absoluteUrl('/popular'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Most Popular Quizzes — BusQuiz',
    description: 'The all-time most played quizzes on BusQuiz.',
  },
}

export default async function PopularQuizzesPage() {
  const raw = await prisma.quiz.findMany({
    where: { isPublished: true },
    orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
    take: 50,
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
      author: { select: { name: true, role: true } },
      category: { select: { slug: true, name: true, icon: true, color: true } },
      _count: { select: { ratings: true } },
      ratings: { select: { stars: true } },
    },
  })

  const quizzes: QuizCardData[] = raw.map((quiz) => {
    const ratingCount = quiz._count.ratings
    const avgRating =
      ratingCount > 0 ? quiz.ratings.reduce((sum, r) => sum + r.stars, 0) / ratingCount : undefined

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

  return (
    <div className="container mx-auto px-4 py-10 md:px-6 md:py-16">
      <PageHeader
        eyebrow="Most played"
        accent="orange"
        back={
          <Button variant="ghost" asChild className="-ml-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        }
        title="Most Popular Quizzes"
        description={`The all-time crowd favorites — ${quizzes.length} quizzes ranked by play count.`}
      />

      {quizzes.length === 0 ? (
        <div className="rounded-md border border-dashed bg-accent/20 p-12 text-center">
          <p className="text-muted-foreground">No quizzes yet. Be the first to create one!</p>
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
