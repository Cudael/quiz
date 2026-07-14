import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { parseUserPreferences } from '@/lib/preferences'
import { SettingsClient } from './settings-client'

export default async function MeSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/profile/settings')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      bio: true,
      image: true,
      bannerImage: true,
      passwordHash: true,
      preferences: true,
      accounts: { select: { provider: true } },
    },
  })

  if (!user?.username) {
    redirect('/sign-in?callbackUrl=/profile/settings')
  }

  return (
    <SettingsClient
      initialProfile={{
        username: user.username,
        bio: user.bio ?? '',
        image: user.image ?? '',
        bannerImage: user.bannerImage ?? '',
      }}
      hasPassword={Boolean(user.passwordHash)}
      email={user.email ?? null}
      providers={Array.from(new Set(user.accounts.map((account) => account.provider)))}
      preferences={parseUserPreferences(user.preferences)}
    />
  )
}
