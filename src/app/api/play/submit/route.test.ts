import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  authMock,
  verifyPlayTokenMock,
  evaluateBadgesWithClientMock,
  cookieStoreMock,
  prismaMock,
  txMock,
} = vi.hoisted(() => {
  const txMock = {
    playSession: {
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    questionAnswer: {
      createMany: vi.fn(),
    },
    quiz: {
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  }

  return {
    authMock: vi.fn(),
    verifyPlayTokenMock: vi.fn(),
    evaluateBadgesWithClientMock: vi.fn(),
    cookieStoreMock: {
      get: vi.fn(),
    },
    prismaMock: {
      quiz: {
        findUnique: vi.fn(),
      },
      playSession: {
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (tx: typeof txMock) => Promise<unknown>) =>
        callback(txMock)
      ),
    },
    txMock,
  }
})

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/play-token', () => ({ verifyPlayToken: verifyPlayTokenMock }))
vi.mock('@/domain/badges', () => ({ evaluateBadgesWithClient: evaluateBadgesWithClientMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue(cookieStoreMock) }))

import { POST } from '@/app/api/play/submit/route'

function createRequest(body: unknown): Parameters<typeof POST>[0] {
  return new Request('http://localhost/api/play/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as Parameters<typeof POST>[0]
}

describe('POST /api/play/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(null)
    verifyPlayTokenMock.mockResolvedValue({ valid: true })
    evaluateBadgesWithClientMock.mockResolvedValue([])
    cookieStoreMock.get.mockReturnValue(undefined)
    txMock.playSession.create.mockResolvedValue({ id: 'session-1' })
    txMock.questionAnswer.createMany.mockResolvedValue({})
    txMock.playSession.aggregate.mockResolvedValue({ _avg: { score: 120 }, _count: { _all: 1 } })
    txMock.quiz.update.mockResolvedValue({})
  })

  it('persists per-question answers using sanitized choice ids for the results page', async () => {
    prismaMock.quiz.findUnique.mockResolvedValue({
      id: 'quiz-1',
      questions: [
        {
          id: 'question-1',
          type: 'SINGLE',
          timeLimitSec: 20,
          choices: [
            { id: 'choice-1', text: 'Mercury', isCorrect: true },
            { id: 'choice-2', text: 'Venus', isCorrect: false },
          ],
        },
      ],
    })

    const response = await POST(
      createRequest({
        playToken: 'token',
        quizId: 'quiz-1',
        mode: 'classic',
        answers: [
          {
            questionId: 'question-1',
            choiceIds: ['bogus-choice', 'choice-1', 'choice-1'],
            timeTakenMs: 2500,
          },
        ],
      })
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        sessionId: 'session-1',
        correctCount: 1,
        totalCount: 1,
      })
    )

    expect(txMock.questionAnswer.createMany).toHaveBeenCalledWith({
      data: [
        {
          sessionId: 'session-1',
          questionId: 'question-1',
          chosenIds: JSON.stringify(['choice-1']),
          isCorrect: true,
          timeTakenMs: 2500,
        },
      ],
    })
  })
})
