export interface Choice {
  id: string
  text: string
  imageUrl?: string | null
  meta?: Record<string, unknown> | null
}

/** Server-provided feedback after an answer is locked in — the client never
 *  receives the answer key up front. Mirrors POST /api/play/check. */
export interface AnswerFeedback {
  credit: number
  isCorrect: boolean
  reveal: {
    correctChoiceIds: string[]
    choiceValues: Record<string, string>
    positions: Record<string, number>
    correctPairs: Array<{ leftId: string; rightId: string }>
    groups: Array<{ label: string; choiceIds: string[] }>
    acceptedAnswers: string[]
    numberAnswer: number | null
    correctZoneId: string | null
  }
}

export interface Question {
  id: string
  type: string
  prompt: string
  imageUrl?: string | null
  timeLimitSec: number
  order: number
  choices: Choice[]
  meta?: Record<string, unknown> | null
}

export interface QuizData {
  id: string
  slug: string | null
  title: string
  difficulty: string
  category: { name: string; slug: string }
  timeLimitSec?: number | null
}

export interface PlayViewProps {
  quizId: string
  mode?: 'DAILY' | 'PRACTICE' | 'BLITZ'
}
