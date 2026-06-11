import { DEFAULT_TIME_LIMIT_SEC } from '@/domain/quiz-constants'

export type ImportQuestionType = 'SINGLE'

export interface ImportChoice {
  text: string
  imageUrl?: string
  isCorrect: boolean
}

export interface ImportQuestion {
  type: ImportQuestionType
  prompt: string
  explanation?: string
  timeLimitSec: number
  choices: ImportChoice[]
}

export interface ImportValidationError {
  row: number
  message: string
}

export interface QuizImportResult {
  questions: ImportQuestion[]
  errors: ImportValidationError[]
}

const VALID_TYPES: ImportQuestionType[] = ['SINGLE']

function parseCsvLine(line: string) {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const currentChar = line[i]
    if (currentChar === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (currentChar === ',' && !inQuotes) {
      fields.push(current)
      current = ''
      continue
    }
    current += currentChar
  }
  fields.push(current)
  return fields.map((field) => field.trim())
}

function validateQuestion(question: ImportQuestion, row: number) {
  const errors: ImportValidationError[] = []

  if (!VALID_TYPES.includes(question.type)) {
    errors.push({ row, message: `Unknown question type: ${question.type}` })
  }
  if (!question.prompt.trim()) {
    errors.push({ row, message: 'Prompt is required.' })
  }
  if (question.timeLimitSec <= 0) {
    errors.push({ row, message: 'timeLimitSec must be greater than 0.' })
  }
  if (question.choices.length < 2) {
    errors.push({ row, message: 'At least two choices are required.' })
  }
  const correctCount = question.choices.filter((choice) => choice.isCorrect).length
  if (correctCount !== 1) {
    errors.push({ row, message: `${question.type} requires exactly one correct choice.` })
  }

  return errors
}

function parseChoiceList(choiceField: string) {
  return choiceField
    .split(';')
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((choice) => ({
      text: choice.startsWith('*') ? choice.slice(1).trim() : choice,
      isCorrect: choice.startsWith('*'),
    }))
}

export function parseCsvQuizImport(input: string): QuizImportResult {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length <= 1) {
    return { questions: [], errors: [{ row: 1, message: 'CSV has no data rows.' }] }
  }

  const [header, ...rows] = lines
  const parsedHeader = parseCsvLine(header)
  const expected = ['type', 'prompt', 'explanation', 'timelimitsec', 'choices']
  if (parsedHeader.map((field) => field.toLowerCase()).join('|') !== expected.join('|')) {
    return {
      questions: [],
      errors: [
        {
          row: 1,
          message:
            'Invalid CSV header. Use type,prompt,explanation,timeLimitSec,choices (case-insensitive).',
        },
      ],
    }
  }

  const questions: ImportQuestion[] = []
  const errors: ImportValidationError[] = []

  rows.forEach((row, index) => {
    const rowNum = index + 2
    const [typeRaw = '', prompt = '', explanation = '', timeRaw = '', choiceRaw = ''] =
      parseCsvLine(row)
    const type = typeRaw.toUpperCase() as ImportQuestionType
    const timeLimitSec = Number.parseInt(timeRaw, 10)
    const question: ImportQuestion = {
      type,
      prompt,
      explanation: explanation || undefined,
      timeLimitSec: Number.isFinite(timeLimitSec) ? timeLimitSec : DEFAULT_TIME_LIMIT_SEC,
      choices: parseChoiceList(choiceRaw),
    }

    const questionErrors = validateQuestion(question, rowNum)
    if (questionErrors.length > 0) {
      errors.push(...questionErrors)
      return
    }

    questions.push(question)
  })

  return { questions, errors }
}

export function parseJsonQuizImport(input: string): QuizImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    return { questions: [], errors: [{ row: 1, message: 'Invalid JSON.' }] }
  }

  if (!Array.isArray(parsed)) {
    return { questions: [], errors: [{ row: 1, message: 'JSON must be an array of questions.' }] }
  }

  const questions: ImportQuestion[] = []
  const errors: ImportValidationError[] = []

  parsed.forEach((item, idx) => {
    const row = idx + 1
    const raw = item as Partial<ImportQuestion>
    const question: ImportQuestion = {
      type: (raw.type ?? 'SINGLE') as ImportQuestionType,
      prompt: String(raw.prompt ?? ''),
      explanation: raw.explanation ?? undefined,
      timeLimitSec: Number(raw.timeLimitSec ?? DEFAULT_TIME_LIMIT_SEC),
      choices: Array.isArray(raw.choices)
        ? raw.choices.map((choice) => ({
            text: String(choice.text ?? ''),
            isCorrect: Boolean(choice.isCorrect),
          }))
        : [],
    }

    const questionErrors = validateQuestion(question, row)
    if (questionErrors.length > 0) {
      errors.push(...questionErrors)
      return
    }

    questions.push(question)
  })

  return { questions, errors }
}
