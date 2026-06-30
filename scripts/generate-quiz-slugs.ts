import { PrismaClient } from '@prisma/client'
import { generateUniqueSlug } from '../src/lib/slugify'

const prisma = new PrismaClient()

async function main() {
  console.log('Generating slugs for existing quizzes...')

  const quizzes = await prisma.quiz.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`Found ${quizzes.length} quizzes to process.`)

  const existingSlugs = new Set<string>()

  // Pre-populate with clean existing slugs (no numeric suffixes)
  for (const q of quizzes) {
    if (q.slug && !/-\d+$/.test(q.slug)) existingSlugs.add(q.slug)
  }

  let updated = 0
  let skipped = 0

  for (const quiz of quizzes) {
    // Skip if already has a clean slug (no numeric suffix)
    if (quiz.slug && !/-\d+$/.test(quiz.slug)) {
      existingSlugs.add(quiz.slug)
      skipped++
      continue
    }

    // Regenerate slug for quizzes with no slug or with numeric suffix (e.g. -2, -3)
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
