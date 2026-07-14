import { NextResponse } from 'next/server'
import { auth, unstable_update } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { safeCallbackUrl } from '@/lib/safe-callback-url'

/** Repairs a stale JWT after the database username claim has already succeeded. */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const callbackUrl = safeCallbackUrl(requestUrl.searchParams.get('callbackUrl') ?? undefined, '/')
  const session = await auth()

  if (!session?.user?.id) {
    const signInUrl = new URL('/sign-in', requestUrl.origin)
    signInUrl.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(signInUrl)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  if (!user?.username) {
    const onboardingUrl = new URL('/choose-username', requestUrl.origin)
    onboardingUrl.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(onboardingUrl)
  }

  await unstable_update({ user: { username: user.username } })
  return NextResponse.redirect(new URL(callbackUrl, requestUrl.origin))
}
