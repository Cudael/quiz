import { SignUpForm } from '@/components/auth/sign-up-form'
import { safeCallbackUrl } from '@/lib/safe-callback-url'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <SignUpForm
      callbackUrl={safeCallbackUrl(callbackUrl, '/me')}
      googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)}
      githubEnabled={Boolean(process.env.GITHUB_CLIENT_ID)}
    />
  )
}
