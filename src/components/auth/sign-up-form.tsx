'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Check, Loader2, MailCheck, X } from 'lucide-react'
import { OauthProviderButtons } from '@/components/auth/oauth-provider-buttons'
import { VerificationEmailForm } from '@/components/auth/verification-email-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE } from '@/schemas'

/** Mirrors `passwordSchema` in src/schemas — keep the two in sync. */
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  {
    label: 'One number or special character',
    test: (value: string) => /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value),
  },
] as const

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

    if (password.length < 8 || !PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_REGEX_MESSAGE)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const payload = (await response.json()) as { emailSent?: boolean; error?: string }

      if (!response.ok) {
        setError(payload.error ?? 'Could not create account. Please try again.')
        return
      }

      setEmailSent(payload.emailSent !== false)
      setAwaitingCode(true)
    } catch {
      setError('Could not create account. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
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
              <PasswordInput
                id="sign-up-password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <ul className="space-y-0.5 pt-1 text-xs" aria-label="Password requirements">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password)
                  return (
                    <li
                      key={rule.label}
                      className={
                        met
                          ? 'flex items-center gap-1.5 text-foreground'
                          : 'flex items-center gap-1.5 text-muted-foreground'
                      }
                    >
                      {met ? (
                        <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                      ) : (
                        <X className="h-3 w-3 shrink-0" aria-hidden="true" />
                      )}
                      {rule.label}
                      <span className="sr-only">{met ? ' — met' : ' — not met'}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="space-y-1">
              <label htmlFor="confirm-password" className="text-sm font-medium leading-none">
                Confirm password
              </label>
              <PasswordInput
                id="confirm-password"
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

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
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
