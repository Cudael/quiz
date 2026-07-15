// Root metadata appends " | BusQuiz" (10 characters), keeping the rendered
// title close to the commonly useful 50–60 character range.
const DEFAULT_TITLE_LIMIT = 48
const DEFAULT_DESCRIPTION_LIMIT = 158

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function truncateSeoText(value: string, limit: number) {
  const normalized = normalizeWhitespace(value)
  if (normalized.length <= limit) return normalized

  const shortened = normalized.slice(0, Math.max(1, limit - 1))
  const wordBoundary = shortened.lastIndexOf(' ')
  const safe =
    wordBoundary >= Math.floor(limit * 0.65) ? shortened.slice(0, wordBoundary) : shortened
  return `${safe.replace(/[.,;:!?\s-]+$/, '')}…`
}

export function seoTitle(value: string, limit = DEFAULT_TITLE_LIMIT) {
  return truncateSeoText(value, limit)
}

export function seoDescription(value: string, fallback: string) {
  return truncateSeoText(normalizeWhitespace(value) || fallback, DEFAULT_DESCRIPTION_LIMIT)
}

export interface QuizIndexabilityInput {
  description: string
  questionCount: number
  explainedQuestionCount: number
  pendingReportCount: number
}

export const MIN_INDEXABLE_QUIZZES_PER_LISTING = 3

/**
 * Thin or moderation-risk quizzes stay publicly accessible, but are kept out
 * of search indexes until they contain enough useful, reviewed content.
 */
export function isQuizIndexable(input: QuizIndexabilityInput) {
  return (
    input.questionCount >= 5 &&
    normalizeWhitespace(input.description).length >= 30 &&
    input.explainedQuestionCount >= 3 &&
    input.pendingReportCount === 0
  )
}

/** Category and collection pages need enough useful destinations to stand alone in search. */
export function isQuizListingIndexable(quizCount: number) {
  return quizCount >= MIN_INDEXABLE_QUIZZES_PER_LISTING
}
