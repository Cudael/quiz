import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { QuizCard, type QuizCardData } from '@/components/ui/quiz-card'
import { prisma } from '@/server/prisma'

const PAGE_SIZE = 12

function mapQuizCard(quiz: {
  id: string
  title: string
  coverImage: string | null
  difficulty: string
  playCount: number
  avgScore: number
}) {
  return {
    id: quiz.id,
    title: quiz.title,
    coverImage: quiz.coverImage,
    playCount: quiz.playCount,
    avgScore: quiz.avgScore,
    difficulty:
      quiz.difficulty === 'EASY' || quiz.difficulty === 'MEDIUM' || quiz.difficulty === 'HARD'
        ? quiz.difficulty
        : 'MEDIUM',
  } satisfies Omit<QuizCardData, 'category'>
}

function buildCategoryHref(slug: string, page: number) {
  return page > 1 ? `/categories/${slug}?page=${page}` : `/categories/${slug}`
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams])
  const requestedPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      color: true,
      parentSlug: true,
    },
  })

  if (!category) {
    notFound()
  }

  const childCategories = await prisma.category.findMany({
    where: { parentSlug: category.slug },
    select: {
      id: true,
      slug: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })

  const categoryIds = [category.id, ...childCategories.map((child) => child.id)]
  const quizWhere = {
    isPublished: true,
    categoryId: { in: categoryIds },
  }

  const totalCount = await prisma.quiz.count({ where: quizWhere })
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)

  const quizzes = await prisma.quiz.findMany({
    where: quizWhere,
    orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
    take: PAGE_SIZE,
    skip: (currentPage - 1) * PAGE_SIZE,
    select: {
      id: true,
      title: true,
      coverImage: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
    },
  })

  const quizCards = quizzes.map((quiz) => ({
    ...mapQuizCard(quiz),
    category: {
      name: category.name,
      color: category.color,
    },
  }))

  return (
    <div className="container mx-auto px-4 py-12">
      <PageHeader
        back={
          <Button variant="ghost" asChild>
            <Link href="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
        }
        title={category.name}
        description={category.description}
      />

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">All quizzes in this category</h2>
            <p className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? 'quiz' : 'quizzes'}
              {childCategories.length > 0 ? ' across this topic and its subcategories' : ''}
            </p>
          </div>
          {childCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {childCategories.map((child) => (
                <Link
                  key={child.slug}
                  href={`/categories/${child.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {quizCards.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quizCards.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={buildCategoryHref(category.slug, currentPage - 1)}
                    className="rounded-md border border-border px-3 py-2 transition-colors hover:bg-muted"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="rounded-md border border-border px-3 py-2 text-muted-foreground">
                    Previous
                  </span>
                )}

                {currentPage < totalPages ? (
                  <Link
                    href={buildCategoryHref(category.slug, currentPage + 1)}
                    className="rounded-md border border-border px-3 py-2 transition-colors hover:bg-muted"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="rounded-md border border-border px-3 py-2 text-muted-foreground">
                    Next
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon="🧠"
            title="No quizzes in this category yet"
            description="Check back soon for new challenges."
          />
        )}
      </section>
    </div>
  )
}
