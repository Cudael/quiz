'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { readErrorMessage } from '../settings-client.utils'

interface AccountSectionProps {
  email: string | null
  hasPassword: boolean
  providers: string[]
}

export function AccountSection({ email, hasPassword, providers }: AccountSectionProps) {
  const { addToast } = useToast()
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Account</h2>
      <p className="text-sm text-muted-foreground">
        Email: <span className="font-medium">{email ?? 'Not set'}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Linked providers:{' '}
        <span className="font-medium">
          {providers.length ? providers.join(', ') : 'None linked'}
        </span>
      </p>

      {hasPassword && (
        <form
          className="mt-4 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
              addToast('New password confirmation does not match.', 'error')
              return
            }

            const response = await fetch('/api/profile/password', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
              }),
            })

            if (!response.ok) {
              addToast(await readErrorMessage(response, 'Could not change password.'), 'error')
              return
            }

            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            addToast('Password updated.', 'success')
          }}
        >
          <div className="space-y-1">
            <label htmlFor="settings-current-password" className="text-sm font-medium">
              Current password
            </label>
            <Input
              id="settings-current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="settings-new-password" className="text-sm font-medium">
              New password
            </label>
            <Input
              id="settings-new-password"
              type="password"
              minLength={8}
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              At least 8 characters, one uppercase letter, and one number or special character.
            </p>
          </div>
          <div className="space-y-1">
            <label htmlFor="settings-confirm-password" className="text-sm font-medium">
              Confirm new password
            </label>
            <Input
              id="settings-confirm-password"
              type="password"
              minLength={8}
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              required
            />
          </div>
          <Button type="submit" variant="outline">
            Change password
          </Button>
        </form>
      )}
    </section>
  )
}
