import { z } from 'zod'

export const BULK_QUIZ_IMPORT_MAX_QUIZZES = 100

export type BulkQuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface BulkImportChoice {
  text: string
  isCorrect: boolean
}

export interface BulkImportQuestion {
  prompt: string
  explanation?: string
  timeLimitSec: number
  choices: BulkImportChoice[]
}

export interface BulkImportQuiz {
  title: string
  description: string
  categorySlug: string
  difficulty: BulkQuizDifficulty
  tags: string[]
  coverImage?: string
  questions: BulkImportQuestion[]
}

export interface BulkImportQuizPreview {
  quizIndex: number
  title: string
  categorySlug: string
  difficulty: BulkQuizDifficulty
  questionCount: number
  tags: string[]
}

export interface BulkImportValidationError {
  quizIndex: number | null
  path: string
  message: string
}

export interface BulkImportValidationResult {
  batchSize: number
  quizzes: BulkImportQuiz[]
  previews: BulkImportQuizPreview[]
  errors: BulkImportValidationError[]
}

const optionalUrlSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().url().optional()
)

const choiceSchema = z.object({
  text: z.string().trim().min(1, 'Choice text is required.'),
  isCorrect: z.boolean(),
})

const questionSchema = z
  .object({
    prompt: z.string().trim().min(1, 'Question prompt is required.'),
    explanation: z
      .string()
      .trim()
      .max(500, 'Question explanation must be 500 characters or fewer.')
      .optional(),
    timeLimitSec: z.coerce.number().int().min(5).max(120).default(20),
    choices: z
      .array(choiceSchema)
      .min(2, 'A question must have at least 2 choices.')
      .max(6, 'A question can have at most 6 choices.'),
  })
  .superRefine((question, ctx) => {
    const correctCount = question.choices.filter((choice) => choice.isCorrect).length
    if (correctCount !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['choices'],
        message: 'A question must have exactly one correct choice.',
      })
    }
  })

const quizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Quiz title is required.')
    .max(120, 'Quiz title must be 120 characters or fewer.'),
  description: z
    .string()
    .trim()
    .min(1, 'Quiz description is required.')
    .max(500, 'Quiz description must be 500 characters or fewer.'),
  categorySlug: z.string().trim().min(1, 'Category slug is required.'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  coverImage: optionalUrlSchema,
  questions: z.array(questionSchema).min(5, 'A quiz must have at least 5 questions.'),
})

function formatIssuePath(path: PropertyKey[]) {
  if (path.length === 0) return '$'

  let formatted = ''
  for (const segment of path) {
    if (typeof segment === 'number') {
      formatted = `${formatted}[${segment}]`
      continue
    }
    formatted = formatted ? `${formatted}.${String(segment)}` : String(segment)
  }
  return formatted
}

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function validateBulkQuizImportJson(
  input: string,
  validCategorySlugs: Iterable<string>
): BulkImportValidationResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    return {
      batchSize: 0,
      quizzes: [],
      previews: [],
      errors: [{ quizIndex: null, path: '$', message: 'Invalid JSON.' }],
    }
  }

  if (!Array.isArray(parsed)) {
    return {
      batchSize: 0,
      quizzes: [],
      previews: [],
      errors: [{ quizIndex: null, path: '$', message: 'JSON must be an array of quizzes.' }],
    }
  }

  if (parsed.length > BULK_QUIZ_IMPORT_MAX_QUIZZES) {
    return {
      batchSize: parsed.length,
      quizzes: [],
      previews: [],
      errors: [
        {
          quizIndex: null,
          path: '$',
          message: `Import batches can contain at most ${BULK_QUIZ_IMPORT_MAX_QUIZZES} quizzes.`,
        },
      ],
    }
  }

  const categorySlugSet = new Set(validCategorySlugs)
  const candidates: Array<{ quizIndex: number; quiz: BulkImportQuiz }> = []
  const errors: BulkImportValidationError[] = []

  parsed.forEach((item, index) => {
    const quizIndex = index + 1
    const result = quizSchema.safeParse(item)

    if (!result.success) {
      errors.push(
        ...result.error.issues.map((issue) => ({
          quizIndex,
          path: formatIssuePath(issue.path),
          message: issue.message,
        }))
      )
      return
    }

    if (!categorySlugSet.has(result.data.categorySlug)) {
      errors.push({
        quizIndex,
        path: 'categorySlug',
        message: `Unknown category slug "${result.data.categorySlug}".`,
      })
      return
    }

    candidates.push({ quizIndex, quiz: result.data })
  })

  const titleGroups = new Map<string, Array<{ quizIndex: number; quiz: BulkImportQuiz }>>()
  for (const candidate of candidates) {
    const key = normalizeTitle(candidate.quiz.title)
    const existing = titleGroups.get(key) ?? []
    existing.push(candidate)
    titleGroups.set(key, existing)
  }

  const duplicateQuizIndexes = new Set<number>()
  for (const group of titleGroups.values()) {
    if (group.length <= 1) continue
    for (const duplicate of group) {
      duplicateQuizIndexes.add(duplicate.quizIndex)
      errors.push({
        quizIndex: duplicate.quizIndex,
        path: 'title',
        message: `Duplicate quiz title "${duplicate.quiz.title}" in import payload.`,
      })
    }
  }

  const quizzes = candidates
    .filter((candidate) => !duplicateQuizIndexes.has(candidate.quizIndex))
    .map((candidate) => candidate.quiz)

  const previews = candidates
    .filter((candidate) => !duplicateQuizIndexes.has(candidate.quizIndex))
    .map((candidate) => ({
      quizIndex: candidate.quizIndex,
      title: candidate.quiz.title,
      categorySlug: candidate.quiz.categorySlug,
      difficulty: candidate.quiz.difficulty,
      questionCount: candidate.quiz.questions.length,
      tags: candidate.quiz.tags,
    }))

  return {
    batchSize: parsed.length,
    quizzes,
    previews,
    errors,
  }
}
