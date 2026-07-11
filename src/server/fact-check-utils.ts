import { prisma } from '@/server/prisma'
import { formatCorrectAnswer } from '@/domain/format-correct-answer'

export interface FactCheckQuestionInput {
  order: number
  type: string
  prompt: string
  explanation: string | null
  meta: Record<string, unknown> | null
  choices: { text: string; isCorrect: boolean; meta: Record<string, unknown> | null }[]
}

export type FactCheckVerdictLabel = 'correct' | 'suspect' | 'unsure'

export interface FactCheckVerdict {
  questionOrder: number
  verdict: FactCheckVerdictLabel
  reasoning: string
  suggestedAnswer: string | null
}

const VALID_VERDICTS: FactCheckVerdictLabel[] = ['correct', 'suspect', 'unsure']

function buildFactCheckPrompt(quizTitle: string, questions: FactCheckQuestionInput[]): string {
  const questionBlocks = questions
    .map((q) => {
      const choiceLines =
        q.choices.length > 0
          ? q.choices
              .map((c) => `  - ${c.text}${c.isCorrect ? ' [MARKED CORRECT]' : ''}`)
              .join('\n')
          : '  (no discrete choices for this question type)'
      return `Question order=${q.order} [${q.type}]: ${q.prompt}
Stated correct answer: ${formatCorrectAnswer(q)}
Choices:
${choiceLines}${q.explanation ? `\nGiven explanation: ${q.explanation}` : ''}`
    })
    .join('\n\n')

  return `You are fact-checking a trivia quiz titled "${quizTitle}". For each question below, decide whether the answer marked correct is actually, factually correct.

${questionBlocks}

For each question, return one verdict:
- "correct" — the marked answer is factually right.
- "suspect" — you are confident the marked answer is wrong, or one of the other choices is actually more correct.
- "unsure" — the question is ambiguous, opinion-based, outdated, or you cannot verify it confidently.

Respond with only valid JSON in this exact shape, no markdown, no extra text:
{"verdicts": [{"questionOrder": number, "verdict": "correct" | "suspect" | "unsure", "reasoning": "one or two sentence explanation", "suggestedAnswer": string or null}]}

Use the exact "order" value shown for each question as its questionOrder in your response — do not renumber. Only set "suggestedAnswer" when verdict is "suspect", giving what you believe the correct answer actually is. Return exactly one verdict per question.`
}

export async function factCheckQuestions(
  quizTitle: string,
  questions: FactCheckQuestionInput[]
): Promise<FactCheckVerdict[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const prompt = buildFactCheckPrompt(quizTitle, questions)

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
            'You are a meticulous fact-checker reviewing trivia quiz answers. Return only valid JSON with no markdown formatting, no code fences, no extra text.',
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

  const parsed = JSON.parse(content) as { verdicts?: unknown }
  if (!Array.isArray(parsed.verdicts)) {
    throw new Error('OpenAI returned an invalid fact-check structure')
  }

  const results: FactCheckVerdict[] = []

  for (const raw of parsed.verdicts) {
    if (typeof raw !== 'object' || raw === null) continue
    const item = raw as Record<string, unknown>
    const questionOrder = Number(item.questionOrder)
    const verdict = VALID_VERDICTS.includes(item.verdict as FactCheckVerdictLabel)
      ? (item.verdict as FactCheckVerdictLabel)
      : null
    if (!Number.isFinite(questionOrder) || !verdict) continue

    results.push({
      questionOrder,
      verdict,
      reasoning: typeof item.reasoning === 'string' ? item.reasoning : '',
      suggestedAnswer: typeof item.suggestedAnswer === 'string' ? item.suggestedAnswer : null,
    })
  }

  if (results.length === 0) {
    throw new Error('OpenAI returned no usable verdicts')
  }

  return results
}

export interface LatestFactCheck {
  checkedAt: string
  flaggedCount: number
  totalQuestions: number
}

/** Latest AI fact-check per quiz, derived from the AdminAction audit log —
 *  every fact-check run already logs one, so no separate table is needed. */
export async function getLatestFactChecks(
  quizIds: string[]
): Promise<Record<string, LatestFactCheck>> {
  if (quizIds.length === 0) return {}

  const actions = await prisma.adminAction.findMany({
    where: {
      action: 'QUIZ_AI_FACT_CHECK',
      targetType: 'Quiz',
      targetId: { in: quizIds },
    },
    orderBy: { createdAt: 'desc' },
    select: { targetId: true, createdAt: true, meta: true },
  })

  const result: Record<string, LatestFactCheck> = {}
  for (const action of actions) {
    if (result[action.targetId]) continue // already recorded the most recent run
    const meta = action.meta as { totalQuestions?: number; flaggedCount?: number } | null
    result[action.targetId] = {
      checkedAt: action.createdAt.toISOString(),
      flaggedCount: typeof meta?.flaggedCount === 'number' ? meta.flaggedCount : 0,
      totalQuestions: typeof meta?.totalQuestions === 'number' ? meta.totalQuestions : 0,
    }
  }
  return result
}
