import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { registerSchema } from '@/schemas'
import { generateUniqueUsername } from '@/lib/usernames'
import { hashPassword } from '@/server/password'

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Unable to register account.' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Unable to register account.' }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    return NextResponse.json({ error: 'Unable to register account.' }, { status: 409 })
  }

  try {
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER',
        username: await generateUniqueUsername(name),
      },
      select: { id: true, email: true },
    })

    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    const verifyUrl = new URL('/api/auth/verify-email', request.url)
    verifyUrl.searchParams.set('token', token)
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Verification email placeholder generated', { userId: user.id })
      console.log('Verification URL (dev/test only)', verifyUrl.toString())
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Unable to register account.' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Unable to register account.' }, { status: 400 })
  }

  // TODO: add email verification and password reset flows in a follow-up PR.
  return NextResponse.json({ ok: true }, { status: 201 })
}
