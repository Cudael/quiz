import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DuelAnswerReview } from './duel-answer-review'
import type { DuelStatePayload } from '../duel-view.types'

const review: NonNullable<DuelStatePayload['review']> = {
  questions: [
    {
      id: 'question-1',
      type: 'SINGLE',
      prompt: 'Which planet is known as the Red Planet?',
      imageUrl: null,
      choices: [
        { id: 'mars', text: 'Mars', isCorrect: true },
        { id: 'venus', text: 'Venus', isCorrect: false },
      ],
    },
    {
      id: 'question-2',
      type: 'SINGLE',
      prompt: 'Which ocean is the largest?',
      imageUrl: null,
      choices: [
        { id: 'pacific', text: 'Pacific', isCorrect: true },
        { id: 'atlantic', text: 'Atlantic', isCorrect: false },
      ],
    },
  ],
  answers: [{ questionId: 'question-1', choiceIds: ['venus'], timeTakenMs: 1200 }],
}

describe('DuelAnswerReview', () => {
  it('shows the viewer selection, correct answer, and unanswered questions', () => {
    render(<DuelAnswerReview review={review} />)

    expect(screen.getByRole('heading', { name: 'Answer review' })).toBeInTheDocument()
    expect(screen.getAllByText('Incorrect')).toHaveLength(2)
    expect(screen.getAllByText('Correct answer')).toHaveLength(2)
    expect(screen.getByText('Your answer')).toBeInTheDocument()
    expect(screen.getByText("You didn't answer this question.")).toBeInTheDocument()
  })
})
