import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function RandomQuizPage() {
  const count = await prisma.quiz.count({ where: { isPublished: true } })

  if (count === 0) {
    redirect('/categories')
  }

  const offset = Math.floor(Math.random() * count)
  const quiz = await prisma.quiz.findFirst({
    where: { isPublished: true },
    select: { id: true },
    skip: offset,
    take: 1,
    orderBy: { createdAt: 'asc' },
  })

  redirect(quiz ? `/quiz/${quiz.id}` : '/categories')
}
