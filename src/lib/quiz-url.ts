import { slugify } from '@/lib/slugify'

export interface QuizUrlInput {
  id: string
  title: string
}

export function getQuizPath(quiz: QuizUrlInput) {
  const slug = slugify(quiz.title) || 'quiz'
  return `/quiz/${slug}-${quiz.id}`
}

export function getQuizIdFromParam(value: string) {
  const trimmed = value.trim()
  const separatorIndex = trimmed.lastIndexOf('-')
  return separatorIndex === -1 ? trimmed : trimmed.slice(separatorIndex + 1)
}
