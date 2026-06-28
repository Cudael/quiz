import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveQuestionsForQuiz } from '@/app/studio/_components/quiz-save-utils'
import {
  addQuestion,
  deleteRemovedQuestions,
  updateQuestion,
} from '@/app/studio/actions/question-actions'
import type { DraftQuestion } from '@/store/quiz-creator-store'

vi.mock('@/app/studio/actions/question-actions', () => ({
  addQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  deleteRemovedQuestions: vi.fn(),
}))

function makeQuestion(localId: string, dbId: string | null): DraftQuestion {
  return {
    localId,
    dbId,
    type: 'SINGLE',
    prompt: `Question ${localId}`,
    imageUrl: '',
    explanation: '',
    timeLimitSec: 20,
    choices: [
      { localId: `${localId}-a`, text: 'A', imageUrl: '', isCorrect: true },
      { localId: `${localId}-b`, text: 'B', imageUrl: '', isCorrect: false },
    ],
  }
}

describe('saveQuestionsForQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(addQuestion).mockResolvedValue({ ok: true, questionId: 'new-question-id' })
    vi.mocked(updateQuestion).mockResolvedValue({ ok: true })
    vi.mocked(deleteRemovedQuestions).mockResolvedValue({ ok: true })
  })

  it('does not delete removed questions when a question update fails', async () => {
    vi.mocked(updateQuestion).mockResolvedValueOnce({
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid question input.',
    })

    const result = await saveQuestionsForQuiz({
      quizId: 'quiz-id',
      questions: [makeQuestion('q1', 'question-id')],
      deleteRemovedQuestionsAfterSave: true,
    })

    expect(result.ok).toBe(false)
    expect(result.message).toBe('Invalid question input.')
    expect(deleteRemovedQuestions).not.toHaveBeenCalled()
  })

  it('stores new question ids and deletes removed questions after successful saves', async () => {
    const result = await saveQuestionsForQuiz({
      quizId: 'quiz-id',
      questions: [makeQuestion('q1', null)],
      deleteRemovedQuestionsAfterSave: true,
    })

    expect(result.ok).toBe(true)
    expect(result.questions[0].dbId).toBe('new-question-id')
    expect(deleteRemovedQuestions).toHaveBeenCalledWith('quiz-id', ['new-question-id'])
  })
})
