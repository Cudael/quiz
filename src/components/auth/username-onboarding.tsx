'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'

const DISMISSED_KEY = 'busquiz-username-prompt-dismissed'

/**
 * Prompts accounts created without a username (OAuth sign-ups) to choose
 * their public handle. Dismissible — a handle can also be set later in
 * profile settings — but reappears next browser session until one exists.
 */
export function UsernameOnboarding() {
  const { data: session, status, update } = useSession()
  const [username, setUsername] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  // The session status is 'loading' during hydration, so reading storage in
  // the initializer cannot cause a server/client markup mismatch.
  const [dismissed, setDismissed] = useState(
    () => typeof window === 'undefined' || sessionStorage.getItem(DISMISSED_KEY) === '1'
  )

  const needsUsername = status === 'authenticated' && !!session?.user && !session.user.username

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/profile/username', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? 'Could not save the username. Please try again.')
        return
      }
      // Refresh the JWT so the navbar and menus pick the handle up
      // immediately; the modal closes itself once the session has it.
      await update()
    } catch {
      setError('Could not save the username. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      open={needsUsername && !dismissed}
      onClose={dismiss}
      title="Choose your username"
      description="Your public handle on leaderboards, duels, and your profile. You can also set it later in profile settings."
    >
      <form className="space-y-3" onSubmit={save}>
        <div className="space-y-1">
          <label htmlFor="onboarding-username" className="text-sm font-medium leading-none">
            Username
          </label>
          <Input
            id="onboarding-username"
            autoComplete="username"
            minLength={3}
            maxLength={32}
            required
            placeholder="quiz-champion"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
            }
          />
          <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens.</p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={pending || username.length < 3}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? 'Saving…' : 'Save username'}
        </Button>
      </form>
    </Modal>
  )
}
