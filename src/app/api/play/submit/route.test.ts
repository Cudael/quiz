import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  authMock,
  verifyPlayTokenMock,
  evaluateBadgesWithClientMock,
  cookieStoreMock,
  prismaMock,
  txMock,
  checkRateLimitMock,
  getClientIpMock,
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
    checkRateLimitMock: vi.fn().mockReturnValue(true),
    getClientIpMock: vi.fn().mockReturnValue('1.2.3.4'),
  }
})

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/play-token', () => ({ verifyPlayToken: verifyPlayTokenMock }))
vi.mock('@/domain/badges', () => ({ evaluateBadgesWithClient: evaluateBadgesWithClientMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/server/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: getClientIpMock,
}))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue(cookieStoreMock) }))
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  // unstable_cache is used by home-quiz-cache.ts which is transitively imported.
  // We bypass the cache layer here since these tests verify submit route logic,
  // not caching behaviour. The wrapped function is called directly.
  unstable_cache: vi.fn((fn: () => unknown) => fn),
}))

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
    checkRateLimitMock.mockReturnValue(true)
    getClientIpMock.mockReturnValue('1.2.3.4')
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

  it('rejects a request with missing required fields', async () => {
    const response = await POST(createRequest({ quizId: 'quiz-1' }))
    expect(response.status).toBe(400)
  })

  it('deduplicates repeated submissions for the same question', async () => {
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
          { questionId: 'question-1', choiceIds: ['choice-1'], timeTakenMs: 2500 },
          { questionId: 'question-1', choiceIds: ['choice-2'], timeTakenMs: 1000 },
        ],
      })
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    // Only the first submission should count
    expect(data.correctCount).toBe(1)
    expect(txMock.questionAnswer.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ questionId: 'question-1', isCorrect: true })],
    })
  })

  it('clamps negative timeTakenMs to 0', async () => {
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
        answers: [{ questionId: 'question-1', choiceIds: ['choice-1'], timeTakenMs: -5000 }],
      })
    )

    expect(response.status).toBe(200)
    expect(txMock.questionAnswer.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ questionId: 'question-1', timeTakenMs: 0 })],
    })
  })

  it('returns 429 when the IP submit rate limit is exceeded', async () => {
    checkRateLimitMock.mockReturnValue(false)

    const response = await POST(
      createRequest({
        playToken: 'token',
        quizId: 'quiz-1',
        mode: 'classic',
        answers: [],
      })
    )

    expect(response.status).toBe(429)
    expect(prismaMock.quiz.findUnique).not.toHaveBeenCalled()
  })
})
