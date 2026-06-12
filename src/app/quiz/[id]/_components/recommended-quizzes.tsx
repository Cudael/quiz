import Link from 'next/link'
import { prisma } from '@/server/prisma'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Play, Star } from 'lucide-react'

const difficultyVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
}

interface RecommendedQuiz {
  id: string
  title: string
  difficulty: string
  playCount: number
  avgScore: number
  category: { name: string; color: string }
  _count: { ratings: number }
  ratings: { stars: number }[]
}

async function fetchRecommendedQuizzes(
  currentQuizId: string,
  categorySlug: string
): Promise<RecommendedQuiz[]> {
  // Fetch quizzes from the same category (excluding current), ordered by play count
  const sameCategory = await prisma.quiz.findMany({
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
      difficulty: true,
      playCount: true,
      avgScore: true,
      category: { select: { name: true, color: true } },
      _count: { select: { ratings: true } },
      ratings: { select: { stars: true } },
    },
  })

  const sameIds = new Set(sameCategory.map((q) => q.id))

  // Fetch popular quizzes from other categories
  const popular = await prisma.quiz.findMany({
    where: {
      isPublished: true,
      id: { notIn: [currentQuizId, ...sameIds] },
    },
    orderBy: { playCount: 'desc' },
    take: 5 - sameCategory.length,
    select: {
      id: true,
      title: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
      category: { select: { name: true, color: true } },
      _count: { select: { ratings: true } },
      ratings: { select: { stars: true } },
    },
  })

  return [...sameCategory, ...popular]
}

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
            href={`/quiz/${quiz.id}`}
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
