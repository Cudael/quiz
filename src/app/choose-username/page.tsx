import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { safeCallbackUrl } from '@/lib/safe-callback-url'

export const metadata: Metadata = {
  title: 'Choose your username',
  robots: { index: false, follow: false },
}

export default async function ChooseUsernamePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>
}) {
  const query = await searchParams
  const rawCallbackUrl = Array.isArray(query.callbackUrl) ? query.callbackUrl[0] : query.callbackUrl
  const callbackUrl = safeCallbackUrl(rawCallbackUrl, '/')
  const session = await auth()

  if (!session?.user?.id) {
    const signInUrl = new URL('/sign-in', process.env.NEXTAUTH_URL ?? 'http://localhost')
    signInUrl.searchParams.set(
      'callbackUrl',
      `/choose-username?callbackUrl=${encodeURIComponent(callbackUrl)}`
    )
    redirect(`${signInUrl.pathname}${signInUrl.search}`)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  if (user?.username) {
    redirect(callbackUrl)
  }

  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12">
      <div className="w-full rounded-md border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Finish setting up your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a unique public username in the dialog to continue using BusQuiz.
        </p>
      </div>
    </main>
  )
}
