import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * One-off migration: recompute PlaySession.score and Quiz.avgScore under the
 * new flat-scoring formula (10 points per correct answer), so the leaderboard
 * and per-quiz stats aren't permanently skewed by sessions scored under the
 * old up-to-200-points-per-question formula.
 *
 * Historical QuestionAnswer.isCorrect is a boolean, not fractional credit, so
 * old partial-credit nuance (ORDER/MATCH/GROUPS/NUMBER_GUESS) can't be
 * recovered exactly — this approximates using correctCount * 10.
 */
async function main() {
  console.log('Backfilling PlaySession.score to correctCount * 10...')

  const sessions = await prisma.playSession.findMany({
    select: { id: true, correctCount: true, score: true },
  })
  console.log(`Found ${sessions.length} play sessions.`)

  let updated = 0
  for (const session of sessions) {
    const newScore = session.correctCount * 10
    if (newScore === session.score) continue

    await prisma.playSession.update({
      where: { id: session.id },
      data: { score: newScore },
    })
    updated++
    if (updated % 100 === 0) {
      console.log(`  Updated ${updated} sessions...`)
    }
  }
  console.log(`Done. Updated ${updated} of ${sessions.length} play sessions.`)

  console.log('\nRecomputing Quiz.avgScore from corrected scores...')
  const quizzes = await prisma.quiz.findMany({ select: { id: true } })
  console.log(`Found ${quizzes.length} quizzes.`)

  let quizzesUpdated = 0
  for (const quiz of quizzes) {
    const agg = await prisma.playSession.aggregate({
      where: { quizId: quiz.id, mode: { not: 'PRACTICE' } },
      _avg: { score: true },
    })
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { avgScore: agg._avg.score ?? 0 },
    })
    quizzesUpdated++
    if (quizzesUpdated % 20 === 0) {
      console.log(`  Recomputed ${quizzesUpdated} quizzes...`)
    }
  }
  console.log(`Done. Recomputed avgScore for ${quizzesUpdated} quizzes.`)
}

main()
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
