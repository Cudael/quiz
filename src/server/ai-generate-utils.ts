import { Prisma } from '@prisma/client'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const ALL_FORMATS = [
  'TEXT_CHOICE',
  'IMAGE_CHOICE',
  'MAP_CHOICE',
  'IMAGE_HOTSPOT',
  'ORDER',
  'MATCH',
  'ODD_ONE_OUT',
  'TYPE_ANSWER',
  'NUMBER_GUESS',
  'IMAGE_REVEAL',
  'AUDIO_CHOICE',
  'VERSUS',
  'CONNECTIONS',
  'ANAGRAM',
  'MEMORY_FLASH',
] as const

export type QuizFormat = (typeof ALL_FORMATS)[number]

type QuestionType = 'SINGLE' | 'ORDER' | 'MATCH' | 'NUMBER_GUESS' | 'GROUPS' | 'FILL_BLANK'

/** Maps each quiz format to its canonical QuestionType for storage. */
const FORMAT_TO_TYPE: Record<QuizFormat, QuestionType> = {
  TEXT_CHOICE: 'SINGLE',
  IMAGE_CHOICE: 'SINGLE',
  MAP_CHOICE: 'SINGLE',
  IMAGE_HOTSPOT: 'SINGLE',
  ORDER: 'ORDER',
  MATCH: 'MATCH',
  ODD_ONE_OUT: 'SINGLE',
  TYPE_ANSWER: 'FILL_BLANK',
  NUMBER_GUESS: 'NUMBER_GUESS',
  IMAGE_REVEAL: 'SINGLE',
  AUDIO_CHOICE: 'SINGLE',
  VERSUS: 'SINGLE',
  CONNECTIONS: 'GROUPS',
  ANAGRAM: 'FILL_BLANK',
  MEMORY_FLASH: 'SINGLE',
}

/** Formats where the AI prompt should NOT ask for choices (meta-only formats). */
const META_ONLY_FORMATS: Set<QuizFormat> = new Set(['TYPE_ANSWER', 'NUMBER_GUESS', 'ANAGRAM'])

/** Formats where the question image should be left empty (image-based formats). */
const IMAGE_FORMATS: Set<QuizFormat> = new Set([
  'IMAGE_CHOICE',
  'IMAGE_HOTSPOT',
  'IMAGE_REVEAL',
  'MEMORY_FLASH',
])

export interface GeneratedChoice {
  text: string
  isCorrect?: boolean
  position?: number
  side?: 'L' | 'R'
  matchKey?: string
  groupKey?: string
  value?: number
}

export interface GeneratedQuestion {
  prompt: string
  choices: GeneratedChoice[]
  explanation: string
  timeLimitSec: number
  // TYPE_ANSWER / ANAGRAM
  acceptedAnswers?: string[]
  // NUMBER_GUESS
  answer?: number
  min?: number
  max?: number
  tolerance?: number
  unit?: string
  // CONNECTIONS
  groups?: string[]
  // ANAGRAM
  anagram?: boolean
  // MEMORY_FLASH
  studyText?: string
  studyDurationMs?: number
}

export interface GeneratedQuiz {
  title: string
  description: string
  questions: GeneratedQuestion[]
}

// ---------------------------------------------------------------------------
// Shared schemas
// ---------------------------------------------------------------------------

export const generateSchema = z.object({
  topic: z.string().trim().min(3).max(200),
  categoryId: z.string().cuid(),
  count: z.coerce.number().int().min(5).max(20).default(10),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  format: z.enum(ALL_FORMATS).default('TEXT_CHOICE'),
})

export const generateQuestionsSchema = z.object({
  quizId: z.string().cuid(),
  topic: z.string().trim().max(200).optional(),
  count: z.coerce.number().int().min(1).max(10).default(5),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
})

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function difficultyHint(difficulty: string): string {
  switch (difficulty) {
    case 'EASY':
      return 'basic knowledge, straightforward'
    case 'MEDIUM':
      return 'intermediate, requires some thought'
    case 'HARD':
      return 'advanced, challenging, tricky distractors'
    default:
      return 'intermediate, requires some thought'
  }
}

