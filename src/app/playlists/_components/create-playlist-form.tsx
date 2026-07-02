'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPlaylist } from '../actions'

export function CreatePlaylistForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('title', title)
      formData.set('isPublic', String(isPublic))
      const result = await createPlaylist(formData)
      if (result.ok) {
        setTitle('')
        router.refresh()
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <form className="rounded-md border bg-card p-4" onSubmit={handleSubmit}>
      <h2 className="mb-2 text-sm font-bold">New playlist</h2>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          className="sm:max-w-xs"
          disabled={isPending}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Geography favourites"
          value={title}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={isPublic}
            className="h-4 w-4"
            disabled={isPending}
            onChange={(event) => setIsPublic(event.target.checked)}
            type="checkbox"
          />
          Public
        </label>
        <Button disabled={isPending || title.trim().length < 2} type="submit">
          {isPending ? 'Creating…' : 'Create'}
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </form>
  )
}
