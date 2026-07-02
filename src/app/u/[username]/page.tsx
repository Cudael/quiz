import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Avatar } from '@/components/ui/avatar'
import { LevelProgress } from '@/components/ui/level-progress'
import { StreakFlame } from '@/components/ui/streak-flame'
import { BadgesGrid } from '@/components/ui/badges-grid'
import { absoluteUrl } from '@/lib/site'
import { serializeJsonLd } from '@/lib/seo'
import { toggleFollowAction } from './follow-actions'
import { PublishedQuizzes } from './_components/published-quizzes'
import { RecentSessions } from './_components/recent-sessions'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true, level: true, badges: { select: { badgeId: true } } },
  })

  if (!user) {
    return {
      title: 'Profile not found | BusQuiz',
      description: 'This player profile could not be found.',
    }
  }

  const title = `${user.name} (@${user.username}) on BusQuiz — Level ${user.level}, ${user.badges.length} badges`
  const description = `See ${user.name}'s stats, streaks, badges, and recent quiz sessions.`
  const url = absoluteUrl(`/u/${user.username}`)
  return {
    title,
    description,
    alternates: {
      canonical: `/u/${user.username}`,
    },
    openGraph: { title, description, url },
    twitter: { card: 'summary_large_image', title, description },
  }
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
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }
  if (!user.username) {
    notFound()
  }
  const profileUsername = user.username
  const profileJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${user.name} on BusQuiz`,
    url: absoluteUrl(`/u/${profileUsername}`),
    mainEntity: {
      '@type': 'Person',
      name: user.name,
      alternateName: profileUsername,
      image: user.image ?? undefined,
      url: absoluteUrl(`/u/${profileUsername}`),
    },
  }

  const [rawBadges, badgeLeaders, isFollowing] = await Promise.all([
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

  const allBadges = rawBadges.map((badge) => ({
    ...badge,
    criteria: typeof badge.criteria === 'string' ? badge.criteria : JSON.stringify(badge.criteria),
  }))

  const leadersByBadge = Object.fromEntries(
    badgeLeaders.map((badge) => [badge.id, badge.awards.map((award) => award.user)])
  )

  const isSelf = session?.user?.id === user.id
  const hasBio = Boolean(user.bio?.trim())

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileJsonLd) }}
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-md border border-border bg-card p-6">
          {user.bannerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.bannerImage}
              alt={`${user.name}'s banner`}
              className="mb-6 h-32 w-full rounded-md object-cover"
            />
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar src={user.image} alt={user.name} fallback={user.name} size="xl" />
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  Joined{' '}
                  {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(user.createdAt)}
                </p>
                {hasBio ? <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p> : null}
              </div>
            </div>

            {!isSelf && session?.user?.id && (
              <form action={toggleFollowAction.bind(null, user.id, profileUsername)}>
                <button
                  type="submit"
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
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
              {user.duelGames > 0 ? (
                <div className="rounded-md border border-border p-3 text-sm">
                  <p className="text-muted-foreground">Duel Rating</p>
                  <p className="text-xl font-semibold">
                    {user.duelRating}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {user.duelGames} rated {user.duelGames === 1 ? 'duel' : 'duels'}
                    </span>
                  </p>
                </div>
              ) : null}
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="text-muted-foreground">Followers</p>
                <p className="text-xl font-semibold">{user._count.followers}</p>
              </div>
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="text-muted-foreground">Following</p>
                <p className="text-xl font-semibold">{user._count.following}</p>
              </div>
            </div>
          </div>
        </section>

        <RecentSessions sessions={user.sessions} />
      </div>

      <section className="mt-6 rounded-md border border-border bg-card p-6">
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

      <PublishedQuizzes quizzes={user.quizzes} />
    </div>
  )
}
