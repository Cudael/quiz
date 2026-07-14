'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { commentSchema, commentReportSchema } from '@/schemas'
import { checkRateLimit } from '@/server/rate-limit'

export type CommentResult =
  | { ok: true }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'RATE_LIMIT' | 'FORBIDDEN'
      message: string
    }

export async function addComment(formData: FormData): Promise<CommentResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in to comment.' }
  }

  const parsed = commentSchema.safeParse({
    quizId: formData.get('quizId'),
    body: formData.get('body'),
    parentId: formData.get('parentId') || undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Comments must be 1–1000 characters.' }
  }

  const allowed = await checkRateLimit(`comment:${session.user.id}`, {
    limit: 5,
    windowMs: 60_000,
  })
  if (!allowed) {
    return {
      ok: false,
      error: 'RATE_LIMIT',
      message: 'You are commenting too fast. Try again in a minute.',
    }
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: parsed.data.quizId, isPublished: true },
    select: { id: true, slug: true, title: true, authorId: true },
  })
  if (!quiz) {
    return { ok: false, error: 'NOT_FOUND', message: 'Quiz not found.' }
  }

  let parentAuthorId: string | null = null
  if (parsed.data.parentId) {
    const parent = await prisma.quizComment.findUnique({
      where: { id: parsed.data.parentId },
      select: { quizId: true, parentId: true, authorId: true, isHidden: true },
    })
    if (!parent || parent.quizId !== quiz.id || parent.isHidden) {
      return { ok: false, error: 'NOT_FOUND', message: 'Comment not found.' }
    }
    if (parent.parentId) {
      return {
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'Replies can only go one level deep.',
      }
    }
    parentAuthorId = parent.authorId
  }

  const comment = await prisma.quizComment.create({
    data: {
      quizId: quiz.id,
      authorId: session.user.id,
      parentId: parsed.data.parentId ?? null,
      body: parsed.data.body,
    },
    select: { id: true },
  })

  // Notify the quiz author and, on replies, the parent comment author (skipping self).
  const recipients = new Set<string>()
  if (quiz.authorId && quiz.authorId !== session.user.id) recipients.add(quiz.authorId)
  if (parentAuthorId && parentAuthorId !== session.user.id) recipients.add(parentAuthorId)
  if (recipients.size > 0) {
    await prisma.notification.createMany({
      data: [...recipients].map((userId) => ({
        userId,
        type: 'QUIZ_COMMENT' as const,
        title:
          parentAuthorId && userId === parentAuthorId
            ? 'New reply to your comment'
            : 'New comment on your quiz',
        message: `${session.user.username ?? 'Someone'} commented on “${quiz.title}”.`,
        meta: { quizId: quiz.id, quizSlug: quiz.slug, commentId: comment.id },
      })),
    })
  }

  revalidatePath(`/quiz/${quiz.slug ?? quiz.id}`)
  return { ok: true }
}

export async function deleteComment(formData: FormData): Promise<CommentResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const commentId = formData.get('commentId')
  if (typeof commentId !== 'string' || !commentId) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid comment.' }
  }

  const comment = await prisma.quizComment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
      quiz: { select: { id: true, slug: true, authorId: true } },
    },
  })
  if (!comment) {
    return { ok: false, error: 'NOT_FOUND', message: 'Comment not found.' }
  }

  const isOwn = comment.authorId === session.user.id
  const isQuizAuthor = comment.quiz.authorId === session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  if (!isOwn && !isQuizAuthor && !isAdmin) {
    return { ok: false, error: 'FORBIDDEN', message: 'You cannot delete this comment.' }
  }

  await prisma.quizComment.delete({ where: { id: comment.id } })

  revalidatePath(`/quiz/${comment.quiz.slug ?? comment.quiz.id}`)
  return { ok: true }
}

export async function reportComment(formData: FormData): Promise<CommentResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in to report a comment.' }
  }

  const parsed = commentReportSchema.safeParse({
    commentId: formData.get('commentId'),
    reason: formData.get('reason'),
    details: formData.get('details') || undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid report payload.' }
  }

  const comment = await prisma.quizComment.findUnique({
    where: { id: parsed.data.commentId },
    select: { id: true, quizId: true },
  })
  if (!comment) {
    return { ok: false, error: 'NOT_FOUND', message: 'Comment not found.' }
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const existing = await prisma.report.findFirst({
    where: {
      commentId: comment.id,
      reporterId: session.user.id,
      createdAt: { gte: dayAgo },
    },
    select: { id: true },
  })
  if (existing) {
    return {
      ok: false,
      error: 'RATE_LIMIT',
      message: 'You already reported this comment recently.',
    }
  }

  await prisma.report.create({
    data: {
      quizId: comment.quizId,
      commentId: comment.id,
      reporterId: session.user.id,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  })

  return { ok: true }
}
