import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StepPublish } from '@/app/studio/_components/step-publish'
import { submitQuizForReview, updateQuiz } from '@/app/studio/actions'
import { createQuizAndReturnId } from '@/app/studio/actions/quiz-meta-actions'
import {
  addQuestion,
  deleteRemovedQuestions,
  updateQuestion,
} from '@/app/studio/actions/question-actions'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { DraftQuestion } from '@/store/quiz-creator-store'

const addToast = vi.fn()
const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ addToast }),
}))

vi.mock('@/app/studio/actions', () => ({
  updateQuiz: vi.fn(),
  submitQuizForReview: vi.fn(),
}))

vi.mock('@/app/studio/actions/quiz-meta-actions', () => ({
  createQuizAndReturnId: vi.fn(),
}))

vi.mock('@/app/studio/actions/question-actions', () => ({
  addQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  deleteRemovedQuestions: vi.fn(),
}))

vi.mock('./image-upload', () => ({
  ImageUpload: ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
  }) => (
    <label>
      {label}
      <input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  ),
}))

function makeQuestion(index: number, overrides: Partial<DraftQuestion> = {}): DraftQuestion {
  return {
    localId: `q${index}`,
    dbId: `dbq${index}234567890123456789012`,
    type: 'SINGLE' as const,
    prompt: `Question ${index}`,
    imageUrl: '',
    explanation: '',
    timeLimitSec: 20,
    choices: [
      { localId: `c${index}-1`, text: 'A', imageUrl: '', isCorrect: true },
      { localId: `c${index}-2`, text: 'B', imageUrl: '', isCorrect: false },
    ],
    ...overrides,
  }
}

function makeQuestions(overrides: Partial<DraftQuestion> = {}) {
  return Array.from({ length: 5 }, (_, index) => makeQuestion(index + 1, overrides))
}

describe('StepPublish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useQuizCreatorStore.getState().reset()
    useQuizCreatorStore.setState({
      title: 'Quiz title',
      description: 'Quiz description',
      categoryId: 'ck12345678901234567890123',
      difficulty: 'MEDIUM',
      imageUrl: 'https://example.com/cover.jpg',
      isPublished: false,
      quizFormat: 'TEXT_CHOICE',
      defaultTimeLimitSec: null,
      questions: makeQuestions(),
    })
    vi.mocked(updateQuiz).mockResolvedValue({ ok: true })
    vi.mocked(submitQuizForReview).mockResolvedValue({ ok: true })
    vi.mocked(createQuizAndReturnId).mockResolvedValue({
      ok: true,
      quizId: 'ck22345678901234567890123',
      quizSlug: 'test-quiz-slug',
    })
    vi.mocked(addQuestion).mockResolvedValue({ ok: true, questionId: 'new-question-id' })
    vi.mocked(updateQuestion).mockResolvedValue({ ok: true })
    vi.mocked(deleteRemovedQuestions).mockResolvedValue({ ok: true })
  })

  it('includes category and cover image requirements in checklist', () => {
    render(<StepPublish quizId="ck32345678901234567890123" />)

    expect(screen.getByText('Category is selected')).toBeInTheDocument()
    expect(screen.getByText('Cover image is set')).toBeInTheDocument()
  })

  it('disables review submission when category is not selected', () => {
    useQuizCreatorStore.setState({
      categoryId: '',
      imageUrl: 'not-a-url',
    })

    render(<StepPublish quizId="ck42345678901234567890123" />)

    expect(screen.getByRole('button', { name: 'Submit for admin review' })).toBeDisabled()
  })

  it('shows a toast if the review update returns a validation error', async () => {
    vi.mocked(updateQuiz).mockResolvedValue({
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid quiz input.',
    })

    render(<StepPublish quizId="ck52345678901234567890123" />)

    fireEvent.click(screen.getByRole('button', { name: 'Submit for admin review' }))

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith('Invalid quiz input.', 'error')
    })
  })

  it('passes the current format when submitting an existing quiz', async () => {
    useQuizCreatorStore.setState({
      quizFormat: 'IMAGE_CHOICE',
      questions: makeQuestions({
        choices: [
          {
            localId: 'image-a',
            text: '',
            imageUrl: 'https://example.com/a.jpg',
            isCorrect: true,
          },
          {
            localId: 'image-b',
            text: '',
            imageUrl: 'https://example.com/b.jpg',
            isCorrect: false,
          },
        ],
      }),
    })

    render(<StepPublish quizId="ck62345678901234567890123" />)

    fireEvent.click(screen.getByRole('button', { name: 'Submit for admin review' }))

    await waitFor(() => {
      expect(updateQuiz).toHaveBeenCalled()
    })

    const formData = vi.mocked(updateQuiz).mock.calls[0][0] as FormData
    expect(formData.get('format')).toBe('IMAGE_CHOICE')
  })

  it('stores dbIds returned for new questions during review submission', async () => {
    vi.mocked(addQuestion).mockImplementation(async () => ({
      ok: true,
      questionId: `new-question-${vi.mocked(addQuestion).mock.calls.length}`,
    }))
    useQuizCreatorStore.setState({ questions: makeQuestions({ dbId: null }) })

    render(<StepPublish quizId="ck72345678901234567890123" />)

    fireEvent.click(screen.getByRole('button', { name: 'Submit for admin review' }))

    await waitFor(() => {
      expect(useQuizCreatorStore.getState().questions[0].dbId).toBe('new-question-1')
    })
  })
})
