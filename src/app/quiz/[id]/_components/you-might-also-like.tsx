import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/prisma'
import { QuizCardHorizontal, type QuizCardData } from '@/components/ui/quiz-card'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const YMAL_TAG = 'quiz-ymal'

const fetchYouMightAlsoLike = unstable_cache(
  async (currentQuizId: string, categorySlug: string): Promise<QuizCardData[]> => {
    const quizzes = await prisma.quiz.findMany({
      where: {
        isPublished: true,
        id: { not: currentQuizId },
        category: { slug: categorySlug },
      },
      orderBy: { playCount: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        difficulty: true,
        playCount: true,
        avgScore: true,
        category: { select: { name: true, color: true } },
        _count: { select: { ratings: true } },
        ratings: { select: { stars: true } },
      },
    })

    return quizzes.map((q) => {
      const ratingCount = q._count.ratings
      const avgRating =
        ratingCount > 0 ? q.ratings.reduce((sum, r) => sum + r.stars, 0) / ratingCount : undefined

      return {
        id: q.id,
        title: q.title,
        slug: q.slug,
        coverImage: q.coverImage,
        difficulty: q.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        category: {
          name: q.category.name,
          color: q.category.color || 'var(--background-image-card-gradient)',
        },
        playCount: q.playCount,
        avgScore: q.avgScore ?? undefined,
        avgRating,
        ratingCount,
      }
    })
  },
  [YMAL_TAG],
  { revalidate: 300, tags: [YMAL_TAG] }
)

export async function YouMightAlsoLike({
  currentQuizId,
  categorySlug,
  categoryName,
}: {
  currentQuizId: string
  categorySlug: string
  categoryName: string
}) {
  const quizzes = await fetchYouMightAlsoLike(currentQuizId, categorySlug)
  if (quizzes.length === 0) return null

  return (
    <section className="mt-10 border-t pt-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">You Might Also Like</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">More quizzes in {categoryName}</p>
        </div>
        <Button variant="ghost" asChild size="sm" className="gap-1">
          <Link href={`/categories/${categorySlug}`}>
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {quizzes.map((quiz) => (
          <QuizCardHorizontal key={quiz.id} quiz={quiz} />
        ))}
      </div>
    </section>
  )
}
