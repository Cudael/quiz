'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'

/**
 * Prompts accounts created without a username (OAuth sign-ups) to choose
 * their public handle. This is a required onboarding step because public
 * account features use the username as their stable identity.
 */
export function UsernameOnboarding() {
  const { data: session, status, update } = useSession()
  const [username, setUsername] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const needsUsername = status === 'authenticated' && !!session?.user && !session.user.username

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
      if (window.location.pathname === '/choose-username') {
        const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
        const destination =
          callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/'
        window.location.replace(destination)
      }
    } catch {
      setError('Could not save the username. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      open={needsUsername}
      onClose={() => undefined}
      dismissible={false}
      title="Choose your username"
      description="Choose the public handle you will use on leaderboards, duels, and your profile. A username is required to continue."
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
