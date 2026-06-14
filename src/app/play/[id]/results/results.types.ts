export interface ResultChoice {
  id: string
  text: string
  imageUrl?: string | null
  isCorrect: boolean
  meta?: unknown
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
