import type { Prisma, PrismaClient, QuestPeriod } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { levelForXp } from '@/domain/leveling'
import {
  getQuestPeriodKey,
  parseQuestCriteria,
  questProgressDelta,
  questTarget,
  type QuestEvent,
} from '@/domain/quests'

type DbClient = PrismaClient | Prisma.TransactionClient

export interface DefaultQuestSeed {
  slug: string
  title: string
  description: string
  criteria: Prisma.InputJsonValue
  xpReward: number
  period: QuestPeriod
}

export const DEFAULT_QUESTS: DefaultQuestSeed[] = [
  {
    slug: 'daily-warmup',
    title: 'Daily Warm-up',
    description: 'Play 3 quizzes today.',
    criteria: { type: 'playQuizzes', count: 3 },
    xpReward: 30,
    period: 'DAILY',
  },
  {
    slug: 'daily-perfect',
    title: 'Flawless',
    description: 'Get a perfect score today.',
    criteria: { type: 'perfectScores', count: 1 },
    xpReward: 50,
    period: 'DAILY',
  },
  {
    slug: 'weekly-science',
    title: 'Lab Rat',
    description: 'Play 3 Science quizzes this week.',
    criteria: { type: 'playQuizzes', count: 3, categorySlug: 'science' },
    xpReward: 75,
    period: 'WEEKLY',
  },
  {
    slug: 'weekly-duelist',
    title: 'Duelist',
    description: 'Win 2 duels this week.',
    criteria: { type: 'winDuels', count: 2 },
    xpReward: 100,
    period: 'WEEKLY',
  },
  {
    slug: 'weekly-grind',
    title: 'XP Grind',
    description: 'Earn 300 XP this week.',
    criteria: { type: 'earnXp', amount: 300 },
    xpReward: 75,
    period: 'WEEKLY',
  },
  {
    slug: 'monthly-marathon',
    title: 'Quiz Marathon',
    description: 'Play 30 quizzes this month.',
    criteria: { type: 'playQuizzes', count: 30 },
    xpReward: 250,
    period: 'MONTHLY',
  },
]

/** Idempotently create the default quest set if the table is empty. */
export async function ensureDefaultQuests() {
  const count = await prisma.quest.count()
  if (count > 0) return
  await prisma.quest.createMany({
    data: DEFAULT_QUESTS,
    skipDuplicates: true,
  })
}

export interface QuestBoardEntry {
  id: string
  slug: string
  title: string
  description: string
  period: QuestPeriod
  xpReward: number
  target: number
  progress: number
  completed: boolean
  periodKey: string
}

export async function getQuestBoard(userId: string | null, now = new Date()) {
  const quests = await prisma.quest.findMany({
    where: { isActive: true },
    orderBy: [{ period: 'asc' }, { createdAt: 'asc' }],
  })

  const keysByQuest = new Map(
    quests.map((quest) => [quest.id, getQuestPeriodKey(quest.period, now)])
  )

  const userQuests = userId
    ? await prisma.userQuest.findMany({
        where: {
          userId,
          OR: quests.map((quest) => ({
            questId: quest.id,
            periodKey: keysByQuest.get(quest.id)!,
          })),
        },
      })
    : []

  const progressByQuest = new Map(userQuests.map((entry) => [entry.questId, entry]))

  return quests.flatMap<QuestBoardEntry>((quest) => {
    const criteria = parseQuestCriteria(quest.criteria)
    if (!criteria) return []
    const entry = progressByQuest.get(quest.id)
    const target = questTarget(criteria)
    return [
      {
        id: quest.id,
        slug: quest.slug,
        title: quest.title,
        description: quest.description,
        period: quest.period,
        xpReward: quest.xpReward,
        target,
        progress: Math.min(entry?.progress ?? 0, target),
        completed: Boolean(entry?.completedAt),
        periodKey: keysByQuest.get(quest.id)!,
      },
    ]
  })
}

export interface CompletedQuestInfo {
  questId: string
  slug: string
  title: string
  xpReward: number
}

/**
 * Apply a quest progress event for a user inside an existing transaction.
 * Completing a quest grants its XP reward and recomputes the user level.
 * Returns quests completed by this event (for notifications).
 */
export async function recordQuestEventWithClient(
  client: DbClient,
  userId: string,
  event: QuestEvent,
  now = new Date()
): Promise<CompletedQuestInfo[]> {
  const quests = await client.quest.findMany({ where: { isActive: true } })
  const completed: CompletedQuestInfo[] = []

  for (const quest of quests) {
    const criteria = parseQuestCriteria(quest.criteria)
    if (!criteria) continue

    const delta = questProgressDelta(criteria, event)
    if (delta <= 0) continue

    const target = questTarget(criteria)
    const periodKey = getQuestPeriodKey(quest.period, now)

    const existing = await client.userQuest.findUnique({
      where: { userId_questId_periodKey: { userId, questId: quest.id, periodKey } },
    })

    if (existing?.completedAt) continue

    const newProgress = Math.min(target, (existing?.progress ?? 0) + delta)
    const justCompleted = newProgress >= target

    await client.userQuest.upsert({
      where: { userId_questId_periodKey: { userId, questId: quest.id, periodKey } },
      create: {
        userId,
        questId: quest.id,
        periodKey,
        progress: newProgress,
        target,
        completedAt: justCompleted ? now : null,
      },
      update: {
        progress: newProgress,
        completedAt: justCompleted ? now : null,
      },
    })

    if (justCompleted) {
      completed.push({
        questId: quest.id,
        slug: quest.slug,
        title: quest.title,
        xpReward: quest.xpReward,
      })
    }
  }

  if (completed.length > 0) {
    const bonusXp = completed.reduce((sum, quest) => sum + quest.xpReward, 0)
    const user = await client.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    })
    if (user) {
      const updatedXp = user.xp + bonusXp
      await client.user.update({
        where: { id: userId },
        data: { xp: updatedXp, level: levelForXp(updatedXp) },
      })
    }

    await client.notification.createMany({
      data: completed.map((quest) => ({
        userId,
        type: 'QUEST_COMPLETED' as const,
        title: 'Quest complete!',
        message: `You finished “${quest.title}” and earned ${quest.xpReward} XP.`,
        meta: { questId: quest.questId, slug: quest.slug, xpReward: quest.xpReward },
      })),
    })
  }

  return completed
}
