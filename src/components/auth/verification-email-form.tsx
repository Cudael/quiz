'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/** Seconds a user must wait between resend requests (protects the daily cap). */
const RESEND_COOLDOWN_SECONDS = 45

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
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((current) => current - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function submitCode(value: string) {
    if (pending) return
    setPending(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code: value }),
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

  function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitCode(code)
  }

  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.replace(/\D/g, '')
    setCode(next)
    // The code has a fixed length, so a complete entry (typed or pasted)
    // submits itself — no extra button press on the happy path.
    if (next.length === 6 && email && !pending) {
      void submitCode(next)
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
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setMessage(
        'If this account still needs verification, a new code has been sent. Any previous code is now invalid.'
      )
    } catch {
      setError('Could not send verification code. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const resendDisabled = pending || !email || cooldown > 0
  const resendLabel = cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={resend}
          disabled={resendDisabled}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MailCheck className="h-4 w-4" />
          )}
          {pending ? 'Sending…' : resendLabel}
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
          autoFocus={Boolean(initialEmail)}
          placeholder="6-digit code"
          className="text-center text-lg tracking-[0.5em]"
          value={code}
          onChange={handleCodeChange}
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
          disabled={resendDisabled}
        >
          {resendLabel}
        </Button>
      </div>
    </form>
  )
}
