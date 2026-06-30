export interface QuizUrlInput {
  id?: string
  slug: string | null
}

export function getQuizPath(quiz: QuizUrlInput) {
  return `/quiz/${quiz.slug ?? quiz.id ?? 'unknown'}`
}
