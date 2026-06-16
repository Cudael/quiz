import { z } from 'zod'

export const quizSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  coverImage: z.string().trim().url().optional(),
  categoryId: z.string().cuid(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  format: z.enum(['TEXT_CHOICE', 'IMAGE_CHOICE', 'MAP_CHOICE']).default('TEXT_CHOICE'),
  defaultTimeLimitSec: z.number().int().min(60).max(3600).optional(),
  isPublished: z.boolean().default(false),
})

export const draftQuizSchema = quizSchema.extend({
  title: z.string().trim().max(120),
  description: z.string().trim().max(500),
})

export const questionSchema = z
  .object({
    type: z.enum(['SINGLE', 'MAP_SELECT']),
    prompt: z.string().trim().min(1),
    explanation: z.string().trim().max(500).optional(),
    timeLimitSec: z.number().int().min(5).max(120),
    choices: z.array(
      z
        .object({
          text: z.string().trim(),
          imageUrl: z.string().trim().url().optional(),
          isCorrect: z.boolean(),
          meta: z.record(z.string(), z.unknown()).optional(),
        })
        .refine(
          (choice) => choice.text.length > 0 || (choice.imageUrl && choice.imageUrl.length > 0),
          { message: 'Each choice must have text or an image.' }
        )
    ),
  })
  .superRefine((value, ctx) => {
    const correctCount = value.choices.filter((choice) => choice.isCorrect).length
    if (correctCount !== 1) {
      ctx.addIssue({ code: 'custom', message: 'Exactly one correct answer is required.' })
    }
  })

export const submitAnswerInputSchema = z.object({
  questionId: z.string().min(1).max(100),
  choiceIds: z.array(z.string().max(100)).max(20),
  timeTakenMs: z.number().finite(),
  textAnswer: z.string().max(1000).optional(),
})

export const submitPlaySchema = z.object({
  playToken: z.string().min(1),
  quizId: z.string().min(1).max(100),
  answers: z.array(submitAnswerInputSchema).max(200),
  guestName: z.string().max(60).optional(),
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
