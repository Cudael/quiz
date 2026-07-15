import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteQuiz, toggleQuizPublished } from '@/app/admin/quizzes/actions'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

type QuizTransactionMock = {
  quiz: {
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  adminAction: {
    create: ReturnType<typeof vi.fn>
  }
}

const { authMock, prismaMock, txMock } = vi.hoisted(() => {
  const tx: QuizTransactionMock = {
    quiz: {
      update: vi.fn(),
      delete: vi.fn(),
    },
    adminAction: {
      create: vi.fn(),
    },
  }

  return {
    authMock: vi.fn(),
    txMock: tx,
    prismaMock: {
      quiz: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (transaction: QuizTransactionMock) => Promise<void>) =>
        callback(tx)
      ),
    },
  }
})

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

describe('admin quizzes actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates publish state and logs the correct action', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin_1', role: 'ADMIN' } })
    prismaMock.quiz.findUnique.mockResolvedValue({
      id: 'c123456789012345678901234',
      description: 'A detailed quiz description that is ready for publication.',
      questions: Array.from({ length: 5 }, () => ({
        explanation: 'A useful explanation of why this answer is correct.',
      })),
    })

    const formData = new FormData()
    formData.set('quizId', 'c123456789012345678901234')
    formData.set('publish', 'true')

    const result = await toggleQuizPublished(formData)

    expect(result).toEqual({ ok: true })
    expect(txMock.quiz.update).toHaveBeenCalledWith({
      where: { id: 'c123456789012345678901234' },
      data: {
        isPublished: true,
        reviewStatus: 'APPROVED',
        reviewedAt: expect.any(Date),
      },
    })
    expect(txMock.adminAction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'QUIZ_PUBLISH' }),
      })
    )
  })

  it('deletes quizzes through the admin action', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin_1', role: 'ADMIN' } })
    prismaMock.quiz.findUnique.mockResolvedValue({
      id: 'c123456789012345678901234',
    })

    const formData = new FormData()
    formData.set('quizId', 'c123456789012345678901234')

    const result = await deleteQuiz(formData)

    expect(result).toEqual({ ok: true })
    expect(txMock.quiz.delete).toHaveBeenCalledWith({
      where: { id: 'c123456789012345678901234' },
    })
    expect(txMock.adminAction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'QUIZ_DELETE' }),
      })
    )
  })
})
