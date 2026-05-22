'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface SignInFormProps {
  callbackUrl: string
  googleEnabled: boolean
  githubEnabled: boolean
}

const AUTH_ERROR_MESSAGE = 'Sign in failed. Please check your details and try again.'

export function SignInForm({ callbackUrl, googleEnabled, githubEnabled }: SignInFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [guestName, setGuestName] = useState('')
  const [error, setError] = useState('')
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false)
  const oauthProviders = [
    googleEnabled ? { id: 'google', label: 'Continue with Google' } : null,
    githubEnabled ? { id: 'github', label: 'Continue with GitHub' } : null,
  ].filter(Boolean) as Array<{ id: 'google' | 'github'; label: string }>

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

  async function handleGuestContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmittingGuest(true)
    const result = await signIn('credentials', {
      name: guestName,
      callbackUrl,
      redirect: false,
    })
    setIsSubmittingGuest(false)

    if (result?.error) {
      setError(AUTH_ERROR_MESSAGE)
      return
    }

    router.push(result?.url || callbackUrl)
    router.refresh()
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Continue your progress and save your XP, streak, and badges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {oauthProviders.length > 0 && (
            <div className="space-y-2">
              {oauthProviders.map((provider) => (
                <Button
                  key={provider.id}
                  type="button"
                  variant={oauthProviders.length === 1 ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => signIn(provider.id, { callbackUrl })}
                >
                  {provider.label}
                </Button>
              ))}
            </div>
          )}

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
            </div>
            <Button type="submit" className="w-full" disabled={isSubmittingEmail}>
              {isSubmittingEmail ? 'Signing in…' : 'Sign in with email'}
            </Button>
          </form>

          <div className="border-t border-border pt-4">
            <form className="space-y-3" onSubmit={handleGuestContinue}>
              <div className="space-y-1">
                <label htmlFor="guest-name" className="text-sm font-medium leading-none">
                  Continue as guest
                </label>
                <Input
                  id="guest-name"
                  maxLength={80}
                  required
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Display name"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={isSubmittingGuest}
              >
                {isSubmittingGuest ? 'Continuing…' : 'Continue as guest'}
              </Button>
            </form>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
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
