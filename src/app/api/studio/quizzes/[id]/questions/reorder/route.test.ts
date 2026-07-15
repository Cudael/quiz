import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, prismaMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    quiz: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    question: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

import { PATCH } from '@/app/api/studio/quizzes/[id]/questions/reorder/route'

function createRequest(body: unknown) {
  return new Request('http://localhost/api/studio/quizzes/quiz_1/questions/reorder', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/studio/quizzes/[id]/questions/reorder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)

    const response = await PATCH(createRequest({ questions: [] }), {
      params: Promise.resolve({ id: 'quiz_1' }),
    })

    expect(response.status).toBe(401)
  })

  it('updates orders for quiz questions', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1', role: 'USER' } })
    prismaMock.quiz.findUnique.mockResolvedValue({ id: 'quiz_1', authorId: 'user_1' })
    prismaMock.question.findMany.mockResolvedValue([
      { id: 'ckq6xdr2w0000u3z5f6l6x4t5' },
      { id: 'ckq6xdr2w0000u3z5f6l6x4t6' },
    ])
    prismaMock.question.update
      .mockResolvedValueOnce({ id: 'ckq6xdr2w0000u3z5f6l6x4t5' })
      .mockResolvedValueOnce({ id: 'ckq6xdr2w0000u3z5f6l6x4t6' })
    prismaMock.quiz.update.mockResolvedValue({ id: 'quiz_1' })
    prismaMock.$transaction.mockImplementation(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations)
    )

    const response = await PATCH(
      createRequest({
        questions: [
          { id: 'ckq6xdr2w0000u3z5f6l6x4t5', order: 1 },
          { id: 'ckq6xdr2w0000u3z5f6l6x4t6', order: 0 },
        ],
      }),
      {
        params: Promise.resolve({ id: 'quiz_1' }),
      }
    )

    expect(response.status).toBe(200)
    expect(prismaMock.quiz.update).toHaveBeenCalledWith({
      where: { id: 'quiz_1' },
      data: {
        isPublished: false,
        reviewStatus: 'DRAFT',
        submittedForReviewAt: null,
        reviewedAt: null,
      },
    })
    expect(prismaMock.question.update).toHaveBeenCalledTimes(2)
    expect(revalidatePathMock).toHaveBeenCalledWith('/studio')
    expect(revalidatePathMock).toHaveBeenCalledWith('/studio/quiz/quiz_1/edit')
  })
})
