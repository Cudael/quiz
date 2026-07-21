import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reportQuiz } from './actions'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const { authMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    question: { findFirst: vi.fn() },
    report: { findFirst: vi.fn(), create: vi.fn() },
  },
}))

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

const quizId = 'ckq6xdr2w0000u3z5f6l6x4t5'
const questionId = 'ckq6xdr2w0001u3z5f6l6x4t6'

function questionReportForm() {
  const formData = new FormData()
  formData.set('quizId', quizId)
  formData.set('questionId', questionId)
  formData.set('reason', 'INCORRECT_ANSWERS')
  formData.set('details', 'The accepted answer should be Riga.')
  return formData
}

describe('reportQuiz question reports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ user: { id: 'user_1' } })
    prismaMock.question.findFirst.mockResolvedValue({ id: questionId })
    prismaMock.report.findFirst.mockResolvedValue(null)
    prismaMock.report.create.mockResolvedValue({ id: 'report_1' })
  })

  it('records the exact question being reported', async () => {
    await expect(reportQuiz(questionReportForm())).resolves.toEqual({ ok: true })

    expect(prismaMock.question.findFirst).toHaveBeenCalledWith({
      where: { id: questionId, quizId },
      select: { id: true },
    })
    expect(prismaMock.report.create).toHaveBeenCalledWith({
      data: {
        quizId,
        questionId,
        reporterId: 'user_1',
        reason: 'INCORRECT_ANSWERS',
        details: 'The accepted answer should be Riga.',
      },
    })
  })

  it('rejects a question that does not belong to the quiz', async () => {
    prismaMock.question.findFirst.mockResolvedValue(null)

    await expect(reportQuiz(questionReportForm())).resolves.toEqual({
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'That question does not belong to this quiz.',
    })
    expect(prismaMock.report.create).not.toHaveBeenCalled()
  })

  it('rate limits repeated reports for the same question', async () => {
    prismaMock.report.findFirst.mockResolvedValue({ id: 'existing_report' })

    await expect(reportQuiz(questionReportForm())).resolves.toEqual({
      ok: false,
      error: 'RATE_LIMIT',
      message: 'You already reported this question recently.',
    })
    expect(prismaMock.report.findFirst).toHaveBeenCalledWith({
      where: {
        quizId,
        questionId,
        reporterId: 'user_1',
        createdAt: { gte: expect.any(Date) },
      },
      select: { id: true },
    })
    expect(prismaMock.report.create).not.toHaveBeenCalled()
  })
})
