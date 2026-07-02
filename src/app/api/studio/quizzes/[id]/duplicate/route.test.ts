import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, prismaMock, revalidatePathMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    quiz: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

import { POST } from '@/app/api/studio/quizzes/[id]/duplicate/route'

describe('POST /api/studio/quizzes/[id]/duplicate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not signed in', async () => {
    authMock.mockResolvedValue(null)

    const response = await POST(
      new Request('http://localhost/api/studio/quizzes/quiz_1/duplicate'),
      {
        params: Promise.resolve({ id: 'quiz_1' }),
      }
    )

    expect(response.status).toBe(401)
  })

  it('duplicates the quiz with copied questions and reset stats', async () => {
    authMock.mockResolvedValue({ user: { id: 'user_1', role: 'USER' } })
    // Default null so the slug-uniqueness check terminates; the first call
    // (fetching the source quiz) returns the quiz via mockResolvedValueOnce.
    prismaMock.quiz.findUnique.mockResolvedValue(null)
    prismaMock.quiz.findUnique.mockResolvedValueOnce({
      id: 'quiz_1',
      title: 'Science Quiz',
      description: 'A quiz',
      coverImage: 'https://example.com/cover.png',
      tags: '["science"]',
      categoryId: 'cat_1',
      difficulty: 'MEDIUM',
      authorId: 'user_1',
      defaultTimeLimitSec: 25,
      questions: [
        {
          type: 'SINGLE',
          prompt: 'The Sun is a star.',
          imageUrl: null,
          explanation: 'It is a star.',
          timeLimitSec: 25,
          order: 0,
          choices: [
            { text: 'star', isCorrect: true },
            { text: 'planet', isCorrect: false },
          ],
        },
      ],
    })
    prismaMock.quiz.create.mockResolvedValue({ id: 'quiz_copy_1' })

    const response = await POST(
      new Request('http://localhost/api/studio/quizzes/quiz_1/duplicate'),
      {
        params: Promise.resolve({ id: 'quiz_1' }),
      }
    )

    expect(response.status).toBe(201)
    expect(prismaMock.quiz.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Copy of Science Quiz',
        isPublished: false,
        playCount: 0,
        avgScore: 0,
        defaultTimeLimitSec: 25,
        questions: {
          create: [
            expect.objectContaining({
              prompt: 'The Sun is a star.',
              choices: {
                create: [
                  { text: 'star', isCorrect: true },
                  { text: 'planet', isCorrect: false },
                ],
              },
            }),
          ],
        },
      }),
      select: { id: true },
    })
    expect(revalidatePathMock).toHaveBeenCalledWith('/studio')
    expect(revalidatePathMock).toHaveBeenCalledWith('/studio/quiz/quiz_copy_1/edit')
  })
})
