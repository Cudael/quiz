import 'server-only'

import { prisma } from '@/server/prisma'

/** UTC date key in YYYY-MM-DD form. */
export function getDailyKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/**
 * Deterministic 32-bit hash (FNV-1a) — stable quiz pick for a given date even
 * if two instances race; the unique constraint on `date` settles the winner.
 */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export interface DailyQuizPick {
  date: string
  quiz: {
    id: string
    slug: string | null
    title: string
    description: string | null
    coverImage: string | null
    difficulty: string
    category: { name: string; slug: string; color: string }
    questionCount: number
  }
}

/**
 * Returns today's daily quiz, creating the pick on first access.
 * Picks deterministically from published quizzes with at least 5 questions,
 * avoiding quizzes featured in the last 30 days when possible.
 */
export async function getDailyQuiz(now: Date = new Date()): Promise<DailyQuizPick | null> {
  const date = getDailyKey(now)

  const existing = await prisma.dailyQuiz.findUnique({
    where: { date },
    select: { quizId: true },
  })

  let quizId = existing?.quizId ?? null

  if (!quizId) {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const [recentPicks, candidates] = await Promise.all([
      prisma.dailyQuiz.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { quizId: true },
      }),
      prisma.quiz.findMany({
        where: { isPublished: true },
        select: { id: true, _count: { select: { questions: true } } },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    const recentIds = new Set(recentPicks.map((p) => p.quizId))
    const eligible = candidates.filter((q) => q._count.questions >= 5)
    const pool = eligible.filter((q) => !recentIds.has(q.id))
    const finalPool = pool.length > 0 ? pool : eligible
    if (finalPool.length === 0) return null

    quizId = finalPool[fnv1a(date) % finalPool.length].id

    try {
      await prisma.dailyQuiz.create({ data: { date, quizId } })
    } catch {
      // Unique constraint race — another instance created today's pick first.
      const winner = await prisma.dailyQuiz.findUnique({
        where: { date },
        select: { quizId: true },
      })
      if (winner) quizId = winner.quizId
    }
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      difficulty: true,
      category: { select: { name: true, slug: true, color: true } },
      _count: { select: { questions: true } },
    },
  })
  if (!quiz) return null

  return {
    date,
    quiz: {
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      coverImage: quiz.coverImage,
      difficulty: quiz.difficulty,
      category: quiz.category,
      questionCount: quiz._count.questions,
    },
  }
}
