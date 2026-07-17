import { PrismaClient, type QuizFormat } from '@prisma/client'
import { buildQuestionCreateData, validateAndNormalize } from '../src/server/ai-generate-utils'
import { makeQuestion, TOPICS } from './generate-random-draft-quizzes'

const prisma = new PrismaClient()

function topicForDraft(title: string, tags: string[]) {
  return (
    TOPICS.find((topic) => title.startsWith(`${topic.title}:`)) ??
    TOPICS.find((topic) => topic.tags.some((tag) => tags.includes(tag))) ??
    TOPICS[0]
  )
}

async function main() {
  const targetQuestionCount = Number.parseInt(process.env.TARGET_QUESTIONS_PER_DRAFT ?? '10', 10)
  if (!Number.isFinite(targetQuestionCount) || targetQuestionCount < 1) {
    throw new Error('TARGET_QUESTIONS_PER_DRAFT must be a positive integer.')
  }

  const drafts = await prisma.quiz.findMany({
    where: {
      reviewStatus: 'DRAFT',
      isPublished: false,
      tags: { has: 'random draft' },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      tags: true,
      format: true,
      questions: {
        orderBy: { order: 'asc' },
        select: { order: true },
      },
    },
  })

  let appended = 0
  let touched = 0

  for (const draft of drafts) {
    const currentCount = draft.questions.length
    const missing = Math.max(0, targetQuestionCount - currentCount)
    if (missing === 0) {
      continue
    }

    const topic = topicForDraft(draft.title, draft.tags)
    const nextOrder = draft.questions.at(-1)?.order ?? currentCount - 1
    const format = draft.format as QuizFormat
    const questions = Array.from({ length: missing }, (_, index) =>
      makeQuestion(topic, format, currentCount + index + draft.title.length)
    )
    const normalized = validateAndNormalize(
      { title: draft.title, description: '', questions },
      format
    )

    await prisma.$transaction(
      normalized.questions.map((question, index) =>
        prisma.question.create({
          data: buildQuestionCreateData(question, format, draft.id, nextOrder + index + 1),
        })
      )
    )

    appended += missing
    touched += 1
    console.log(`  Added ${missing} question(s) to ${draft.title}`)
  }

  console.log(
    `Done. Added ${appended} question(s) across ${touched} draft quiz(es); target count is ${targetQuestionCount}.`
  )
}

main()
  .catch((error) => {
    console.error('Appending questions failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
