import { z } from 'zod'

export const QUIZ_FORMATS = [
  'TEXT_CHOICE',
  'IMAGE_CHOICE',
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

export const quizSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  coverImage: z.string().trim().url().optional(),
  categoryId: z.string().cuid(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  format: z.enum(QUIZ_FORMATS).default('TEXT_CHOICE'),
  defaultTimeLimitSec: z.number().int().min(60).max(3600).optional(),
  isPublished: z.boolean().default(false),
})

export const draftQuizSchema = quizSchema.extend({
  title: z.string().trim().max(120),
  description: z.string().trim().max(500),
})

export const questionSchema = z
  .object({
    type: z.enum([
      'SINGLE',
      'TRUEFALSE',
      'HOTSPOT',
      'ORDER',
      'MATCH',
      'NUMBER_GUESS',
      'GROUPS',
      'FILL_BLANK',
    ]),
    prompt: z.string().trim().min(1),
    explanation: z.string().trim().max(500).optional(),
    timeLimitSec: z.number().int().min(5).max(120),
    meta: z.record(z.string(), z.unknown()).optional(),
    choices: z.array(
      z.object({
        text: z.string().trim(),
        imageUrl: z.string().trim().url().optional(),
        isCorrect: z.boolean(),
        meta: z.record(z.string(), z.unknown()).optional(),
      })
    ),
  })
  .superRefine((value, ctx) => {
    const { type, choices, meta } = value
    const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

    switch (type) {
      case 'SINGLE':
      case 'TRUEFALSE':
      case 'HOTSPOT': {
        for (const choice of choices) {
          if (choice.text.length === 0 && !(choice.imageUrl && choice.imageUrl.length > 0)) {
            ctx.addIssue({ code: 'custom', message: 'Each choice must have text or an image.' })
            return
          }
        }
        const correctCount = choices.filter((choice) => choice.isCorrect).length
        if (correctCount !== 1) {
          ctx.addIssue({ code: 'custom', message: 'Exactly one correct answer is required.' })
        }
        break
      }

      case 'ORDER': {
        if (choices.length < 3 || choices.length > 8) {
          ctx.addIssue({ code: 'custom', message: 'Ordering questions need 3–8 items.' })
          return
        }
        if (choices.some((c) => c.text.length === 0 && !c.imageUrl)) {
          ctx.addIssue({ code: 'custom', message: 'Each item must have text or an image.' })
          return
        }
        const positions = choices.map((c) => c.meta?.position)
        const expected = new Set(Array.from({ length: choices.length }, (_, i) => i + 1))
        for (const p of positions) {
          if (!isFiniteNumber(p) || !expected.delete(p)) {
            ctx.addIssue({
              code: 'custom',
              message: 'Item positions must be a complete 1..n sequence.',
            })
            return
          }
        }
        break
      }

      case 'MATCH': {
        const left = choices.filter((c) => c.meta?.side === 'L')
        const right = choices.filter((c) => c.meta?.side === 'R')
        if (left.length !== right.length || left.length < 3 || left.length > 8) {
          ctx.addIssue({ code: 'custom', message: 'Matching questions need 3–8 complete pairs.' })
          return
        }
        if (left.length + right.length !== choices.length) {
          ctx.addIssue({ code: 'custom', message: 'Every item must belong to a side (L or R).' })
          return
        }
        if (choices.some((c) => c.text.length === 0 && !c.imageUrl)) {
          ctx.addIssue({ code: 'custom', message: 'Each item must have text or an image.' })
          return
        }
        const leftKeys = left.map((c) => c.meta?.matchKey)
        const rightKeys = right.map((c) => c.meta?.matchKey)
        const isValidKeys =
          leftKeys.every((k) => typeof k === 'string' && k.length > 0) &&
          new Set(leftKeys).size === leftKeys.length &&
          new Set(rightKeys).size === rightKeys.length &&
          leftKeys.every((k) => rightKeys.includes(k))
        if (!isValidKeys) {
          ctx.addIssue({ code: 'custom', message: 'Pairs must match one-to-one.' })
        }
        break
      }

      case 'NUMBER_GUESS': {
        if (choices.length !== 0) {
          ctx.addIssue({ code: 'custom', message: 'Number questions have no choices.' })
          return
        }
        const answer = meta?.answer
        const min = meta?.min
        const max = meta?.max
        const tolerance = meta?.tolerance ?? 0
        if (
          !isFiniteNumber(answer) ||
          !isFiniteNumber(min) ||
          !isFiniteNumber(max) ||
          !isFiniteNumber(tolerance) ||
          min >= max ||
          answer < min ||
          answer > max ||
          tolerance < 0
        ) {
          ctx.addIssue({
            code: 'custom',
            message:
              'Number questions need answer, min < max (answer within range) and tolerance ≥ 0.',
          })
        }
        break
      }

      case 'GROUPS': {
        const rawGroups = Array.isArray(meta?.groups) ? (meta?.groups as unknown[]) : []
        const keys = rawGroups
          .map((g) => (typeof g === 'object' && g !== null ? (g as { key?: unknown }).key : null))
          .filter((k): k is string => typeof k === 'string' && k.length > 0)
        if (keys.length < 2 || keys.length > 4 || new Set(keys).size !== keys.length) {
          ctx.addIssue({
            code: 'custom',
            message: 'Grouping questions need 2–4 uniquely-keyed groups.',
          })
          return
        }
        if (choices.some((c) => c.text.length === 0 && !c.imageUrl)) {
          ctx.addIssue({ code: 'custom', message: 'Each tile must have text or an image.' })
          return
        }
        const sizeByKey = new Map<string, number>(keys.map((k) => [k, 0]))
        for (const choice of choices) {
          const groupKey = choice.meta?.groupKey
          if (typeof groupKey !== 'string' || !sizeByKey.has(groupKey)) {
            ctx.addIssue({ code: 'custom', message: 'Every tile must belong to a group.' })
            return
          }
          sizeByKey.set(groupKey, sizeByKey.get(groupKey)! + 1)
        }
        const sizes = [...sizeByKey.values()]
        if (sizes.some((s) => s < 3 || s > 6) || new Set(sizes).size !== 1) {
          ctx.addIssue({
            code: 'custom',
            message: 'All groups must have the same size (3–6 tiles each).',
          })
        }
        break
      }

      case 'FILL_BLANK': {
        if (choices.length !== 0) {
          ctx.addIssue({ code: 'custom', message: 'Type-the-answer questions have no choices.' })
          return
        }
        const accepted = Array.isArray(meta?.acceptedAnswers)
          ? (meta?.acceptedAnswers as unknown[]).filter(
              (a) => typeof a === 'string' && a.trim().length > 0 && a.length <= 120
            )
          : []
        const listAnswers = Array.isArray(meta?.answers) ? (meta?.answers as unknown[]) : []
        const hasValidList =
          listAnswers.length >= 2 &&
          listAnswers.length <= 50 &&
          listAnswers.every(
            (entry) =>
              typeof entry === 'object' &&
              entry !== null &&
              typeof (entry as { label?: unknown }).label === 'string' &&
              (entry as { label: string }).label.trim().length > 0
          )
        if (accepted.length === 0 && !hasValidList) {
          ctx.addIssue({ code: 'custom', message: 'At least one accepted answer is required.' })
        }
        break
      }
    }
  })

