export const MIN_PUBLISHED_QUIZ_QUESTIONS = 5
export const MIN_PUBLISHED_QUIZ_DESCRIPTION_LENGTH = 30
export const MIN_EXPLAINED_QUESTIONS = 3
export const MIN_QUESTION_EXPLANATION_LENGTH = 20

interface QuizPublicationQualityInput {
  description: string
  questions: Array<{ explanation: string | null }>
}

function normalize(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function countUsefulQuestionExplanations(questions: Array<{ explanation: string | null }>) {
  return questions.filter(
    (question) => normalize(question.explanation ?? '').length >= MIN_QUESTION_EXPLANATION_LENGTH
  ).length
}

/**
 * Mechanical baseline for review. Accuracy, originality, image rights, and
 * wording still require an administrator's editorial judgment.
 */
export function getQuizPublicationQualityIssues(input: QuizPublicationQualityInput) {
  const issues: string[] = []

  if (input.questions.length < MIN_PUBLISHED_QUIZ_QUESTIONS) {
    issues.push(`Add at least ${MIN_PUBLISHED_QUIZ_QUESTIONS} questions.`)
  }

  if (normalize(input.description).length < MIN_PUBLISHED_QUIZ_DESCRIPTION_LENGTH) {
    issues.push(
      `Write a specific description of at least ${MIN_PUBLISHED_QUIZ_DESCRIPTION_LENGTH} characters.`
    )
  }

  const explainedQuestionCount = countUsefulQuestionExplanations(input.questions)
  if (explainedQuestionCount < MIN_EXPLAINED_QUESTIONS) {
    issues.push(
      `Add useful explanations of at least ${MIN_QUESTION_EXPLANATION_LENGTH} characters to at least ${MIN_EXPLAINED_QUESTIONS} questions.`
    )
  }

  return issues
}
