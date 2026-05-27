import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { createDuelSchema } from '@/schemas'
import { generateDuelCode } from '@/server/duel'
import { prisma } from '@/server/prisma'

const MAX_CODE_GENERATION_ATTEMPTS = 12

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createDuelSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (parsed.data.categoryId) {
    const categoryExists = await prisma.category.count({ where: { id: parsed.data.categoryId } })
    if (categoryExists === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
  }

  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const code = generateDuelCode()
    try {
      const duel = await prisma.duel.create({
        data: {
          code,
          hostId: session.user.id,
          categoryId: parsed.data.categoryId ?? null,
          questionCount: parsed.data.questionCount ?? 10,
          timeLimitSec: parsed.data.timeLimitSec ?? 20,
          participants: {
            create: {
              userId: session.user.id,
              guestName: null,
              guestKey: null,
            },
          },
        },
        select: { id: true, code: true },
      })

      return NextResponse.json({ duelId: duel.id, code: duel.code }, { status: 201 })
    } catch (error) {
      const isCodeCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        ((Array.isArray(error.meta?.target) && error.meta.target.includes('code')) ||
          error.meta?.target === 'code')

      if (!isCodeCollision) {
        throw error
      }
    }
  }

  return NextResponse.json({ error: 'Could not generate duel code' }, { status: 503 })
}
