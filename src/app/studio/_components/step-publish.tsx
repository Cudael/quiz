'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUpload } from './image-upload'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import { updateQuiz } from '@/app/studio/actions'
import { createQuizAndReturnId } from '@/app/studio/actions/quiz-meta-actions'

interface StepPublishProps {
  quizId: string | null
}

interface CheckItem {
  label: string
  ok: boolean
}

export function StepPublish({ quizId }: StepPublishProps) {
  const router = useRouter()
  const {
    title,
    description,
    categoryId,
    difficulty,
    imageUrl,
    isPublished,
    questions,
    quizFormat,
    defaultTimeLimitSec,
    setMeta,
    setSaving,
    setLastSaved,
    setQuizId,
  } = useQuizCreatorStore()

  const [saving, setSavingLocal] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const MIN_QUESTIONS = 5
  const checks: CheckItem[] = [
    { label: 'Title is set', ok: title.trim().length > 0 },
    { label: 'Description is set', ok: description.trim().length > 0 },
    { label: `At least ${MIN_QUESTIONS} questions`, ok: questions.length >= MIN_QUESTIONS },
  ]

  const canPublish = checks.every((c) => c.ok)

  const handleTogglePublish = async () => {
    setSavingLocal(true)
    setSaving(true)

    if (!quizId) {
      // Quiz hasn't been saved yet – create and publish in one step
      const fd = new FormData()
      fd.set('title', title.trim())
      fd.set('description', description.trim())
      fd.set('coverImage', imageUrl.trim())
      fd.set('categoryId', categoryId)
      fd.set('difficulty', difficulty)
      fd.set('format', quizFormat)
      if (defaultTimeLimitSec !== null) {
        fd.set('defaultTimeLimitSec', String(defaultTimeLimitSec))
      }
      fd.set('isPublished', 'on')
      const result = await createQuizAndReturnId(fd)
      if (result.ok) {
        setQuizId(result.quizId)
        setMeta({ isPublished: true })
        setLastSaved(new Date())
        router.push(`/studio/quiz/${result.quizId}/edit`)
      }
      setSavingLocal(false)
      setSaving(false)
      return
    }

    const fd = new FormData()
    fd.set('quizId', quizId)
    fd.set('title', title)
    fd.set('description', description)
    fd.set('coverImage', imageUrl.trim())
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
    if (!quizId) return ''
    if (typeof window === 'undefined') return `/quiz/${quizId}`
    return `${window.location.origin}/quiz/${quizId}`
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getShareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-xl space-y-6">
      <ImageUpload
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
