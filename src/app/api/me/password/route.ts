import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { hashPassword, verifyPassword } from '@/server/password'
import { mePasswordSchema } from '@/schemas'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

const GENERIC_ERROR = 'Unable to change password.'

export async function POST(request: Request) {
  if (!(await checkRateLimit(`password:${getClientIp(request)}`, { limit: 5, windowMs: 15 * 60 * 1000 }))) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

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

  const parsed = mePasswordSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })

  if (!user?.passwordHash) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const matches = await verifyPassword(parsed.data.currentPassword, user.passwordHash)
  if (!matches) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const passwordHash = await hashPassword(parsed.data.newPassword)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  })

  return NextResponse.json({ ok: true })
}
