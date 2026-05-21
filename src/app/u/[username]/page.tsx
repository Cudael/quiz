import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { LevelProgress } from '@/components/ui/level-progress'
import { StreakFlame } from '@/components/ui/streak-flame'
import { BadgesGrid } from '@/components/ui/badges-grid'

async function toggleFollowAction(targetUserId: string, username: string) {
  'use server'

  const session = await auth()
  if (!session?.user?.id || session.user.id === targetUserId) return

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
    select: { followerId: true },
  })

  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    })
  } else {
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    })
  }

  revalidatePath(`/u/${username}`)
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const session = await auth()

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      badges: {
        include: {
          badge: true,
        },
        orderBy: { awardedAt: 'desc' },
      },
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          quiz: {
            include: {
              category: true,
            },
          },
        },
      },
      quizzes: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          category: true,
        },
      },
      followers: true,
      following: true,
    },
  })

  if (!user) {
    notFound()
  }
  if (!user.username) {
    notFound()
  }
  const profileUsername = user.username

  const [allBadges, badgeLeaders, isFollowing] = await Promise.all([
    prisma.badge.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true, description: true, criteria: true },
    }),
    prisma.badge.findMany({
      select: {
        id: true,
        awards: {
          orderBy: { awardedAt: 'asc' },
          take: 8,
          select: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    }),
    session?.user?.id
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: user.id,
            },
          },
          select: { followerId: true },
        })
      : null,
  ])

  const leadersByBadge = Object.fromEntries(
    badgeLeaders.map((badge) => [badge.id, badge.awards.map((award) => award.user)])
  )

  const isSelf = session?.user?.id === user.id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-quiz-purple to-quiz-pink text-xl font-bold text-white">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  user.name
                    .split(' ')
                    .map((chunk) => chunk[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  Joined{' '}
                  {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(user.createdAt)}
                </p>
              </div>
            </div>

            {!isSelf && session?.user?.id && (
              <form action={toggleFollowAction.bind(null, user.id, profileUsername)}>
                <button
                  type="submit"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <LevelProgress xp={user.xp} size="lg" />
            </div>
            <div className="space-y-4">
              <StreakFlame value={user.streakDays} best={user.bestStreak} size="lg" />
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="text-muted-foreground">Followers</p>
                <p className="text-xl font-semibold">{user.followers.length}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="text-muted-foreground">Following</p>
                <p className="text-xl font-semibold">{user.following.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Sessions</h2>
          <div className="space-y-3">
            {user.sessions.map((sessionRow) => {
              const accuracy =
                sessionRow.totalCount > 0
                  ? Math.round((sessionRow.correctCount / sessionRow.totalCount) * 100)
                  : 0
              return (
                <div key={sessionRow.id} className="rounded-lg border border-border p-3 text-sm">
                  <p className="font-medium">{sessionRow.quiz.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {sessionRow.mode} • {sessionRow.score} pts • {accuracy}% accuracy
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(sessionRow.createdAt)}
                  </p>
                </div>
              )
            })}
            {user.sessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Badges</h2>
        <BadgesGrid
          badges={allBadges}
          earnedBadges={user.badges.map((badge) => ({
            badgeId: badge.badgeId,
            awardedAt: badge.awardedAt.toISOString(),
          }))}
          badgeLeaders={leadersByBadge}
        />
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Published Quizzes</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {user.quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/quiz/${quiz.id}`}
              className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
            >
              <p className="font-medium">{quiz.title}</p>
              <p className="text-xs text-muted-foreground">
                {quiz.category.name} • {quiz.difficulty}
              </p>
            </Link>
          ))}
          {user.quizzes.length === 0 && (
            <p className="text-sm text-muted-foreground">No published quizzes yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
