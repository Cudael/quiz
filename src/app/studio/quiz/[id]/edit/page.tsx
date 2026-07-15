import { notFound, redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { QuizCreatorShell } from '@/app/studio/_components/quiz-creator-shell'
import { CollaboratorManager } from '@/app/studio/_components/collaborator-manager'
import { AiQuestionGenerator } from '@/app/studio/_components/ai-question-generator'

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      categoryId: true,
      difficulty: true,
      format: true,
      defaultTimeLimitSec: true,
      isPublished: true,
      reviewStatus: true,
      authorId: true,
      collaborators: {
        select: {
          userId: true,
          user: { select: { id: true, username: true, image: true } },
        },
      },
      questions: {
        orderBy: { order: 'asc' },
        include: { choices: true },
      },
    },
  })

  if (!quiz) {
    notFound()
  }

  const isCollaborator = quiz.collaborators.some((c) => c.userId === session.user.id)
  const isOwner = quiz.authorId === session.user.id || session.user.role === 'ADMIN'
  if (!isOwner && !isCollaborator) {
    redirect('/studio')
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ parentSlug: 'asc' }, { name: 'asc' }],
    select: { id: true, slug: true, name: true, color: true, icon: true, parentSlug: true },
  })

  return (
    <>
      <QuizCreatorShell
        mode="edit"
        quizId={quiz.id}
        initialData={{
          quiz,
          questions: quiz.questions.map((q) => ({
            ...q,
            meta: q.meta as Record<string, unknown> | null,
            choices: q.choices.map((c) => ({
              ...c,
              meta: c.meta as Record<string, unknown> | null,
            })),
          })),
        }}
        categories={categories}
      />
      <div className="container mx-auto max-w-4xl space-y-4 px-4 pb-4">
        <AiQuestionGenerator quizId={quiz.id} />
      </div>
      <CollaboratorManager
        quizId={quiz.id}
        collaborators={quiz.collaborators}
        isOwner={isOwner}
        viewerId={session.user.id}
      />
      <div className="container mx-auto max-w-4xl px-4 pb-10 -mt-6">
        <a
          href={`/studio/quiz/${quiz.id}/revisions`}
          className="text-sm font-medium text-muted-foreground underline hover:text-foreground"
        >
          View version history →
        </a>
      </div>
    </>
  )
}
