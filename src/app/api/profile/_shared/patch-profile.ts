import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { meProfileSchema } from '@/schemas'
import { slugify } from '@/lib/slugify'

const GENERIC_ERROR = 'Unable to update profile.'

export async function patchProfile(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const parsed = meProfileSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const username = slugify(parsed.data.username)
  if (!username) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "User"
    WHERE LOWER("username") = LOWER(${username})
      AND id != ${session.user.id}
    LIMIT 1
  `

  if (existing.length > 0) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username,
      bio: parsed.data.bio || null,
      image: parsed.data.image || null,
      bannerImage: parsed.data.bannerImage || null,
    },
  })

  if (currentUser.username && currentUser.username !== username) {
    revalidatePath(`/u/${currentUser.username}`)
  }
  revalidatePath(`/u/${username}`)
  revalidatePath('/profile')

  return NextResponse.json({ ok: true, username })
}
