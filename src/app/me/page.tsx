import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueUsername } from '@/lib/usernames'

export default async function MePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, name: true },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  if (!user.username) {
    const username = await generateUniqueUsername(user.name)
    await prisma.user.update({ where: { id: user.id }, data: { username } })
    redirect(`/u/${username}`)
  }

  redirect(`/u/${user.username}`)
}