function buildStandardChoicePrompt(
  format: QuizFormat,
  topic: string,
  count: number,
  difficulty: string
): string {
  const oddOneOut = format === 'ODD_ONE_OUT'
  const versus = format === 'VERSUS'
  const choiceCount = versus ? 2 : 4

  const formatHint = oddOneOut
    ? `Each question presents 4 items where 3 share a common theme/category and 1 is the odd one out. The odd one out should have isCorrect: true. Label choices so it's clear which one doesn't belong.`
    : versus
      ? `Each question compares two things. Each choice must have a "value" field (a number). The choice with the higher value should have isCorrect: true.`
      : `Each question must have exactly ${choiceCount} choices. Exactly one choice per question must have isCorrect: true.`

  return `Generate a quiz about "${topic}" with exactly ${count} questions at ${difficulty} difficulty level. Format: ${format.replace(/_/g, ' ')}.

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Quiz title (max 120 chars, engaging and specific to the topic)",
  "description": "Quiz description (max 500 chars, what the quiz covers and who it's for)",
  "questions": [
    {
      "prompt": "Question text here?",
      "choices": [
        { "text": "Choice A", "isCorrect": false${versus ? ', "value": 100' : ''} },
        { "text": "Choice B", "isCorrect": true${versus ? ', "value": 200' : ''} }${
          !versus
            ? `,
        { "text": "Choice C", "isCorrect": false },
        { "text": "Choice D", "isCorrect": false }`
            : ''
        }
      ],
      "explanation": "Brief explanation of the correct answer.",
      "timeLimitSec": 20
    }
  ]
}

Rules:
- ${formatHint}
- IMPORTANT: The isCorrect flag MUST be on the factually correct answer. Double-check each question before returning.
- Questions should be factual, clear, and unambiguous
- Difficulty ${difficulty}: ${difficultyHint(difficulty)}
- explanation should be 1-2 sentences confirming why the correct answer is right
- timeLimitSec should be 20 for all questions
- title should be catchy and specific to the topic`
}

function buildOrderPrompt(topic: string, count: number, difficulty: string): string {
  return `Generate a quiz about "${topic}" with exactly ${count} ordering/ranking questions at ${difficulty} difficulty level. Format: ORDER.

Each question asks the player to put items in the correct order (chronological, sequential, ranked, etc.).

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Quiz title (max 120 chars, engaging and specific to the topic)",
  "description": "Quiz description (max 500 chars, what the quiz covers and who it's for)",
  "questions": [
    {
      "prompt": "Put these items in the correct order:",
      "choices": [
        { "text": "First item", "position": 1 },
        { "text": "Second item", "position": 2 },
        { "text": "Third item", "position": 3 },
        { "text": "Fourth item", "position": 4 }
      ],
      "explanation": "Brief explanation of the correct order.",
      "timeLimitSec": 30
    }
  ]
}

Rules:
- Each question must have exactly 4 choices
- Each choice must have a "position" field (1, 2, 3, or 4) indicating the correct order
- Every position 1-4 must be used exactly once per question (no duplicates, no gaps)
- The prompt should clearly instruct the player what ordering is expected (chronological, size, etc.)
- Difficulty ${difficulty}: ${difficultyHint(difficulty)}
- explanation should be 1-2 sentences explaining the correct order
- timeLimitSec should be 30 for ordering questions
- title should be catchy and specific to the topic`
}

