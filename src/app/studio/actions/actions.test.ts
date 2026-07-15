import { beforeEach, describe, expect, it, vi } from 'vitest'
import { submitQuizForReview } from '@/app/studio/actions'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

vi.mock('@/app/studio/actions/revision-actions', () => ({
  saveRevision: vi.fn().mockResolvedValue({ ok: true }),
}))

const { authMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    quiz: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/server/auth', () => ({
  auth: authMock,
}))

vi.mock('@/server/prisma', () => ({
  prisma: prismaMock,
}))

describe('studio actions auth checks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.quiz.findUnique.mockReset()
  })

  it('rejects a non-owner publication submission', async () => {
    authMock.mockResolvedValue({
      user: { id: 'user_a', role: 'USER' },
    })
    prismaMock.quiz.findUnique
      .mockResolvedValueOnce({ id: 'quiz_1', authorId: 'user_b', collaborators: [] })
      .mockResolvedValueOnce({ isPublished: false })

    const formData = new FormData()
    formData.set('quizId', 'c123456789012345678901234')
    const result = await submitQuizForReview(formData)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('FORBIDDEN')
    }
    expect(prismaMock.quiz.update).not.toHaveBeenCalled()
  })

  it('submits an owner quiz for admin review without publishing it', async () => {
    authMock.mockResolvedValue({
      user: { id: 'user_a', role: 'USER' },
    })
    prismaMock.quiz.findUnique
      .mockResolvedValueOnce({ id: 'quiz_1', authorId: 'user_a' })
      .mockResolvedValueOnce({
        isPublished: false,
        reviewStatus: 'DRAFT',
        description: 'A detailed quiz description that is ready for publication.',
        questions: Array.from({ length: 5 }, () => ({
          explanation: 'A useful explanation of why this answer is correct.',
        })),
      })

    const formData = new FormData()
    formData.set('quizId', 'c123456789012345678901234')
    const result = await submitQuizForReview(formData)

    expect(result).toEqual({ ok: true })
    expect(prismaMock.quiz.update).toHaveBeenCalledWith({
      where: { id: 'c123456789012345678901234' },
      data: {
        isPublished: false,
        reviewStatus: 'PENDING',
        submittedForReviewAt: expect.any(Date),
        reviewedAt: null,
      },
    })
  })
})
