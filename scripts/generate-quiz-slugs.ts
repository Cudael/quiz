import { PrismaClient } from '@prisma/client'
import { generateUniqueSlug } from '../src/lib/slugify'

const prisma = new PrismaClient()

async function main() {
  console.log('Generating slugs for existing quizzes...')

  const quizzes = await prisma.quiz.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`Found ${quizzes.length} quizzes to process.`)

  const existingSlugs = new Set<string>()

  // Pre-populate with any existing slugs
  const existing = await prisma.quiz.findMany({
    where: { slug: { not: '' } },
    select: { id: true, slug: true },
  })
  for (const q of existing) {
    existingSlugs.add(q.slug)
  }

  let updated = 0
  let skipped = 0

  for (const quiz of quizzes) {
    // Skip if already has a slug
    if (existingSlugs.has(quiz.id)) {
      skipped++
      continue
    }

    const slug = await generateUniqueSlug(quiz.title, async (s) => existingSlugs.has(s))
    existingSlugs.add(slug)

    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { slug },
    })

    updated++
    if (updated % 10 === 0) {
      console.log(`  Updated ${updated} quizzes...`)
    }
  }

  console.log(`Done! Updated ${updated} quizzes, skipped ${skipped}.`)
}

main()
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
