import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { QuizCreatorShell } from '@/app/studio/_components/quiz-creator-shell'

export default async function NewQuizPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/studio/quiz/new')
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ parentSlug: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, color: true, parentSlug: true },
  })

  return <QuizCreatorShell mode="new" categories={categories} />
}
