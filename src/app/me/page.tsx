import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { generateUniqueUsername } from '@/lib/usernames'

export default async function MePage() {
  const session = await auth()
  const signInPath = '/api/auth/signin?callbackUrl=/me'

  if (!session?.user?.id) {
    redirect(signInPath)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, name: true },
  })

  if (!user) {
    redirect(signInPath)
  }

  if (!user.username) {
    const username = await generateUniqueUsername(user.name)
    await prisma.user.update({ where: { id: user.id }, data: { username } })
    redirect(`/u/${username}`)
  }

  redirect(`/u/${user.username}`)
}
