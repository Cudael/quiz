// src/app/sign-in/page.tsx
import { SignInForm } from '@/components/auth/sign-in-form'
import { redirect } from 'next/navigation'
import { safeCallbackUrl } from '@/lib/safe-callback-url'
import { auth } from '@/server/auth'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string
    verified?: string
    verification?: string
  }>
}) {
  const { callbackUrl, verified, verification } = await searchParams
  const resolvedCallbackUrl = safeCallbackUrl(callbackUrl, '/')
  const session = await auth()

  if (session?.user) {
    redirect(resolvedCallbackUrl)
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <SignInForm
        callbackUrl={resolvedCallbackUrl}
        googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)}
        githubEnabled={Boolean(process.env.GITHUB_CLIENT_ID)}
        verifiedMessage={
          verified === '1' ? 'Your email has been verified. You can now log in.' : undefined
        }
        verificationError={
          verification === 'expired'
            ? 'This verification link has expired. Request a new verification email.'
            : verification === 'invalid'
              ? 'This verification link is invalid or has already been replaced.'
              : undefined
        }
      />
    </div>
  )
}