function buildMatchPrompt(topic: string, count: number, difficulty: string): string {
  return `Generate a quiz about "${topic}" with exactly ${count} matching/pairing questions at ${difficulty} difficulty level. Format: MATCH.

Each question asks the player to match left-side items with right-side items.

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Quiz title (max 120 chars, engaging and specific to the topic)",
  "description": "Quiz description (max 500 chars, what the quiz covers and who it's for)",
  "questions": [
    {
      "prompt": "Match each country to its capital:",
      "choices": [
        { "text": "France", "side": "L", "matchKey": "1" },
        { "text": "Japan", "side": "L", "matchKey": "2" },
        { "text": "Brazil", "side": "L", "matchKey": "3" },
        { "text": "Paris", "side": "R", "matchKey": "1" },
        { "text": "Tokyo", "side": "R", "matchKey": "2" },
        { "text": "Brasília", "side": "R", "matchKey": "3" }
      ],
      "explanation": "Brief explanation of the correct pairings.",
      "timeLimitSec": 30
    }
  ]
}

Rules:
- Each question should have 3-4 pairs (6-8 choices total)
- Each choice must have a "side" field: "L" for left column, "R" for right column
- Each choice must have a "matchKey" field: matching pairs share the same matchKey string (e.g., "1", "2", etc.)
- Every matchKey must appear exactly twice: once on an L choice and once on an R choice
- Difficulty ${difficulty}: ${difficultyHint(difficulty)}
- explanation should explain the correct pairings
- timeLimitSec should be 30 for matching questions
- title should be catchy and specific to the topic`
}

function buildConnectionsPrompt(topic: string, count: number, difficulty: string): string {
  return `Generate a quiz about "${topic}" with exactly ${count} grouping/connections questions at ${difficulty} difficulty level. Format: CONNECTIONS.

Each question asks the player to group items into categories.

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Quiz title (max 120 chars, engaging and specific to the topic)",
  "description": "Quiz description (max 500 chars, what the quiz covers and who it's for)",
  "questions": [
    {
      "prompt": "Group these items into their correct categories:",
      "choices": [
        { "text": "Apple", "groupKey": "fruits" },
        { "text": "Carrot", "groupKey": "vegetables" },
        { "text": "Banana", "groupKey": "fruits" },
        { "text": "Broccoli", "groupKey": "vegetables" }
      ],
      "groups": ["fruits", "vegetables"],
      "explanation": "Brief explanation of the correct groups.",
      "timeLimitSec": 30
    }
  ]
}

Rules:
- Each question should have 6-12 items across 3-4 groups
- Each choice must have a "groupKey" field indicating which group it belongs to
- The question-level "groups" array lists all unique group keys used in that question
- Every groupKey in groups must be used by at least one choice
- Difficulty ${difficulty}: ${difficultyHint(difficulty)}
- explanation should explain why items belong to their groups
- timeLimitSec should be 30 for grouping questions
- title should be catchy and specific to the topic`
}

function buildTypeAnswerPrompt(
  format: QuizFormat,
  topic: string,
  count: number,
  difficulty: string
): string {
  const isAnagram = format === 'ANAGRAM'
  const formatName = isAnagram ? 'ANAGRAM' : 'TYPE_ANSWER'

  return `Generate a quiz about "${topic}" with exactly ${count} type-the-answer questions at ${difficulty} difficulty level. Format: ${formatName}.

${isAnagram ? `Each question presents scrambled letters and the player must type the unscrambled word/phrase.` : `Each question asks the player to type the answer (no choices given).`}

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Quiz title (max 120 chars, engaging and specific to the topic)",
  "description": "Quiz description (max 500 chars, what the quiz covers and who it's for)",
  "questions": [
    {
      "prompt": "Question text asking for a typed answer?",
      "acceptedAnswers": ["correct answer", "alternative answer"],
      "explanation": "Brief explanation of the correct answer.",
      "timeLimitSec": 20${isAnagram ? ',\n      "anagram": true' : ''}
    }
  ]
}

Rules:
- Each question must have an "acceptedAnswers" array with at least one correct answer (include common variations, alternate spellings)
- Do NOT include a "choices" array — these are free-text answer questions
- acceptedAnswers should be case-insensitive variations of the correct answer
- Questions should have a single, unambiguous answer
- Difficulty ${difficulty}: ${difficultyHint(difficulty)}
- explanation should be 1-2 sentences confirming the answer
- timeLimitSec should be 20
- title should be catchy and specific to the topic`
}

