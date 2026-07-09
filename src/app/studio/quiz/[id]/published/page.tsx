import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { PartyPopper, Play, Plus, LayoutDashboard } from 'lucide-react'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Button } from '@/components/ui/button'
import { CopyShareLink } from './_components/copy-share-link'

export const metadata: Metadata = {
  title: 'Quiz Published',
  robots: { index: false },
}

export default async function QuizPublishedPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/studio')
  }

  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      isPublished: true,
      authorId: true,
      category: { select: { name: true } },
      collaborators: { select: { userId: true } },
      _count: { select: { questions: true } },
    },
  })

  if (!quiz) notFound()

  const isOwner = quiz.authorId === session.user.id || session.user.role === 'ADMIN'
  const isCollaborator = quiz.collaborators.some((c) => c.userId === session.user.id)
  if (!isOwner && !isCollaborator) {
    redirect('/studio')
  }

  // Only a meaningful landing spot right after a publish action — an
  // unpublished quiz has nothing to celebrate, send the author back to editing it.
  if (!quiz.isPublished || !quiz.slug) {
    redirect(`/studio/quiz/${quiz.id}/edit`)
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-12">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-quiz-green/10">
          <PartyPopper className="h-7 w-7 text-quiz-green" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Quiz published!</h1>
        <p className="mt-1 text-muted-foreground">
          &ldquo;{quiz.title}&rdquo; is live and ready to play.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4 rounded-md border bg-card p-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
          {quiz.coverImage && (
            <Image src={quiz.coverImage} alt="" fill className="object-cover" sizes="64px" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{quiz.title}</p>
          <p className="text-sm text-muted-foreground">
            {quiz.category?.name ?? 'Uncategorized'} · {quiz._count.questions} question
            {quiz._count.questions === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-md border bg-card p-5 space-y-3">
        <h2 className="font-semibold">Share your quiz</h2>
        <CopyShareLink slug={quiz.slug} />
      </div>

      <div className="mt-6 space-y-2">
        <Button asChild className="w-full">
          <Link href={`/quiz/${quiz.slug}`}>
            <Play className="h-4 w-4" />
            Play it now
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/studio/quiz/new">
            <Plus className="h-4 w-4" />
            Create another quiz
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/studio">
            <LayoutDashboard className="h-4 w-4" />
            Back to Studio
          </Link>
        </Button>
      </div>
    </div>
  )
}
