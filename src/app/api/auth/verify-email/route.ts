import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { hashToken } from '@/server/token-hash'

function redirectToSignIn(request: Request, verification?: 'invalid' | 'expired') {
  const url = new URL('/sign-in', request.url)
  if (verification) url.searchParams.set('verification', verification)
  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
  const now = new Date()
  const { searchParams } = new URL(request.url)
  const rawToken = searchParams.get('token')
  if (!rawToken) {
    return redirectToSignIn(request, 'invalid')
  }

  const tokenHash = hashToken(rawToken)
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
    select: { identifier: true, expires: true, token: true },
  })

  if (!verificationToken) {
    return redirectToSignIn(request, 'invalid')
  }

  if (verificationToken.expires < now) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    })
    return redirectToSignIn(request, 'expired')
  }

  try {
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: now },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.warn('Email verification failed: user account not found for identifier')
    } else {
      throw error
    }
  }

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      },
    },
  })

  const redirectUrl = new URL('/sign-in', request.url)
  redirectUrl.searchParams.set('verified', '1')
  return NextResponse.redirect(redirectUrl)
}
