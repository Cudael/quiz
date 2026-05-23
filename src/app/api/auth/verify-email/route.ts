import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'

export async function GET(request: Request) {
  const now = new Date()
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
    select: { identifier: true, expires: true, token: true },
  })

  if (!verificationToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
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
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  try {
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: now },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.warn('Verification token used for missing user email', {
        identifier: verificationToken.identifier,
      })
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
