import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ categorySlug: string }> }
) {
  const { categorySlug } = await params
  const seenParam = req.nextUrl.searchParams.get('seen') ?? ''
  const seen = seenParam ? seenParam.split(',').filter(Boolean) : []

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  // Fetch a random question from the category not already seen
  const questions = await prisma.question.findMany({
    where: {
      quiz: { categoryId: category.id },
      id: { notIn: seen.length > 0 ? seen : undefined },
    },
    include: {
      choices: { select: { id: true, text: true } },
    },
  })

  if (questions.length === 0) {
    return NextResponse.json({ done: true })
  }

  // Pick a random one
  const question = questions[Math.floor(Math.random() * questions.length)]

  return NextResponse.json({
    question: {
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      timeLimitSec: question.timeLimitSec,
      choices: question.choices,
    },
  })
}