function buildNumberGuessPrompt(topic: string, count: number, difficulty: string): string {
  return `Generate a quiz about "${topic}" with exactly ${count} number-guess questions at ${difficulty} difficulty level. Format: NUMBER_GUESS.

Each question asks the player to guess a numeric value within a range.

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Quiz title (max 120 chars, engaging and specific to the topic)",
  "description": "Quiz description (max 500 chars, what the quiz covers and who it's for)",
  "questions": [
    {
      "prompt": "How many bones are in the adult human body?",
      "answer": 206,
      "min": 100,
      "max": 400,
      "tolerance": 5,
      "unit": "bones",
      "explanation": "The adult human body has 206 bones.",
      "timeLimitSec": 20
    }
  ]
}

Rules:
- Each question must have numeric "answer", "min", "max", and "tolerance" fields
- "answer" is the exact correct value
- "min" and "max" define the slider/input range
- "tolerance" is the ± margin where the answer is still considered fully correct
- "unit" is a short label describing what's being measured (optional but recommended)
- Do NOT include a "choices" array
- Difficulty ${difficulty}: ${difficultyHint(difficulty)}
- For EASY: wider tolerance relative to range; for HARD: very tight tolerance
- explanation should confirm the correct number with context
- timeLimitSec should be 20
- title should be catchy and specific to the topic`
}

function buildMemoryFlashPrompt(topic: string, count: number, difficulty: string): string {
  return `Generate a quiz about "${topic}" with exactly ${count} memory-flash questions at ${difficulty} difficulty level. Format: MEMORY_FLASH.

Each question shows a study text briefly, then the player answers from memory.

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Quiz title (max 120 chars, engaging and specific to the topic)",
  "description": "Quiz description (max 500 chars, what the quiz covers and who it's for)",
  "questions": [
    {
      "prompt": "What was the fact shown?",
      "studyText": "The Eiffel Tower was completed in 1889 and is 330 meters tall.",
      "choices": [
        { "text": "Choice A", "isCorrect": false },
        { "text": "Choice B", "isCorrect": true },
        { "text": "Choice C", "isCorrect": false },
        { "text": "Choice D", "isCorrect": false }
      ],
      "studyDurationMs": 5000,
      "explanation": "Brief explanation of the correct answer.",
      "timeLimitSec": 20
    }
  ]
}

Rules:
- Each question must have a "studyText" field (the fact shown to the player before the question)
- Each question must have exactly 4 choices with exactly one isCorrect: true
- studyDurationMs should be 5000 (5 seconds) for normal difficulty, adjust for text length
- The correct answer should test recall of the studyText content
- Difficulty ${difficulty}: ${difficultyHint(difficulty)}
- explanation should reference the study text
- timeLimitSec should be 20
- title should be catchy and specific to the topic`
}

export function buildPrompt(
  topic: string,
  count: number,
  difficulty: string,
  format: QuizFormat
): string {
  switch (format) {
    case 'ORDER':
      return buildOrderPrompt(topic, count, difficulty)
    case 'MATCH':
      return buildMatchPrompt(topic, count, difficulty)
    case 'CONNECTIONS':
      return buildConnectionsPrompt(topic, count, difficulty)
    case 'TYPE_ANSWER':
    case 'ANAGRAM':
      return buildTypeAnswerPrompt(format, topic, count, difficulty)
    case 'NUMBER_GUESS':
      return buildNumberGuessPrompt(topic, count, difficulty)
    case 'MEMORY_FLASH':
      return buildMemoryFlashPrompt(topic, count, difficulty)
    default:
      return buildStandardChoicePrompt(format, topic, count, difficulty)
  }
}

// ---------------------------------------------------------------------------
// OpenAI call
// ---------------------------------------------------------------------------

export async function callOpenAI(prompt: string): Promise<GeneratedQuiz> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.6-sol',
      messages: [
        {
          role: 'system',
          content:
            'You are a quiz generator. Return only valid JSON with no markdown formatting, no code fences, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 1,
      reasoning_effort: 'high',
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error')
    throw new Error(`OpenAI API error ${response.status}: ${errorBody}`)
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI returned empty response')
  }

  const parsed = JSON.parse(content) as GeneratedQuiz

  if (!parsed.title || !parsed.description || !Array.isArray(parsed.questions)) {
    throw new Error('OpenAI returned invalid quiz structure')
  }

  if (parsed.questions.length === 0) {
    throw new Error('OpenAI returned no questions')
  }

  return parsed
}

