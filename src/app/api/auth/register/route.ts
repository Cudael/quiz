import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { registerSchema } from '@/schemas'
import { generateUniqueUsername } from '@/lib/usernames'
import { hashPassword } from '@/server/password'
import { sendVerificationEmail } from '@/server/email'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'
import { hashToken } from '@/server/token-hash'
import { absoluteUrl } from '@/lib/site'

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  if (
    !(await checkRateLimit(`register:${getClientIp(request)}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    }))
  ) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

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
    // Same status code and message as all other registration failures so the
    // response does not reveal whether an email address is already registered.
    return NextResponse.json({ error: 'Unable to register account.' }, { status: 400 })
  }

  try {
    const passwordHash = await hashPassword(password)
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER',
        username: await generateUniqueUsername(name),
      },
      select: { id: true },
    })

    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = hashToken(rawToken)
    const expires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenHash,
        expires,
      },
    })

    const verifyUrl = new URL(absoluteUrl('/api/auth/verify-email'))
    verifyUrl.searchParams.set('token', rawToken)
    await sendVerificationEmail(email, verifyUrl.toString())
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Unable to register account.' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to register account.' }, { status: 400 })
  }

  // Registration successful. Email verification is sent asynchronously.
  return NextResponse.json({ ok: true }, { status: 201 })
}
