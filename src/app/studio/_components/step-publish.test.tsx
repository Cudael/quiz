import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StepPublish } from '@/app/studio/_components/step-publish'
import { updateQuiz } from '@/app/studio/actions'
import { createQuizAndReturnId } from '@/app/studio/actions/quiz-meta-actions'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'

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
}))

vi.mock('@/app/studio/actions/quiz-meta-actions', () => ({
  createQuizAndReturnId: vi.fn(),
}))

vi.mock('./image-upload', () => ({
  ImageUpload: ({ label }: { label: string }) => <div>{label}</div>,
}))

const baseQuestion = {
  localId: 'q1',
  dbId: null,
  type: 'SINGLE' as const,
  prompt: 'Question',
  imageUrl: '',
  explanation: '',
  timeLimitSec: 20,
  choices: [
    { localId: 'c1', text: 'A', isCorrect: true },
    { localId: 'c2', text: 'B', isCorrect: false },
  ],
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
      quizFormat: 'CLASSIC',
      defaultTimeLimitSec: null,
      questions: [baseQuestion, baseQuestion, baseQuestion, baseQuestion, baseQuestion],
    })
    vi.mocked(updateQuiz).mockResolvedValue({ ok: true })
    vi.mocked(createQuizAndReturnId).mockResolvedValue({
      ok: true,
      quizId: 'ck22345678901234567890123',
    })
  })

  it('includes category and cover image requirements in checklist', () => {
    render(<StepPublish quizId="ck32345678901234567890123" />)

    expect(screen.getByText('Category is selected')).toBeInTheDocument()
    expect(screen.getByText('Cover image is set')).toBeInTheDocument()
    expect(screen.getByText('Cover image URL is valid')).toBeInTheDocument()
  })

  it('disables publish when category or cover image validation is not met', () => {
    useQuizCreatorStore.setState({
      categoryId: '',
      imageUrl: 'not-a-url',
    })

    render(<StepPublish quizId="ck42345678901234567890123" />)

    expect(screen.getByRole('button', { name: 'Publish quiz' })).toBeDisabled()
  })

  it('shows a toast if publish update returns a validation error', async () => {
    vi.mocked(updateQuiz).mockResolvedValue({
      ok: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid quiz input.',
    })

    render(<StepPublish quizId="ck52345678901234567890123" />)

    fireEvent.click(screen.getByRole('button', { name: 'Publish quiz' }))

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith('Invalid quiz input.', 'error')
    })
  })
})
