'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/** Seconds a user must wait before requesting another reset link. */
const RESEND_COOLDOWN_SECONDS = 45

export function ForgotPasswordForm({ initialEmail = '' }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((current) => current - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function requestResetLink() {
    setIsSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        setError('Could not send the reset link. Please try again.')
        return
      }
      setSubmitted(true)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch {
      setError('Could not send the reset link. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void requestResetLink()
  }

  const signInLink = (
    <p className="text-center text-sm text-muted-foreground">
      Remembered it?{' '}
      <Link href="/sign-in" className="underline">
        Log in
      </Link>
    </p>
  )

  if (submitted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <MailCheck className="mx-auto h-10 w-10 text-primary" />
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            If an account exists for <span className="font-medium">{email}</span>, a password reset
            link is on its way. The link expires in 1 hour.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nothing after a few minutes? Check your spam folder, or make sure the address above is
            the one you registered with.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={requestResetLink}
              disabled={isSubmitting || cooldown > 0}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? 'Sending…'
                : cooldown > 0
                  ? `Send again (${cooldown}s)`
                  : 'Send again'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setSubmitted(false)
                setError('')
              }}
            >
              Use a different email
            </Button>
          </div>
          {signInLink}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="forgot-email" className="text-sm font-medium leading-none">
              Email
            </label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {signInLink}
      </CardContent>
    </Card>
  )
}
