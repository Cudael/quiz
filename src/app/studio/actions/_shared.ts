import { z } from 'zod'
import { prisma } from '@/server/prisma'

export const quizIdSchema = z.string().cuid()

export type ActionResult =
  | { ok: true }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'EMAIL_NOT_VERIFIED'
      message: string
    }

export async function assertOwnership(quizId: string, userId: string, role?: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, authorId: true },
  })

  if (!quiz) {
    return { ok: false as const, error: 'NOT_FOUND' as const, message: 'Quiz not found.' }
  }

  if (quiz.authorId !== userId && role !== 'ADMIN') {
    return { ok: false as const, error: 'FORBIDDEN' as const, message: 'Not allowed.' }
  }

  return { ok: true as const }
}

export function assertEmailVerified(emailVerified: Date | null | undefined): ActionResult | null {
  if (!emailVerified) {
    return {
      ok: false,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address before creating or editing quizzes.',
    }
  }
  return null
}
