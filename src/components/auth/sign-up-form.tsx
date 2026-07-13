'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, MailCheck } from 'lucide-react'
import { OauthProviderButtons } from '@/components/auth/oauth-provider-buttons'
import { VerificationEmailForm } from '@/components/auth/verification-email-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface SignUpFormProps {
  callbackUrl: string
  googleEnabled: boolean
  githubEnabled: boolean
}

export function SignUpForm({ callbackUrl, googleEnabled, githubEnabled }: SignUpFormProps) {
  const hasOauth = googleEnabled || githubEnabled
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [awaitingCode, setAwaitingCode] = useState(false)
  const [emailSent, setEmailSent] = useState(true)

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      setIsSubmitting(false)
      setError('Could not create account. Please try again.')
      return
    }

    const payload = (await response.json()) as { emailSent?: boolean }
    setIsSubmitting(false)
    setEmailSent(payload.emailSent !== false)
    setAwaitingCode(true)
  }

  // The password is still in memory from the registration form, so a
  // successful code entry can log the new user straight in.
  async function handleVerified() {
    const result = await signIn('email-password', {
      email,
      password,
      callbackUrl,
      redirect: false,
    })

    if (result?.error) {
      router.push('/sign-in?verified=1')
      return
    }

    router.push(result?.url || callbackUrl)
    router.refresh()
  }

  if (awaitingCode) {
    return (
      <div className="container mx-auto max-w-md px-4 py-14">
        <Card>
          <CardHeader className="text-center">
            <MailCheck className="mx-auto h-10 w-10 text-primary" />
            <CardTitle>Check your inbox</CardTitle>
            <CardDescription>
              We sent a 6-digit code to <span className="font-medium">{email}</span>. Enter it below
              to activate your account. The code expires in 15 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!emailSent && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                We couldn&apos;t send the email. Use the resend button below, or contact support if
                the problem continues.
              </p>
            )}
            <VerificationEmailForm initialEmail={email} lockEmail onVerified={handleVerified} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-14">
      <div className="mb-6 text-center">
        <p className="text-2xl font-extrabold tracking-tight">Start your quiz journey 🚀</p>
        <p className="mt-1 text-sm text-muted-foreground">Thousands of brain teasers await.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Save your XP, levels, streaks, and badges. Challenge friends in duels. Climb the
            leaderboard. You&apos;ll verify your email before signing in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OauthProviderButtons
            callbackUrl={callbackUrl}
            googleEnabled={googleEnabled}
            githubEnabled={githubEnabled}
          />
          {hasOauth ? (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
          ) : null}

          <form className="space-y-3" onSubmit={handleSignUp}>
            <div className="space-y-1">
              <label htmlFor="sign-up-name" className="text-sm font-medium leading-none">
                Name
              </label>
              <Input
                id="sign-up-name"
                maxLength={80}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sign-up-email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="sign-up-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sign-up-password" className="text-sm font-medium leading-none">
                Password
              </label>
              <Input
                id="sign-up-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters, one uppercase letter, and one number or special character.
              </p>
            </div>
            <div className="space-y-1">
              <label htmlFor="confirm-password" className="text-sm font-medium leading-none">
                Confirm password
              </label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
