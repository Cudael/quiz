export interface ResultChoice {
  id: string
  text: string
  isCorrect: boolean
  meta?: Record<string, unknown> | null
}

export interface ResultQuestion {
  id: string
  type: string
  prompt: string
  explanation: string | null
  choices: ResultChoice[]
}

export interface ResultAnswer {
  questionId: string
  chosenIds: string[]
  isCorrect: boolean
}
