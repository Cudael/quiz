import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getQuizPath } from '@/lib/quiz-url'
import { prisma } from '@/server/prisma'

export const metadata: Metadata = {
  robots: { index: false },
}

export default async function RandomQuizPage() {
  const count = await prisma.quiz.count({ where: { isPublished: true } })

  if (count === 0) {
    redirect('/categories')
  }

  const offset = Math.floor(Math.random() * count)
  const quiz = await prisma.quiz.findFirst({
    where: { isPublished: true },
    select: { id: true, title: true },
    skip: offset,
    take: 1,
    orderBy: { createdAt: 'asc' },
  })

  redirect(quiz ? getQuizPath(quiz) : '/categories')
}