// ---------------------------------------------------------------------------
// Validation & normalisation per format
// ---------------------------------------------------------------------------

export function validateAndNormalize(generated: GeneratedQuiz, format: QuizFormat): GeneratedQuiz {
  const isMetaOnly = META_ONLY_FORMATS.has(format)

  for (const q of generated.questions) {
    if (!q.prompt) {
      throw new Error('Invalid question: missing prompt')
    }

    if (isMetaOnly) {
      q.choices = []
    }

    if (!isMetaOnly) {
      if (!Array.isArray(q.choices)) {
        q.choices = []
      }

      switch (format) {
        case 'ORDER': {
          if (q.choices.length === 0) {
            throw new Error('ORDER question has no choices')
          }
          const positions = q.choices.map((c) => c.position)
          const expected = Array.from({ length: q.choices.length }, (_, i) => i + 1)
          const sorted = [...positions].sort((a, b) => (a ?? 0) - (b ?? 0))
          if (JSON.stringify(sorted) !== JSON.stringify(expected)) {
            q.choices.forEach((c, i) => {
              c.position = i + 1
            })
          }
          break
        }

        case 'MATCH': {
          if (q.choices.length < 4 || q.choices.length % 2 !== 0) {
            throw new Error('MATCH question must have an even number of choices (at least 4)')
          }
          const keys = new Map<string, { l: boolean; r: boolean }>()
          for (const c of q.choices) {
            if (!c.side || (c.side !== 'L' && c.side !== 'R')) {
              c.side = 'L'
            }
            if (!c.matchKey) {
              c.matchKey = String(Math.random())
            }
            if (!keys.has(c.matchKey)) {
              keys.set(c.matchKey, { l: false, r: false })
            }
            if (c.side === 'L') keys.get(c.matchKey)!.l = true
            else keys.get(c.matchKey)!.r = true
          }
          for (const [key, sides] of keys) {
            if (!sides.l || !sides.r) {
              throw new Error(`MATCH key "${key}" is not paired on both sides`)
            }
          }
          break
        }

        case 'CONNECTIONS': {
          if (q.choices.length < 4) {
            throw new Error('CONNECTIONS question must have at least 4 choices')
          }
          const groupKeys = new Set<string>()
          for (const c of q.choices) {
            if (!c.groupKey) c.groupKey = 'default'
            groupKeys.add(c.groupKey)
          }
          if (groupKeys.size < 2) {
            throw new Error('CONNECTIONS question must have at least 2 groups')
          }
          q.groups = q.groups ?? [...groupKeys]
          break
        }

        case 'VERSUS': {
          if (q.choices.length !== 2) {
            if (q.choices.length < 2) {
              while (q.choices.length < 2) {
                q.choices.push({ text: 'Option', isCorrect: false, value: 0 })
              }
            } else {
              q.choices = q.choices.slice(0, 2)
            }
          }
          for (const c of q.choices) {
            if (c.value === undefined) c.value = c.isCorrect ? 1 : 0
          }
          const [a, b] = q.choices
          if ((a.value ?? 0) > (b.value ?? 0)) {
            a.isCorrect = true
            b.isCorrect = false
          } else {
            b.isCorrect = true
            a.isCorrect = false
          }
          break
        }

        default: {
          if (q.choices.length === 0) {
            throw new Error(`Question has no choices (format: ${format})`)
          }
          const correctCount = q.choices.filter((c) => c.isCorrect).length
          if (correctCount !== 1) {
            let found = false
            for (const c of q.choices) {
              if (c.isCorrect && !found) {
                found = true
              } else {
                c.isCorrect = false
              }
            }
            if (!found) {
              q.choices[0].isCorrect = true
            }
          }
          break
        }
      }
    }

    switch (format) {
      case 'TYPE_ANSWER':
      case 'ANAGRAM': {
        if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length === 0) {
          throw new Error('TYPE_ANSWER/ANAGRAM question missing acceptedAnswers')
        }
        q.acceptedAnswers = q.acceptedAnswers.filter(
          (a): a is string => typeof a === 'string' && a.trim().length > 0
        )
        if (q.acceptedAnswers.length === 0) {
          throw new Error('TYPE_ANSWER/ANAGRAM question has no valid acceptedAnswers')
        }
        break
      }

      case 'NUMBER_GUESS': {
        if (typeof q.answer !== 'number' || !Number.isFinite(q.answer)) {
          throw new Error('NUMBER_GUESS question missing numeric answer')
        }
        q.min = typeof q.min === 'number' && Number.isFinite(q.min) ? q.min : q.answer - 100
        q.max = typeof q.max === 'number' && Number.isFinite(q.max) ? q.max : q.answer + 100
        q.tolerance =
          typeof q.tolerance === 'number' && Number.isFinite(q.tolerance) ? q.tolerance : 0
        break
      }

      case 'MEMORY_FLASH': {
        if (!q.studyText || typeof q.studyText !== 'string') {
          q.studyText = q.prompt
        }
        q.studyDurationMs =
          typeof q.studyDurationMs === 'number' && q.studyDurationMs > 0 ? q.studyDurationMs : 5000
        break
      }
    }
  }

  return generated
}

