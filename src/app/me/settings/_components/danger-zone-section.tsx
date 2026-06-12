'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { readErrorMessage } from '../settings-client.utils'

interface DangerZoneSectionProps {
  username: string
}

export function DangerZoneSection({ username }: DangerZoneSectionProps) {
  const { addToast } = useToast()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [confirmUsername, setConfirmUsername] = useState('')
  const usernameForDelete = `@${username}`

  return (
    <>
      <section className="rounded-xl border border-destructive/40 bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold text-destructive">Danger zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Delete your account permanently. Type {usernameForDelete} to confirm.
        </p>
        <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
          Delete account
        </Button>
      </section>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete account"
        description={`Type ${usernameForDelete} to confirm.`}
      >
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const response = await fetch('/api/me', {
              method: 'DELETE',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ confirmUsername }),
            })

            if (!response.ok) {
              addToast(await readErrorMessage(response, 'Could not delete account.'), 'error')
              return
            }

            await signOut({ redirectTo: '/' })
          }}
        >
          <div className="space-y-1">
            <label htmlFor="settings-delete-confirmation" className="text-sm font-medium">
              Confirmation
            </label>
            <Input
              id="settings-delete-confirmation"
              value={confirmUsername}
              onChange={(event) => setConfirmUsername(event.target.value)}
              placeholder={usernameForDelete}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Permanently delete
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
