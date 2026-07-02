'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, UsersRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { addCollaborator, removeCollaborator } from '@/app/studio/actions'

interface Collaborator {
  userId: string
  user: { id: string; name: string | null; username: string | null; image: string | null }
}

export function CollaboratorManager({
  quizId,
  collaborators,
  isOwner,
  viewerId,
}: {
  quizId: string
  collaborators: Collaborator[]
  isOwner: boolean
  viewerId: string
}) {
  const [username, setUsername] = useState('')
  const [isPending, startTransition] = useTransition()
  const { addToast } = useToast()
  const router = useRouter()

  const handleAdd = () => {
    if (!username.trim()) return
    const formData = new FormData()
    formData.set('quizId', quizId)
    formData.set('username', username.trim())
    startTransition(async () => {
      const result = await addCollaborator(formData)
      if (result.ok) {
        addToast('Co-author added!', 'success')
        setUsername('')
        router.refresh()
      } else {
        addToast(result.message, 'error')
      }
    })
  }

  const handleRemove = (userId: string) => {
    const formData = new FormData()
    formData.set('quizId', quizId)
    formData.set('userId', userId)
    startTransition(async () => {
      const result = await removeCollaborator(formData)
      if (result.ok) {
        addToast(userId === viewerId ? 'You left this quiz.' : 'Co-author removed.', 'success')
        if (userId === viewerId) {
          router.push('/studio')
        } else {
          router.refresh()
        }
      } else {
        addToast(result.message, 'error')
      }
    })
  }

  return (
    <section className="container mx-auto max-w-4xl px-4 pb-10">
      <div className="rounded-md border bg-card p-5">
        <div className="mb-1 flex items-center gap-2">
          <UsersRound className="h-5 w-5 text-quiz-purple-light" />
          <h2 className="text-lg font-bold">Co-authors</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Co-authors can edit questions and quiz details. Only the owner can publish, delete, or
          manage co-authors.
        </p>

        {collaborators.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {collaborators.map((collab) => (
              <li key={collab.userId} className="flex items-center gap-3 rounded-md border p-2.5">
                <Avatar src={collab.user.image} fallback={collab.user.name ?? '?'} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{collab.user.name ?? 'User'}</p>
                  {collab.user.username ? (
                    <p className="truncate text-xs text-muted-foreground">
                      @{collab.user.username}
                    </p>
                  ) : null}
                </div>
                {(isOwner || collab.userId === viewerId) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => handleRemove(collab.userId)}
                    aria-label={
                      collab.userId === viewerId ? 'Leave quiz' : `Remove ${collab.user.name}`
                    }
                  >
                    <X className="h-4 w-4" />
                    {collab.userId === viewerId && !isOwner ? 'Leave' : null}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">No co-authors yet.</p>
        )}

        {isOwner ? (
          <div className="flex gap-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder="Add by username, e.g. quizmaster"
              className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button onClick={handleAdd} disabled={isPending || !username.trim()}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
