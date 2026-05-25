// src/app/sign-up/page.tsx
import { SignUpForm } from '@/components/auth/sign-up-form'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <SignUpForm
        callbackUrl={callbackUrl || '/me'}
        googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)}
        githubEnabled={Boolean(process.env.GITHUB_CLIENT_ID)}
      />
    </div>
  )
}