// ---------------------------------------------------------------------------
// DB persistence helpers
// ---------------------------------------------------------------------------

function buildQuestionMeta(
  q: GeneratedQuestion,
  format: QuizFormat
): Record<string, unknown> | null {
  switch (format) {
    case 'TYPE_ANSWER':
      return { acceptedAnswers: q.acceptedAnswers, fuzzy: false }
    case 'ANAGRAM':
      return { acceptedAnswers: q.acceptedAnswers, fuzzy: false, anagram: true }
    case 'NUMBER_GUESS':
      return {
        answer: q.answer,
        min: q.min,
        max: q.max,
        tolerance: q.tolerance,
        unit: q.unit ?? '',
      }
    case 'IMAGE_REVEAL':
      return { reveal: true }
    case 'AUDIO_CHOICE':
      return { audioUrl: '' }
    case 'MEMORY_FLASH':
      return { studyText: q.studyText, studyImageUrl: '', studyDurationMs: q.studyDurationMs }
    case 'CONNECTIONS':
      return { groups: q.groups ?? [] }
    default:
      return null
  }
}

function buildChoiceMeta(c: GeneratedChoice, format: QuizFormat): Record<string, unknown> | null {
  switch (format) {
    case 'ORDER':
      return { position: c.position }
    case 'MATCH':
      return { side: c.side, matchKey: c.matchKey }
    case 'CONNECTIONS':
      return { groupKey: c.groupKey }
    case 'VERSUS':
      return { value: c.value }
    default:
      return null
  }
}

export function buildQuestionCreateData(
  q: GeneratedQuestion,
  format: QuizFormat,
  quizId: string,
  order: number
): Prisma.QuestionUncheckedCreateInput {
  const questionType = FORMAT_TO_TYPE[format]
  const questionMeta = buildQuestionMeta(q, format)
  const imageUrl: string | null = IMAGE_FORMATS.has(format) ? '' : null

  const choices: Prisma.ChoiceUncheckedCreateNestedManyWithoutQuestionInput['create'] =
    q.choices.map((c) => {
      const choiceMeta = buildChoiceMeta(c, format)
      const entry: Prisma.ChoiceUncheckedCreateWithoutQuestionInput = {
        text: c.text,
        imageUrl: format === 'IMAGE_CHOICE' ? '' : null,
        isCorrect: c.isCorrect ?? false,
      }
      if (choiceMeta) {
        entry.meta = JSON.parse(JSON.stringify(choiceMeta)) as Prisma.InputJsonValue
      }
      return entry
    })

  const data: Prisma.QuestionUncheckedCreateInput = {
    quizId,
    type: questionType,
    prompt: q.prompt,
    imageUrl,
    explanation: q.explanation?.slice(0, 500) || null,
    timeLimitSec: q.timeLimitSec || 20,
    order,
    choices: { create: choices },
  }
  if (questionMeta) {
    data.meta = JSON.parse(JSON.stringify(questionMeta)) as Prisma.InputJsonValue
  }
  return data
}
