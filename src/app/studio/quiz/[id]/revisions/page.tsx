import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, History } from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { saveRevision, restoreRevision } from '@/app/studio/actions/revision-actions'

export const metadata: Metadata = {
  title: 'Quiz Revisions',
  robots: { index: false },
}

export default async function QuizRevisionsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/studio')
  }

  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      authorId: true,
      collaborators: { where: { userId: session.user.id }, select: { userId: true } },
      revisions: {
        orderBy: { version: 'desc' },
        select: {
          id: true,
          version: true,
          note: true,
          createdAt: true,
          createdById: true,
          snapshot: true,
        },
      },
    },
  })

  if (!quiz) notFound()

  const creatorIds = [
    ...new Set(quiz.revisions.map((r) => r.createdById).filter(Boolean)),
  ] as string[]
  const creators = creatorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: creatorIds } },
        select: { id: true, username: true },
      })
    : []
  const creatorNames = new Map(creators.map((u) => [u.id, u.username ?? 'Player']))

  const isOwner = quiz.authorId === session.user.id || session.user.role === 'ADMIN'
  const isCollaborator = quiz.collaborators.length > 0
  if (!isOwner && !isCollaborator) {
    redirect('/studio')
  }

  const saveAction = saveRevision as unknown as (formData: FormData) => Promise<void>
  const restoreAction = restoreRevision as unknown as (formData: FormData) => Promise<void>

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Button variant="ghost" asChild className="mb-4 -ml-2">
        <Link href={`/studio/quiz/${quiz.id}/edit`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to editor
        </Link>
      </Button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <History className="h-5 w-5 text-quiz-purple-light" />
            <h1 className="text-2xl font-extrabold">Revisions</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Version history for <span className="font-semibold">{quiz.title}</span>. A snapshot is
            saved automatically each time you publish.
          </p>
        </div>
        <form action={saveAction}>
          <input name="quizId" type="hidden" value={quiz.id} />
          <input name="note" type="hidden" value="Manual snapshot" />
          <Button type="submit" variant="outline">
            Save snapshot
          </Button>
        </form>
      </div>

      {quiz.revisions.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No revisions yet. Save a snapshot or publish the quiz to create one.
        </p>
      ) : (
        <ul className="space-y-3">
          {quiz.revisions.map((revision, index) => {
            const snapshot = revision.snapshot as { questions?: unknown[] } | null
            const questionCount = Array.isArray(snapshot?.questions)
              ? snapshot.questions.length
              : null
            return (
              <li
                key={revision.id}
                className="flex flex-col gap-3 rounded-md border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">v{revision.version}</Badge>
                    {index === 0 ? <Badge variant="success">Latest</Badge> : null}
                    {questionCount !== null ? (
                      <span className="text-xs text-muted-foreground">
                        {questionCount} question{questionCount === 1 ? '' : 's'}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm">{revision.note ?? 'No note'}</p>
                  <p className="text-xs text-muted-foreground">
                    {revision.createdAt.toLocaleString()}
                    {revision.createdById && creatorNames.get(revision.createdById)
                      ? ` · by ${creatorNames.get(revision.createdById)}`
                      : ''}
                  </p>
                </div>
                {isOwner && index !== 0 ? (
                  <form action={restoreAction}>
                    <input name="quizId" type="hidden" value={quiz.id} />
                    <input name="revisionId" type="hidden" value={revision.id} />
                    <Button size="sm" type="submit" variant="outline">
                      Restore this version
                    </Button>
                  </form>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
