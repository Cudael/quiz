import { notFound, redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { QuizCreatorShell } from '@/app/studio/_components/quiz-creator-shell'

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
      title: true,
      description: true,
      coverImage: true,
      categoryId: true,
      difficulty: true,
      defaultTimeLimitSec: true,
      isPublished: true,
      authorId: true,
      questions: {
        orderBy: { order: 'asc' },
        include: { choices: true },
      },
    },
  })

  if (!quiz) {
    notFound()
  }

  if (quiz.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/studio')
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, color: true },
  })

  return (
    <QuizCreatorShell
      mode="edit"
      quizId={quiz.id}
      initialData={{ quiz, questions: quiz.questions }}
      categories={categories}
    />
  )
}
