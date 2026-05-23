import { z } from 'zod'
import { FILL_BLANK_PLACEHOLDER } from '@/domain/quiz-constants'

export const quizSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  coverImage: z.string().trim().url().optional(),
  categoryId: z.string().cuid(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  isPublished: z.boolean().default(false),
})

export const questionSchema = z
  .object({
    type: z.enum(['SINGLE', 'MULTIPLE', 'TRUEFALSE', 'FILL_BLANK']),
    prompt: z.string().trim().min(1),
    explanation: z.string().trim().max(500).optional(),
    timeLimitSec: z.number().int().min(5).max(120),
    choices: z.array(z.object({ text: z.string().trim().min(1), isCorrect: z.boolean() })),
  })
  .superRefine((value, ctx) => {
    const correctCount = value.choices.filter((choice) => choice.isCorrect).length
    if ((value.type === 'SINGLE' || value.type === 'TRUEFALSE') && correctCount !== 1) {
      ctx.addIssue({ code: 'custom', message: 'Exactly one correct answer is required.' })
    }
    if (value.type === 'MULTIPLE' && correctCount < 2) {
      ctx.addIssue({ code: 'custom', message: 'At least two correct answers are required.' })
    }
    if (value.type === 'FILL_BLANK' && !value.prompt.includes(FILL_BLANK_PLACEHOLDER)) {
      ctx.addIssue({
        code: 'custom',
        message: `FILL_BLANK prompt must contain ${FILL_BLANK_PLACEHOLDER}.`,
      })
    }
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

export const reportSchema = z.object({
  quizId: z.string().cuid(),
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

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
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
    defaultMode: z.enum(['CLASSIC', 'TIMED', 'SURVIVAL', 'DAILY']).optional(),
    defaultDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ANY']).optional(),
    reducedMotion: z.boolean().optional(),
  })
  .strict()

export const mePreferencesSchema = z.object({
  preferences: userPreferencesSchema,
})

export const mePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export const meDeleteSchema = z.object({
  confirmUsername: z.string().trim().min(1),
})
