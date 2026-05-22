'use client'

import * as React from 'react'
import { Check, Copy, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUrlInput } from './image-url-input'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import { updateQuiz } from '@/app/studio/actions'

interface StepPublishProps {
  quizId: string
}

interface CheckItem {
  label: string
  ok: boolean
}

export function StepPublish({ quizId }: StepPublishProps) {
  const {
    title,
    description,
    categoryId,
    difficulty,
    imageUrl,
    isPublished,
    questions,
    setMeta,
    setSaving,
    setLastSaved,
  } = useQuizCreatorStore()

  const [saving, setSavingLocal] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const checks: CheckItem[] = [
    { label: 'Title is not empty', ok: title.trim().length > 0 },
    { label: 'Description is not empty', ok: description.trim().length > 0 },
    { label: 'At least 1 question', ok: questions.length > 0 },
    {
      label: 'All questions have a correct answer',
      ok: questions.every((q) => q.choices.some((c) => c.isCorrect)),
    },
  ]

  const canPublish = checks.every((c) => c.ok)

  const handleTogglePublish = async () => {
    setSavingLocal(true)
    setSaving(true)

    const fd = new FormData()
    fd.set('quizId', quizId)
    fd.set('title', title)
    fd.set('description', description)
    fd.set('categoryId', categoryId)
    fd.set('difficulty', difficulty)
    if (!isPublished) fd.set('isPublished', 'on')

    const result = await updateQuiz(fd)
    if (result.ok) {
      setMeta({ isPublished: !isPublished })
      setLastSaved(new Date())
    }

    setSavingLocal(false)
    setSaving(false)
  }

  const getShareUrl = () => {
    if (typeof window === 'undefined') return `/quiz/${quizId}`
    return `${window.location.origin}/quiz/${quizId}`
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getShareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <ImageUrlInput
        value={imageUrl}
        onChange={(v) => setMeta({ imageUrl: v })}
        label="Cover image (optional)"
        aspectRatio="16/9"
      />

      {/* Checklist */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="font-semibold">Publish checklist</h3>
        {checks.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            {item.ok ? (
              <Check className="h-4 w-4 shrink-0 text-quiz-green" />
            ) : (
              <X className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <span className={item.ok ? 'text-foreground' : 'text-muted-foreground'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Publish toggle */}
      <Button
        type="button"
        onClick={handleTogglePublish}
        disabled={(!isPublished && !canPublish) || saving}
        variant={isPublished ? 'outline' : 'default'}
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPublished ? 'Unpublish quiz' : 'Publish quiz'}
      </Button>

      {/* Share section */}
      {isPublished && (
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold">Share your quiz</h3>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={getShareUrl()}
              className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
