import { z } from 'zod'
import { FILL_BLANK_PLACEHOLDER } from '@/domain/quiz-constants'

export const quizSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
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
