import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { usernameSchema } from '@/schemas'

const claimSchema = z.object({ username: usernameSchema })

/**
 * One-time username claim for accounts created without one (OAuth sign-ups).
 * Later changes go through the regular profile PATCH.
 */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = claimSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          'Username must be 3-32 characters, using lowercase letters and numbers, with hyphens only between segments.',
      },
      { status: 400 }
    )
  }
  const { username } = parsed.data

  // The session caches the profile for a few minutes — check the database,
  // not the token, before treating this as a first-time claim.
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })
  if (!me) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  if (me.username) {
    return NextResponse.json(
      { error: 'Username is already set. You can change it in profile settings.' },
      { status: 400 }
    )
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { username },
      select: { id: true },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 400 })
    }
    throw error
  }

  return NextResponse.json({ ok: true, username })
}
