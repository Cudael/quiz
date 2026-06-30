export interface QuizUrlInput {
  slug: string
}

export function getQuizPath(quiz: QuizUrlInput) {
  return `/quiz/${quiz.slug}`
}
