'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function VerificationEmailForm({
  initialEmail = '',
  compact = false,
  lockEmail = false,
  onVerified,
}: {
  initialEmail?: string
  compact?: boolean
  /** Hide the email field when the address is fixed (e.g. right after sign-up). */
  lockEmail?: boolean
  /** Called after a successful verification instead of the default sign-in redirect. */
  onVerified?: () => void | Promise<void>
}) {
  const router = useRouter()
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Could not verify the code. Please try again.')
        return
      }
      if (onVerified) {
        await onVerified()
      } else {
        router.push('/sign-in?verified=1')
      }
    } catch {
      setError('Could not verify the code. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function resend() {
    setPending(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Could not send verification code.')
        return
      }
      setMessage(
        'If this account still needs verification, a new code has been sent. Any previous code is now invalid.'
      )
    } catch {
      setError('Could not send verification code. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={resend} disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MailCheck className="h-4 w-4" />
          )}
          {pending ? 'Sending…' : 'Resend code'}
        </Button>
        <span aria-live="polite" className={error ? 'text-destructive' : undefined}>
          {error || message}
        </span>
      </div>
    )
  }

  return (
    <form className="space-y-3" onSubmit={verify}>
      {lockEmail ? null : (
        <div className="space-y-1">
          <label htmlFor="verification-email" className="text-sm font-medium">
            Email address
          </label>
          <Input
            id="verification-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      )}
      <div className="space-y-1">
        <label htmlFor="verification-code" className="text-sm font-medium">
          Verification code
        </label>
        <Input
          id="verification-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          placeholder="6-digit code"
          className="text-center text-lg tracking-[0.5em]"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending || !email || code.length !== 6}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? 'Verifying…' : 'Verify email'}
      </Button>
      <div className="flex items-baseline justify-between gap-2">
        <p
          aria-live="polite"
          className={error ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}
        >
          {error || message}
        </p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="shrink-0"
          onClick={resend}
          disabled={pending || !email}
        >
          Resend code
        </Button>
      </div>
    </form>
  )
}
