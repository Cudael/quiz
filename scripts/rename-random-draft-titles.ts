import { PrismaClient, type QuizFormat } from '@prisma/client'
import { generateUniqueSlug } from '../src/lib/slugify'
import { makeSeoDraftTitle, TOPICS } from './generate-random-draft-quizzes'

const prisma = new PrismaClient()

function topicForDraft(title: string, tags: string[]) {
  return (
    TOPICS.find((topic) => title.startsWith(`${topic.title}:`)) ??
    TOPICS.find((topic) => topic.tags.some((tag) => tags.includes(tag))) ??
    TOPICS[0]
  )
}

async function main() {
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
    },
  })

  let renamed = 0
  for (const [index, draft] of drafts.entries()) {
    const topic = topicForDraft(draft.title, draft.tags)
    const title = makeSeoDraftTitle(topic, draft.format as QuizFormat, index)
    const slug = await generateUniqueSlug(title, (candidate) =>
      prisma.quiz
        .findFirst({
          where: {
            slug: candidate,
            NOT: { id: draft.id },
          },
          select: { id: true },
        })
        .then(Boolean)
    )

    await prisma.quiz.update({
      where: { id: draft.id },
      data: { title, slug },
    })

    renamed += 1
    console.log(`  ${renamed}. ${draft.title} -> ${title}`)
  }

  console.log(`Done. Renamed ${renamed} draft quiz title(s).`)
}

main()
  .catch((error) => {
    console.error('Renaming draft titles failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
