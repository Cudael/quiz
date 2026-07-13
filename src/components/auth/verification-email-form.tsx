'use client'

import { useState } from 'react'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function VerificationEmailForm({
  initialEmail = '',
  compact = false,
}: {
  initialEmail?: string
  compact?: boolean
}) {
  const [email, setEmail] = useState(initialEmail)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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
        setError(payload.error ?? 'Could not send verification email.')
        return
      }
      setMessage(
        'If this account still needs verification, a new email has been sent. Any previous verification link is now invalid.'
      )
    } catch {
      setError('Could not send verification email. Please try again.')
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
          {pending ? 'Sending…' : 'Resend email'}
        </Button>
        <span aria-live="polite" className={error ? 'text-destructive' : undefined}>
          {error || message}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
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
      <Button type="button" className="w-full" onClick={resend} disabled={pending || !email}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? 'Sending…' : 'Resend verification email'}
      </Button>
      <p
        aria-live="polite"
        className={error ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}
      >
        {error || message}
      </p>
    </div>
  )
}
