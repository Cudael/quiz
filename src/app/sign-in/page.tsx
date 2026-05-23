import { SignInForm } from '@/components/auth/sign-in-form'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; verified?: string }>
}) {
  const { callbackUrl, verified } = await searchParams

  return (
    <SignInForm
      callbackUrl={callbackUrl || '/me'}
      googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)}
      githubEnabled={Boolean(process.env.GITHUB_CLIENT_ID)}
      verifiedMessage={
        verified === '1' ? 'Email verified. You can now sign in with your credentials.' : undefined
      }
    />
  )
}
