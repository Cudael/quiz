'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { OauthProviderButtons } from '@/components/auth/oauth-provider-buttons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface SignInFormProps {
  callbackUrl: string
  googleEnabled: boolean
  githubEnabled: boolean
  verifiedMessage?: string
}

const AUTH_ERROR_MESSAGE =
  'Sign in failed. Please check your details and try again. If you registered recently, verify your email first.'

export function SignInForm({
  callbackUrl,
  googleEnabled,
  githubEnabled,
  verifiedMessage,
}: SignInFormProps) {
  const hasOauth = googleEnabled || githubEnabled
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
  async function handleEmailPasswordSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmittingEmail(true)
    const result = await signIn('email-password', {
      email,
      password,
      callbackUrl,
      redirect: false,
    })
    setIsSubmittingEmail(false)

    if (result?.error) {
      setError(AUTH_ERROR_MESSAGE)
      return
    }

    router.push(result?.url || callbackUrl)
    router.refresh()
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-14">
      <div className="mb-6 text-center">
        <p className="text-2xl font-extrabold tracking-tight">Welcome back, quiz champion! 🏆</p>
        <p className="mt-1 text-sm text-muted-foreground">Your streak misses you.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            Continue your progress and save your XP, streak, and badges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-7">
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

          <form className="space-y-3" onSubmit={handleEmailPasswordSignIn}>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p className="text-right text-xs text-muted-foreground">
                <Link href="/forgot-password" className="underline">
                  Forgot password?
                </Link>
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmittingEmail}>
              {isSubmittingEmail && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmittingEmail ? 'Logging in…' : 'Log in'}
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {verifiedMessage ? (
            <p className="text-sm text-muted-foreground">{verifiedMessage}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Need an account?{' '}
            <Link
              href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
