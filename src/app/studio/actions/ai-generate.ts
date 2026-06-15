'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

type AiGenerateResult =
  | { ok: true; quizId: string }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'EMAIL_NOT_VERIFIED' | 'VALIDATION_ERROR' | 'AI_ERROR'
      message: string
    }

const generateSchema = z.object({
  topic: z.string().trim().min(3).max(200),
  categoryId: z.string().cuid(),
  count: z.coerce.number().int().min(5).max(20).default(10),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
})

interface GeneratedChoice {
  text: string
  isCorrect: boolean
}

interface GeneratedQuestion {
  prompt: string
  choices: GeneratedChoice[]
  explanation: string
  timeLimitSec: number
}

interface GeneratedQuiz {
  title: string
  description: string
  questions: GeneratedQuestion[]
}

function buildPrompt(topic: string, count: number, difficulty: string): string {
  return `Generate a quiz about "${topic}" with exactly ${count} multiple-choice questions at ${difficulty} difficulty level.

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Quiz title (max 120 chars, engaging and specific to the topic)",
  "description": "Quiz description (max 500 chars, what the quiz covers and who it's for)",
  "questions": [
    {
      "prompt": "Question text here?",
      "choices": [
        { "text": "Choice A", "isCorrect": false },
        { "text": "Choice B", "isCorrect": true },
        { "text": "Choice C", "isCorrect": false },
        { "text": "Choice D", "isCorrect": false }
      ],
      "explanation": "Brief explanation of the correct answer.",
      "timeLimitSec": 20
    }
  ]
}

Rules:
- Each question must have exactly 4 choices
- Exactly one choice per question must have isCorrect: true
- Questions should be factual, clear, and unambiguous
- Difficulty ${difficulty}: ${
    difficulty === 'EASY'
      ? 'basic knowledge, straightforward'
      : difficulty === 'MEDIUM'
        ? 'intermediate, requires some thought'
        : 'advanced, challenging, tricky distractors'
  }
- explanation should be 1-2 sentences
- timeLimitSec should be 20 for all questions
- title should be catchy and specific to the topic`
}

async function callOpenAI(prompt: string): Promise<GeneratedQuiz> {
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
      model: 'gpt-5.5',
      messages: [
        {
          role: 'system',
          content:
            'You are a quiz generator. Return only valid JSON with no markdown formatting, no code fences, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
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

  // Validate the structure
  if (!parsed.title || !parsed.description || !Array.isArray(parsed.questions)) {
    throw new Error('OpenAI returned invalid quiz structure')
  }

  if (parsed.questions.length === 0) {
    throw new Error('OpenAI returned no questions')
  }

  for (const q of parsed.questions) {
    if (!q.prompt || !Array.isArray(q.choices) || q.choices.length !== 4) {
      throw new Error('Invalid question structure: missing prompt or not 4 choices')
    }
    const correctCount = q.choices.filter((c) => c.isCorrect).length
    if (correctCount !== 1) {
      // Fix: ensure exactly one correct answer
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
  }

  return parsed
}

export async function generateQuizWithAi(formData: FormData): Promise<AiGenerateResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  if (session.user.role !== 'ADMIN') {
    return { ok: false, error: 'FORBIDDEN', message: 'Only admins can generate quizzes with AI.' }
  }

  if (!session.user.emailVerified) {
    return {
      ok: false,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address before creating quizzes.',
    }
  }

  const parsed = generateSchema.safeParse({
    topic: formData.get('topic'),
    categoryId: formData.get('categoryId'),
    count: formData.get('count'),
    difficulty: formData.get('difficulty'),
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid input. Check your settings.' }
  }

  let generated: GeneratedQuiz
  try {
    const prompt = buildPrompt(parsed.data.topic, parsed.data.count, parsed.data.difficulty)
    generated = await callOpenAI(prompt)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error'
    return { ok: false, error: 'AI_ERROR', message: `AI generation failed: ${message}` }
  }

  // Create the quiz in the database
  const quiz = await prisma.quiz.create({
    data: {
      title: generated.title.slice(0, 120),
      description: generated.description.slice(0, 500),
      authorId: session.user.id,
      categoryId: parsed.data.categoryId,
      difficulty: parsed.data.difficulty,
      format: 'TEXT_CHOICE',
      isPublished: false,
    },
    select: { id: true },
  })

  // Create all questions in a transaction
  await prisma.$transaction(
    generated.questions.map((q, index) =>
      prisma.question.create({
        data: {
          quizId: quiz.id,
          type: 'SINGLE',
          prompt: q.prompt,
          explanation: q.explanation?.slice(0, 500) || null,
          timeLimitSec: q.timeLimitSec || 20,
          order: index,
          choices: {
            create: q.choices.map((c) => ({
              text: c.text,
              isCorrect: c.isCorrect,
            })),
          },
        },
      })
    )
  )

  revalidatePath('/studio')
  return { ok: true, quizId: quiz.id }
}
