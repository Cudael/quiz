import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/prisma'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Play, Star } from 'lucide-react'
import { getQuizPath } from '@/lib/quiz-url'

const difficultyVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
}

interface RecommendedQuiz {
  id: string
  title: string
  slug: string
  difficulty: string
  playCount: number
  avgScore: number
  category: { name: string; color: string }
  _count: { ratings: number }
  ratings: { stars: number }[]
}

const QUIZ_RECOMMENDED_TAG = 'quiz-recommended'

const fetchRecommendedQuizzes = unstable_cache(
  async (currentQuizId: string, categorySlug: string): Promise<RecommendedQuiz[]> => {
    // Fetch same-category + popular quizzes in parallel
    const [sameCategory, popularAll] = await Promise.all([
      prisma.quiz.findMany({
        where: {
          isPublished: true,
          id: { not: currentQuizId },
          category: { slug: categorySlug },
        },
        orderBy: { playCount: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          playCount: true,
          avgScore: true,
          category: { select: { name: true, color: true } },
          _count: { select: { ratings: true } },
          ratings: { select: { stars: true } },
        },
      }),
      prisma.quiz.findMany({
        where: {
          isPublished: true,
          id: { not: currentQuizId },
        },
        orderBy: { playCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          playCount: true,
          avgScore: true,
          category: { select: { name: true, color: true } },
          _count: { select: { ratings: true } },
          ratings: { select: { stars: true } },
        },
      }),
    ])

    // Deduplicate — same-category first, then popular (excluding already shown)
    const sameIds = new Set(sameCategory.map((q) => q.id))
    const popular = popularAll.filter((q) => !sameIds.has(q.id))
    const needed = 5 - sameCategory.length

    return [...sameCategory, ...popular.slice(0, Math.max(0, needed))]
  },
  ['quiz-recommended'],
  {
    revalidate: 300,
    tags: [QUIZ_RECOMMENDED_TAG],
  }
)

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

function computeAvgRating(ratings: { stars: number }[]): number | null {
  if (ratings.length === 0) return null
  return ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
}

export async function RecommendedQuizzes({
  currentQuizId,
  categorySlug,
}: {
  currentQuizId: string
  categorySlug: string
}) {
  const quizzes = await fetchRecommendedQuizzes(currentQuizId, categorySlug)

  if (quizzes.length === 0) return null

  return (
    <div className="divide-y divide-border">
      {quizzes.map((quiz) => {
        const avgRating = computeAvgRating(quiz.ratings)
        return (
          <Link
            key={quiz.id}
            href={getQuizPath(quiz)}
            className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
          >
            {/* Category color dot */}
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: quiz.category.color }}
              aria-hidden="true"
            />

            {/* Title + meta */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                {quiz.title}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Badge
                  variant={difficultyVariant[quiz.difficulty] ?? 'outline'}
                  className="py-0 text-[10px]"
                >
                  {quiz.difficulty}
                </Badge>
                <span className="flex items-center gap-0.5">
                  <Play className="h-2.5 w-2.5" />
                  {formatCount(quiz.playCount)}
                </span>
                <span className="flex items-center gap-0.5">
                  <BarChart3 className="h-2.5 w-2.5" />
                  {Math.round(quiz.avgScore)}%
                </span>
                {avgRating && (
                  <span className="flex items-center gap-0.5 text-quiz-yellow">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    {avgRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow hint */}
            <span className="text-muted-foreground/40 text-xs opacity-0 transition-opacity group-hover:opacity-100">
              →
            </span>
          </Link>
        )
      })}
    </div>
  )
}
