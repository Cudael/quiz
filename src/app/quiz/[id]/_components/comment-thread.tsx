'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquare, Flag, Trash2, Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { addComment, deleteComment, reportComment } from '../../comment-actions'

export interface CommentNode {
  id: string
  body: string
  createdAt: string
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  replies: CommentNode[]
}

interface Viewer {
  id: string
  isAdmin: boolean
  isQuizAuthor: boolean
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function CommentComposer({
  quizId,
  parentId,
  placeholder,
  autoFocus,
  onDone,
}: {
  quizId: string
  parentId?: string
  placeholder: string
  autoFocus?: boolean
  onDone?: () => void
}) {
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const { addToast } = useToast()
  const router = useRouter()

  const submit = () => {
    if (!body.trim()) return
    const formData = new FormData()
    formData.set('quizId', quizId)
    formData.set('body', body)
    if (parentId) formData.set('parentId', parentId)
    startTransition(async () => {
      const result = await addComment(formData)
      if (result.ok) {
        setBody('')
        onDone?.()
        router.refresh()
      } else {
        addToast(result.message, 'error')
      }
    })
  }

  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        maxLength={1000}
        autoFocus={autoFocus}
        className="w-full rounded-md border border-border bg-background p-3 text-base outline-none focus:ring-2 focus:ring-ring md:text-sm"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{body.length} / 1000</span>
        <div className="flex gap-2">
          {onDone ? (
            <Button size="sm" variant="ghost" onClick={onDone} disabled={isPending}>
              Cancel
            </Button>
          ) : null}
          <Button size="sm" onClick={submit} disabled={isPending || !body.trim()}>
            {isPending ? 'Posting…' : parentId ? 'Reply' : 'Post comment'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function CommentItem({
  quizId,
  comment,
  viewer,
  isReply,
}: {
  quizId: string
  comment: CommentNode
  viewer: Viewer | null
  isReply?: boolean
}) {
  const [replying, setReplying] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { addToast } = useToast()
  const router = useRouter()

  const canDelete =
    viewer && (viewer.id === comment.author.id || viewer.isAdmin || viewer.isQuizAuthor)

  const handleDelete = () => {
    const formData = new FormData()
    formData.set('commentId', comment.id)
    startTransition(async () => {
      const result = await deleteComment(formData)
      if (result.ok) {
        addToast('Comment deleted.', 'success')
        router.refresh()
      } else {
        addToast(result.message, 'error')
      }
    })
  }

  const handleReport = (reason: string) => {
    const formData = new FormData()
    formData.set('commentId', comment.id)
    formData.set('reason', reason)
    startTransition(async () => {
      const result = await reportComment(formData)
      if (result.ok) {
        addToast('Comment reported. Thanks for keeping BusQuiz friendly.', 'success')
      } else {
        addToast(result.message, 'error')
      }
      setReporting(false)
    })
  }

  const displayName = comment.author.name ?? 'Someone'

  return (
    <div className={isReply ? 'ml-10 mt-3' : ''}>
      <div className="flex gap-3">
        <Avatar src={comment.author.image} fallback={displayName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 text-xs">
            {comment.author.username ? (
              <Link
                href={`/u/${comment.author.username}`}
                className="font-semibold text-foreground hover:underline"
              >
                {displayName}
              </Link>
            ) : (
              <span className="font-semibold">{displayName}</span>
            )}
            <span className="text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
            {comment.body}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            {viewer && !isReply ? (
              <button
                type="button"
                onClick={() => setReplying((v) => !v)}
                className="inline-flex items-center gap-1 font-medium hover:text-foreground"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            ) : null}
            {viewer && viewer.id !== comment.author.id ? (
              <button
                type="button"
                onClick={() => setReporting((v) => !v)}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Flag className="h-3 w-3" />
                Report
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            ) : null}
          </div>

          {reporting ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(['SPAM', 'INAPPROPRIATE', 'OTHER'] as const).map((reason) => (
                <Button
                  key={reason}
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleReport(reason)}
                >
                  {reason === 'SPAM'
                    ? 'Spam'
                    : reason === 'INAPPROPRIATE'
                      ? 'Inappropriate'
                      : 'Other'}
                </Button>
              ))}
            </div>
          ) : null}

          {replying ? (
            <div className="mt-3">
              <CommentComposer
                quizId={quizId}
                parentId={comment.id}
                placeholder={`Reply to ${displayName}…`}
                autoFocus
                onDone={() => setReplying(false)}
              />
            </div>
          ) : null}

          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} quizId={quizId} comment={reply} viewer={viewer} isReply />
          ))}
        </div>
      </div>
    </div>
  )
}

export function CommentThread({
  quizId,
  comments,
  viewer,
}: {
  quizId: string
  comments: CommentNode[]
  viewer: Viewer | null
}) {
  return (
    <section aria-label="Comments" className="rounded-md border p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-quiz-purple-light" />
        <h2 className="text-lg font-bold">
          Discussion{comments.length > 0 ? ` (${comments.length})` : ''}
        </h2>
      </div>

      {viewer ? (
        <div className="mb-6">
          <CommentComposer quizId={quizId} placeholder="Share your thoughts about this quiz…" />
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          <Link href="/sign-in" className="font-medium text-foreground underline">
            Sign in
          </Link>{' '}
          to join the discussion.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first to share!</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem key={comment.id} quizId={quizId} comment={comment} viewer={viewer} />
          ))}
        </div>
      )}
    </section>
  )
}
