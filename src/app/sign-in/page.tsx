import { SignInForm } from '@/components/auth/sign-in-form'
import { safeCallbackUrl } from '@/lib/safe-callback-url'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; verified?: string }>
}) {
  const { callbackUrl, verified } = await searchParams

  return (
    <SignInForm
      callbackUrl={safeCallbackUrl(callbackUrl, '/me')}
      googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)}
      githubEnabled={Boolean(process.env.GITHUB_CLIENT_ID)}
      verifiedMessage={
        verified === '1' ? 'Email verified. You can now sign in with your credentials.' : undefined
      }
    />
  )
}
