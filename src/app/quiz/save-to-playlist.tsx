'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ListPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addToPlaylist, removeFromPlaylist } from '@/app/playlists/actions'

export interface ViewerPlaylist {
  id: string
  title: string
  hasQuiz: boolean
}

interface SaveToPlaylistProps {
  quizId: string
  playlists: ViewerPlaylist[]
  isSignedIn: boolean
}

export function SaveToPlaylist({ quizId, playlists, isSignedIn }: SaveToPlaylistProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!isSignedIn) return null

  function toggle(playlist: ViewerPlaylist) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set('playlistId', playlist.id)
      formData.set('quizId', quizId)
      if (playlist.hasQuiz) {
        await removeFromPlaylist(formData)
      } else {
        await addToPlaylist(formData)
      }
      router.refresh()
    })
  }

  return (
    <div className="relative inline-block">
      <Button onClick={() => setOpen((value) => !value)} size="sm" type="button" variant="ghost">
        <ListPlus className="mr-1.5 h-4 w-4" />
        Save to playlist
      </Button>
      {open ? (
        <div className="absolute left-0 z-20 mt-1 w-60 rounded-md border bg-popover p-2 shadow-md">
          {playlists.length === 0 ? (
            <p className="p-2 text-xs text-muted-foreground">
              No playlists yet.{' '}
              <Link className="underline" href="/playlists">
                Create one
              </Link>
              .
            </p>
          ) : (
            <ul className="max-h-60 space-y-1 overflow-y-auto">
              {playlists.map((playlist) => (
                <li key={playlist.id}>
                  <button
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-50"
                    disabled={isPending}
                    onClick={() => toggle(playlist)}
                    type="button"
                  >
                    <span className="truncate">{playlist.title}</span>
                    {playlist.hasQuiz ? (
                      <Check className="h-4 w-4 shrink-0 text-quiz-green" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-1 border-t pt-1">
            <Link
              className="block rounded-sm px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              href="/playlists"
            >
              Manage playlists →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
