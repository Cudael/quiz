export interface Choice {
  id: string
  text: string
  meta?: Record<string, unknown> | null
}

export interface Question {
  id: string
  type: string
  prompt: string
  imageUrl?: string | null
  timeLimitSec: number
  order: number
  choices: Choice[]
}

export interface QuizData {
  id: string
  title: string
  difficulty: string
  category: { name: string; slug: string }
}

export interface PlayViewProps {
  quizId: string
}
