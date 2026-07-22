import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QuestionCard } from '@/app/studio/_components/question-card'
import { useQuizCreatorStore, type DraftQuestion } from '@/store/quiz-creator-store'

vi.mock('@/app/studio/_components/image-upload', () => ({
  ImageUpload: () => <div data-testid="image-upload" />,
}))

vi.mock('@/app/studio/_components/image-search-dialog', () => ({
  ImageSearchDialog: ({
    defaultQuery,
    onSelect,
  }: {
    defaultQuery: string
    onSelect: (url: string) => void
  }) => (
    <div>
      <span>Search query: {defaultQuery}</span>
      <button type="button" onClick={() => onSelect('https://images.unsplash.com/photo-choice')}>
        Choose Unsplash result
      </button>
    </div>
  ),
}))

const question: DraftQuestion = {
  localId: 'question-1',
  dbId: null,
  type: 'SINGLE',
  prompt: 'Which animal is a fox?',
  imageUrl: '',
  explanation: '',
  timeLimitSec: 20,
  choices: [
    { localId: 'choice-1', text: 'Red fox', imageUrl: '', isCorrect: true },
    { localId: 'choice-2', text: 'Wolf', imageUrl: '', isCorrect: false },
  ],
}

describe('QuestionCard image choices', () => {
  beforeEach(() => {
    useQuizCreatorStore.getState().reset()
    useQuizCreatorStore.getState().setQuizFormat('IMAGE_CHOICE')
  })

  it('selects an Unsplash image for the requested choice', () => {
    const onUpdate = vi.fn()

    render(
      <QuestionCard
        question={question}
        index={0}
        quizId="quiz-1"
        reorderMode={false}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Find Unsplash image for choice 1' }))

    expect(screen.getByText('Search query: Red fox')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Choose Unsplash result' }))

    expect(onUpdate).toHaveBeenCalledWith({
      choices: [
        {
          localId: 'choice-1',
          text: 'Red fox',
          imageUrl: 'https://images.unsplash.com/photo-choice',
          isCorrect: true,
        },
        question.choices[1],
      ],
    })
  })
})
