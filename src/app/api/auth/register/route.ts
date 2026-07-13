import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { registerSchema } from '@/schemas'
import { generateUniqueUsername } from '@/lib/usernames'
import { hashPassword } from '@/server/password'
import { issueEmailVerification } from '@/server/email-verification'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'

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

    let delivery: Awaited<ReturnType<typeof issueEmailVerification>> = 'failed'
    try {
      delivery = await issueEmailVerification(email)
    } catch (error) {
      // The account was created successfully. Do not turn a temporary email
      // provider failure into a misleading registration error; the verification
      // page offers a retry once delivery is available again.
      console.error('Could not issue account verification email', error)
    }

    return NextResponse.json({ ok: true, emailSent: delivery === 'sent' }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Unable to register account.' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to register account.' }, { status: 400 })
  }
}
