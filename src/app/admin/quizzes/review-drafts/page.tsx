import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/server/prisma'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { ReviewDraftsClient } from './_components/review-drafts-client'

export const metadata: Metadata = {
  title: 'Review Drafts',
  robots: { index: false },
}

export default async function ReviewDraftsPage() {
  const drafts = await prisma.quiz.findMany({
    where: { isPublished: false },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true, username: true } },
      questions: {
        orderBy: { order: 'asc' },
        include: {
          choices: { orderBy: { id: 'asc' } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const serialized = drafts.map((draft) => ({
    id: draft.id,
    title: draft.title,
    slug: draft.slug,
    description: draft.description,
    difficulty: draft.difficulty,
    format: draft.format,
    authorName: draft.author.name ?? draft.author.username ?? 'Unknown',
    categoryName: draft.category.name,
    categorySlug: draft.category.slug,
    updatedAt: draft.updatedAt.toISOString(),
    questions: draft.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      explanation: q.explanation,
      timeLimitSec: q.timeLimitSec,
      order: q.order,
      meta: q.meta as Record<string, unknown> | null,
      choices: q.choices.map((c) => ({
        id: c.id,
        text: c.text,
        isCorrect: c.isCorrect,
        meta: c.meta as Record<string, unknown> | null,
      })),
    })),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Drafts"
        description={`${drafts.length} draft${drafts.length === 1 ? '' : 's'} — all questions and answers in one place for easy proofreading.`}
        back={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/quizzes">
              <ArrowLeft className="h-4 w-4" />
              Back to quizzes
            </Link>
          </Button>
        }
      />

      {drafts.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">No drafts to review</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drafts will appear here once quizzes are created but not yet published.
          </p>
        </div>
      ) : (
        <ReviewDraftsClient drafts={serialized} />
      )}
    </div>
  )
}
