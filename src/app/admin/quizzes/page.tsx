import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import { Upload } from 'lucide-react'
import { prisma } from '@/server/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'
import { getDisplayAuthorName } from '@/lib/author-display'
import { getQuizPath } from '@/lib/quiz-url'
import { AdminQuizActions } from './_components/quiz-actions'

const PAGE_SIZE = 25

function buildQuizzesHref({
  q,
  category,
  difficulty,
  published,
  page,
}: {
  q?: string
  category?: string
  difficulty?: string
  published?: string
  page: number
}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category && category !== 'ALL') params.set('category', category)
  if (difficulty && difficulty !== 'ALL') params.set('difficulty', difficulty)
  if (published && published !== 'ALL') params.set('published', published)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/admin/quizzes?${query}` : '/admin/quizzes'
}

function difficultyBadgeClass(difficulty: string) {
  if (difficulty === 'EASY') return 'bg-quiz-green/15 text-quiz-green'
  if (difficulty === 'HARD') return 'bg-destructive/15 text-destructive'
  return 'bg-quiz-orange/15 text-quiz-orange'
}

export default async function AdminQuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    difficulty?: string
    published?: string
    page?: string
  }>
}) {
  const { q, category, difficulty, published, page } = await searchParams
  const pageIndex = Math.max(0, Number.parseInt(page ?? '1', 10) - 1 || 0)
  const categoryFilter = category && category !== 'ALL' ? category : 'ALL'
  const difficultyFilter =
    difficulty === 'EASY' || difficulty === 'MEDIUM' || difficulty === 'HARD' ? difficulty : 'ALL'
  const publishedFilter = published === 'true' || published === 'false' ? published : 'ALL'

  const where: Prisma.QuizWhereInput = {
    ...(q
      ? {
          OR: [{ title: { contains: q } }, { description: { contains: q } }],
        }
      : {}),
    ...(categoryFilter !== 'ALL' ? { category: { slug: categoryFilter } } : {}),
    ...(difficultyFilter !== 'ALL' ? { difficulty: difficultyFilter } : {}),
    ...(publishedFilter !== 'ALL' ? { isPublished: publishedFilter === 'true' } : {}),
  }

  const [quizzes, totalCount, categories] = await Promise.all([
    prisma.quiz.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true, color: true } },
        author: { select: { name: true, username: true, role: true } },
        _count: { select: { questions: true, sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: pageIndex * PAGE_SIZE,
    }),
    prisma.quiz.count({ where }),
    prisma.category.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = pageIndex + 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quizzes"
        description={`${totalCount} quizzes`}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/quizzes/import">
              <Upload className="h-4 w-4" />
              Bulk Import
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-6 pt-6">
          <form
            className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_160px_160px_auto]"
            method="GET"
          >
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={q ?? ''}
              name="q"
              placeholder="Search quizzes"
              type="search"
            />
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={categoryFilter}
              name="category"
            >
              <option value="ALL">All categories</option>
              {categories.map((categoryOption) => (
                <option key={categoryOption.slug} value={categoryOption.slug}>
                  {categoryOption.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={difficultyFilter}
              name="difficulty"
            >
              <option value="ALL">All difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={publishedFilter}
              name="published"
            >
              <option value="ALL">All statuses</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
            <Button type="submit">Apply filters</Button>
          </form>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Questions</th>
                  <th className="px-4 py-3">Plays</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => {
                  return (
                    <tr key={quiz.id} className="border-t border-border align-top">
                      <td className="px-4 py-3">
                        <Link
                          className="font-medium transition-colors hover:text-primary"
                          href={getQuizPath({ id: quiz.id, slug: quiz.slug })}
                        >
                          {quiz.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-border"
                            style={{ background: quiz.category.color }}
                          />
                          <span>{quiz.category.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {quiz.author.username ? (
                          <Link
                            className="transition-colors hover:text-primary"
                            href={`/u/${quiz.author.username}`}
                          >
                            {getDisplayAuthorName(quiz.author)}
                          </Link>
                        ) : (
                          <span>{getDisplayAuthorName(quiz.author)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={difficultyBadgeClass(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{quiz._count.questions}</td>
                      <td className="px-4 py-3">{quiz._count.sessions}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            quiz.isPublished
                              ? 'bg-quiz-green/15 text-quiz-green'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {quiz.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {quiz.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <AdminQuizActions
                          quizId={quiz.id}
                          quizSlug={quiz.slug}
                          quizTitle={quiz.title}
                          isPublished={quiz.isPublished}
                          nextPublish={quiz.isPublished ? 'false' : 'true'}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  className="rounded-md border border-border px-3 py-2 transition-colors hover:bg-muted"
                  href={buildQuizzesHref({
                    q,
                    category: categoryFilter,
                    difficulty: difficultyFilter,
                    published: publishedFilter,
                    page: currentPage - 1,
                  })}
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
                  className="rounded-md border border-border px-3 py-2 transition-colors hover:bg-muted"
                  href={buildQuizzesHref({
                    q,
                    category: categoryFilter,
                    difficulty: difficultyFilter,
                    published: publishedFilter,
                    page: currentPage + 1,
                  })}
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
        </CardContent>
      </Card>
    </div>
  )
}
