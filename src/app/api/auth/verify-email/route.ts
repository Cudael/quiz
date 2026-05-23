import { NextResponse } from 'next/server'
import { prisma } from '@/server/prisma'

export async function GET(request: Request) {
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

  if (verificationToken.expires < new Date()) {
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

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  })

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
