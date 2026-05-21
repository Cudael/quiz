/**
 * prisma/seed.ts — QuizArena database seed
 *
 * Trivia content is authored inline in the style of Open Trivia DB (opentdb.com).
 * No live API calls are made.
 *
 * Usage:
 *   npm run db:seed
 *   # or
 *   npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import { categories, badges, users, quizDefs, questionsByQuiz } from './seed-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database…')

  // ------------------------------------------------------------------
  // Wipe existing data (dependency order: children before parents)
  // ------------------------------------------------------------------
  await prisma.userBadge.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.adminAction.deleteMany()
  await prisma.report.deleteMany()
  await prisma.categorySuggestion.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.playSession.deleteMany()
  await prisma.choice.deleteMany()
  await prisma.question.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('  ✓ Wiped existing rows')

  // ------------------------------------------------------------------
  // Users
  // ------------------------------------------------------------------
  for (const u of users) {
    await prisma.user.create({ data: u })
  }
  console.log(`  ✓ Seeded ${users.length} users`)
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      "  ✓ Admin demo user: admin@quizarena.dev — sign in via Credentials provider with name 'Admin Demo'"
    )
  }

  // ------------------------------------------------------------------
  // Categories
  // ------------------------------------------------------------------
  const categoryMap: Record<string, string> = {} // slug → id
  for (const cat of categories) {
    const created = await prisma.category.create({
      data: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        createdById: users[0].id, // admin
      },
    })
    categoryMap[cat.slug] = created.id
  }
  console.log(`  ✓ Seeded ${categories.length} categories`)

  // ------------------------------------------------------------------
  // Badges
  // ------------------------------------------------------------------
  const badgeMap: Record<string, string> = {} // slug → id
  for (const b of badges) {
    const created = await prisma.badge.create({
      data: {
        slug: b.slug,
        name: b.name,
        description: b.description,
        icon: b.icon,
        criteria: JSON.stringify(b.criteria),
      },
    })
    badgeMap[b.slug] = created.id
  }
  console.log(`  ✓ Seeded ${badges.length} badges`)

  // ------------------------------------------------------------------
  // Quizzes + Questions + Choices
  // ------------------------------------------------------------------
  let totalQuizzes = 0
  let totalQuestions = 0
  const quizMap: Record<string, string> = {} // title → id

  for (const qd of quizDefs) {
    const categoryId = categoryMap[qd.categorySlug]
    if (!categoryId) {
      console.warn(`  ⚠ Unknown category slug: ${qd.categorySlug}`)
      continue
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: qd.title,
        description: qd.description,
        categoryId,
        difficulty: qd.difficulty,
        authorId: qd.authorId,
        isPublished: true,
        playCount: qd.playCount,
        avgScore: qd.avgScore,
      },
    })
    quizMap[qd.title] = quiz.id
    totalQuizzes++

    const questions = questionsByQuiz[qd.title] ?? []
    for (const q of questions) {
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          type: q.type,
          prompt: q.prompt,
          explanation: q.explanation,
          timeLimitSec: q.timeLimitSec,
          order: q.order,
          choices: {
            create: q.choices.map((c) => ({
              text: c.text,
              isCorrect: c.isCorrect,
            })),
          },
        },
      })
      totalQuestions++
    }
  }
  console.log(`  ✓ Seeded ${totalQuizzes} quizzes with ${totalQuestions} questions`)

  // ------------------------------------------------------------------
  // Award badges to demo users
  // ------------------------------------------------------------------
  const badgeAwards: Array<{ userId: string; badgeSlug: string }> = [
    { userId: 'user_admin_quizarena', badgeSlug: 'first-win' },
    { userId: 'user_admin_quizarena', badgeSlug: 'perfect-score' },
    { userId: 'user_admin_quizarena', badgeSlug: 'streak-30' },
    { userId: 'user_admin_quizarena', badgeSlug: 'quiz-author' },
    { userId: 'user_admin_quizarena', badgeSlug: 'centurion' },
    { userId: 'user_demo_alice', badgeSlug: 'first-win' },
    { userId: 'user_demo_alice', badgeSlug: 'streak-7' },
    { userId: 'user_demo_alice', badgeSlug: 'quiz-author' },
    { userId: 'user_demo_alice', badgeSlug: 'speed-demon' },
    { userId: 'user_demo_bob', badgeSlug: 'first-win' },
    { userId: 'user_demo_bob', badgeSlug: 'streak-7' },
    { userId: 'user_demo_carol', badgeSlug: 'first-win' },
    { userId: 'user_demo_carol', badgeSlug: 'night-owl' },
    { userId: 'user_demo_dave', badgeSlug: 'first-win' },
  ]

  let awardedCount = 0
  for (const award of badgeAwards) {
    const badgeId = badgeMap[award.badgeSlug]
    if (!badgeId) {
      console.warn(`  ⚠ Unknown badge slug: ${award.badgeSlug}`)
      continue
    }
    await prisma.userBadge.create({
      data: {
        userId: award.userId,
        badgeId,
      },
    })
    awardedCount++
  }
  console.log(`  ✓ Awarded ${awardedCount} badges to demo users`)

  // ------------------------------------------------------------------
  // Play sessions (for leaderboard data in Phase 5)
  // ------------------------------------------------------------------
  const sessionData: Array<{
    userId: string | null
    guestName: string | null
    quizTitle: string
    score: number
    correctCount: number
    totalCount: number
    timeTakenMs: number
    mode: string
  }> = [
    {
      userId: 'user_demo_alice',
      guestName: null,
      quizTitle: 'Elementary Physics',
      score: 950,
      correctCount: 8,
      totalCount: 8,
      timeTakenMs: 98000,
      mode: 'CLASSIC',
    },
    {
      userId: 'user_demo_bob',
      guestName: null,
      quizTitle: 'World War II',
      score: 780,
      correctCount: 7,
      totalCount: 9,
      timeTakenMs: 140000,
      mode: 'TIMED',
    },
    {
      userId: 'user_demo_carol',
      guestName: null,
      quizTitle: 'World Capitals',
      score: 625,
      correctCount: 6,
      totalCount: 8,
      timeTakenMs: 120000,
      mode: 'CLASSIC',
    },
    {
      userId: 'user_demo_dave',
      guestName: null,
      quizTitle: 'Everyday Trivia',
      score: 875,
      correctCount: 7,
      totalCount: 8,
      timeTakenMs: 85000,
      mode: 'DAILY',
    },
    {
      userId: 'user_admin_quizarena',
      guestName: null,
      quizTitle: 'Internet Basics',
      score: 1000,
      correctCount: 8,
      totalCount: 8,
      timeTakenMs: 62000,
      mode: 'TIMED',
    },
    {
      userId: null,
      guestName: 'QuizFan42',
      quizTitle: 'Console History',
      score: 720,
      correctCount: 6,
      totalCount: 8,
      timeTakenMs: 135000,
      mode: 'CLASSIC',
    },
    {
      userId: null,
      guestName: 'Anonymous',
      quizTitle: 'Intro to Anime',
      score: 800,
      correctCount: 7,
      totalCount: 8,
      timeTakenMs: 110000,
      mode: 'CLASSIC',
    },
    {
      userId: 'user_demo_alice',
      guestName: null,
      quizTitle: 'Periodic Table Challenge',
      score: 670,
      correctCount: 6,
      totalCount: 9,
      timeTakenMs: 152000,
      mode: 'SURVIVAL',
    },
    {
      userId: 'user_demo_bob',
      guestName: null,
      quizTitle: 'Football World Cup',
      score: 890,
      correctCount: 8,
      totalCount: 8,
      timeTakenMs: 95000,
      mode: 'CLASSIC',
    },
    {
      userId: 'user_demo_carol',
      guestName: null,
      quizTitle: 'Mixed Bag',
      score: 750,
      correctCount: 6,
      totalCount: 8,
      timeTakenMs: 118000,
      mode: 'DAILY',
    },
    {
      userId: 'user_demo_alice',
      guestName: null,
      quizTitle: 'Marvel Cinematic Universe',
      score: 925,
      correctCount: 8,
      totalCount: 8,
      timeTakenMs: 88000,
      mode: 'TIMED',
    },
    {
      userId: 'user_admin_quizarena',
      guestName: null,
      quizTitle: 'Programming Languages',
      score: 1000,
      correctCount: 8,
      totalCount: 8,
      timeTakenMs: 55000,
      mode: 'TIMED',
    },
  ]

  let sessionCount = 0
  for (const s of sessionData) {
    const quizId = quizMap[s.quizTitle]
    if (!quizId) {
      console.warn(`  ⚠ Unknown quiz title for session: ${s.quizTitle}`)
      continue
    }
    await prisma.playSession.create({
      data: {
        userId: s.userId,
        guestName: s.guestName,
        quizId,
        score: s.score,
        correctCount: s.correctCount,
        totalCount: s.totalCount,
        timeTakenMs: s.timeTakenMs,
        mode: s.mode,
      },
    })
    sessionCount++
  }
  console.log(`  ✓ Seeded ${sessionCount} play sessions`)

  // ------------------------------------------------------------------
  // Phase 4 moderation seed data
  // ------------------------------------------------------------------
  const suggestionA = await prisma.categorySuggestion.create({
    data: {
      name: 'Space Exploration',
      description: 'Quizzes about missions, astronomy, and space science.',
      icon: 'Rocket',
      color: '#3B82F6',
      suggestedById: 'user_demo_alice',
      status: 'PENDING',
    },
  })
  const suggestionB = await prisma.categorySuggestion.create({
    data: {
      name: 'Mythology',
      description: 'World myths and legendary figures.',
      icon: 'Sparkles',
      color: '#F97316',
      suggestedById: 'user_demo_bob',
      status: 'PENDING',
    },
  })

  const mixedBagQuizId = quizMap['Mixed Bag']
  const internetBasicsQuizId = quizMap['Internet Basics']
  if (!mixedBagQuizId || !internetBasicsQuizId) {
    throw new Error('Expected seed quiz IDs for moderation data were not found.')
  }

  const reportA = await prisma.report.create({
    data: {
      quizId: mixedBagQuizId,
      reporterId: 'user_demo_carol',
      reason: 'INCORRECT_ANSWERS',
      details: 'Question 3 answer appears incorrect.',
      status: 'PENDING',
    },
  })
  const reportB = await prisma.report.create({
    data: {
      quizId: internetBasicsQuizId,
      reporterId: 'user_demo_dave',
      reason: 'SPAM',
      details: 'Looks duplicated from another quiz.',
      status: 'PENDING',
    },
  })

  await prisma.adminAction.create({
    data: {
      actorId: 'user_admin_quizarena',
      action: 'SEED_PHASE4_MODERATION',
      targetType: 'System',
      targetId: 'seed',
      meta: JSON.stringify({
        suggestions: [suggestionA.id, suggestionB.id],
        reports: [reportA.id, reportB.id],
      }),
    },
  })
  console.log('  ✓ Seeded 2 pending category suggestions and 2 pending reports')

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  console.log('\n🎉 Seed complete!')
  console.log('   Categories:', await prisma.category.count())
  console.log('   Quizzes:   ', await prisma.quiz.count())
  console.log('   Questions: ', await prisma.question.count())
  console.log('   Badges:    ', await prisma.badge.count())
  console.log('   Users:     ', await prisma.user.count())
  console.log('   Sessions:  ', await prisma.playSession.count())
  console.log('   Reports:   ', await prisma.report.count())
  console.log('   Suggestions:', await prisma.categorySuggestion.count())
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
