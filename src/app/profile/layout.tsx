import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { Avatar } from '@/components/ui/avatar'
import { StreakFlame } from '@/components/ui/streak-flame'
import { ProfileSidebar } from './profile-sidebar'
import { ShareProfileButton } from './share-profile-button'
import { xpProgress } from '@/domain/leveling'
import { Settings, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { default: 'My Profile', template: '%s | BusQuiz' },
  robots: { index: false },
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/profile')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      image: true,
      xp: true,
      streakDays: true,
      bestStreak: true,
      createdAt: true,
    },
  })

  if (!user?.username) {
    redirect('/sign-in?callbackUrl=/profile')
  }

  const progress = xpProgress(user.xp)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="flex flex-col gap-8">
        {/* Unified Top Profile Banner Card */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
          {/* Faded Background Pattern for Premium Feel */}
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-quiz-purple/5 blur-3xl" />
          <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-quiz-orange/5 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* User Meta */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative mx-auto sm:mx-0 shrink-0">
                <Avatar
                  src={user.image}
                  fallback={user.name}
                  size="xl"
                  className="h-20 w-20 border-2 border-border shadow"
                />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-16 items-center justify-center rounded-full bg-quiz-purple px-1.5 py-0.5 text-[10px] font-black tracking-wider text-white shadow ring-2 ring-card uppercase">
                  Lv. {progress.level}
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                  <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
                  <span className="mx-auto sm:mx-0 inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/65 px-2 py-0.5 rounded-full font-semibold">
                    @{user.username}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Member since{' '}
                  {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(user.createdAt)}
                </p>
                {user.streakDays > 0 && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-quiz-orange/5 border border-quiz-orange/15 px-3 py-1 text-xs font-bold text-quiz-orange shadow-sm">
                    <StreakFlame value={user.streakDays} size="sm" />
                    <span>{user.streakDays}-day streak</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions (Share, Public Profile, Edit) */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <ShareProfileButton username={user.username} />
              <Button asChild variant="outline" className="rounded-xl shadow-sm">
                <Link href={`/u/${user.username}`}>
                  <ExternalLink className="mr-1.5 h-4 w-full sm:w-4 shrink-0 text-muted-foreground" />
                  Public View
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl shadow-sm">
                <Link href="/profile/settings">
                  <Settings className="mr-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Horizontal Navigation Row */}
        <section className="border-b border-border/40 pb-px">
          <ProfileSidebar />
        </section>

        {/* Child Router Content views */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