export const submitAnswerInputSchema = z.object({
  questionId: z.string().min(1).max(100),
  choiceIds: z.array(z.string().max(100)).max(30),
  timeTakenMs: z.number().finite(),
  textAnswer: z.string().max(1000).optional(),
  textAnswers: z.array(z.string().max(200)).max(100).optional(),
  numberAnswer: z.number().finite().optional(),
  pairs: z
    .array(z.object({ leftId: z.string().max(100), rightId: z.string().max(100) }))
    .max(20)
    .optional(),
  groups: z
    .array(z.array(z.string().max(100)).max(8))
    .max(8)
    .optional(),
})

export const submitPlaySchema = z.object({
  playToken: z.string().min(1),
  quizId: z.string().min(1).max(100),
  answers: z.array(submitAnswerInputSchema).max(200),
  guestName: z.string().max(60).optional(),
  // Tolerate legacy/unknown mode values from older clients by treating them as unset.
  mode: z.enum(['STANDARD', 'DAILY', 'PRACTICE', 'BLITZ']).optional().catch(undefined),
})

export const questionAnswerSchema = z.object({
  questionId: z.string().cuid(),
  chosenIds: z.array(z.string().cuid()),
  timeTakenMs: z.number().int().min(0),
})

export const submitAnswersSchema = z.object({
  sessionId: z.string().cuid(),
  answers: z.array(questionAnswerSchema),
})

export const createDuelSchema = z.object({
  categoryId: z.string().cuid().optional(),
  questionCount: z.number().int().min(5).max(15).optional(),
  timeLimitSec: z
    .number()
    .int()
    .refine((value) => [10, 20, 30].includes(value))
    .optional(),
  maxPlayers: z.number().int().min(2).max(10).optional(),
})

export const joinDuelSchema = z.object({
  code: z.string().trim().toUpperCase().min(6).max(6),
})

export const ratingSchema = z.object({
  quizId: z.string().cuid(),
  stars: z.number().int().min(1).max(5),
})

export const reportSchema = z.object({
  quizId: z.string().cuid(),
  reason: z.enum(['SPAM', 'INAPPROPRIATE', 'INCORRECT_ANSWERS', 'COPYRIGHT', 'OTHER']),
  details: z.string().trim().max(500).optional(),
})

export const commentSchema = z.object({
  quizId: z.string().cuid(),
  body: z.string().trim().min(1).max(1000),
  parentId: z.string().cuid().optional(),
})

export const commentReportSchema = z.object({
  commentId: z.string().cuid(),
  reason: z.enum(['SPAM', 'INAPPROPRIATE', 'INCORRECT_ANSWERS', 'COPYRIGHT', 'OTHER']),
  details: z.string().trim().max(500).optional(),
})

export const categorySuggestionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(5).max(200),
  icon: z.string().trim().min(1).max(40),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
})

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~])/
export const PASSWORD_REGEX_MESSAGE =
  'Password must contain at least one uppercase letter and one number or special character.'

const passwordSchema = z.string().min(8).regex(PASSWORD_REGEX, { message: PASSWORD_REGEX_MESSAGE })

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().trim().toLowerCase(),
  password: passwordSchema,
})

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Username must use lowercase letters and numbers, with hyphens only between segments.',
  })

export const meProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  username: usernameSchema,
  bio: z.string().trim().max(280).nullable().optional(),
  image: z.url().trim().nullable().optional(),
  bannerImage: z.url().trim().nullable().optional(),
})

export const userPreferencesSchema = z
  .object({
    defaultDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ANY']).optional(),
    reducedMotion: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
  })
  .strict()

export const mePreferencesSchema = z.object({
  preferences: userPreferencesSchema,
})

export const mePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
})

export const meDeleteSchema = z.object({
  confirmUsername: z.string().trim().min(1),
})
