import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { meDeleteSchema } from '@/schemas'

const GENERIC_ERROR = 'Unable to delete account.'

export async function DELETE(request: Request) {
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

  const parsed = meDeleteSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, quizzes: { select: { id: true }, take: 1 } },
  })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const normalizedConfirm = parsed.data.confirmUsername.replace(/^@/, '')
  if (normalizedConfirm !== user.username) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  if (user.quizzes.length > 0) {
    return NextResponse.json(
      { error: 'Unable to delete account while published or draft quizzes still exist.' },
      { status: 400 }
    )
  }

  await prisma.user.delete({
    where: { id: session.user.id },
  })

  const cookieStore = await cookies()
  for (const cookieName of [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
  ]) {
    cookieStore.delete(cookieName)
  }

  return NextResponse.json({ ok: true })
}
