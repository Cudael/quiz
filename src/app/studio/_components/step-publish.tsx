'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Loader2, X } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
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

const categoryIdSchema = z.string().cuid()

export function StepPublish({ quizId }: StepPublishProps) {
  const router = useRouter()
  const { addToast } = useToast()
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
  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()
  const trimmedCoverImage = imageUrl.trim()
  const isCategorySelected = categoryIdSchema.safeParse(categoryId.trim()).success
  const hasCoverImage = trimmedCoverImage.length > 0
  const publishableQuestionsCount = quizId
    ? questions.filter((q) => q.dbId !== null).length
    : questions.length
  const checks: CheckItem[] = [
    { label: 'Title is set', ok: trimmedTitle.length > 0 },
    { label: 'Description is set', ok: trimmedDescription.length > 0 },
    { label: 'Category is selected', ok: isCategorySelected },
    { label: 'Cover image is set', ok: hasCoverImage },
    {
      label: `At least ${MIN_QUESTIONS} questions`,
      ok: publishableQuestionsCount >= MIN_QUESTIONS,
    },
  ]

  const canPublish = checks.every((c) => c.ok)

  const handleTogglePublish = async () => {
    setSavingLocal(true)
    setSaving(true)

    try {
      if (!quizId) {
        // Quiz hasn't been saved yet – create and publish in one step
        const fd = new FormData()
        fd.set('title', trimmedTitle)
        fd.set('description', trimmedDescription)
        fd.set('coverImage', trimmedCoverImage)
        fd.set('categoryId', categoryId)
        fd.set('difficulty', difficulty)
        fd.set('format', quizFormat)
        if (defaultTimeLimitSec !== null) {
          fd.set('defaultTimeLimitSec', String(defaultTimeLimitSec))
        }
        fd.set('isPublished', 'on')
        const result = await createQuizAndReturnId(fd)
        if (!result.ok) {
          addToast(result.message || 'Could not publish quiz.', 'error')
          return
        }
        setQuizId(result.quizId)
        setMeta({ isPublished: true })
        setLastSaved(new Date())
        router.push(`/studio/quiz/${result.quizId}/edit`)
        return
      }

      const fd = new FormData()
      fd.set('quizId', quizId)
      fd.set('title', trimmedTitle)
      fd.set('description', trimmedDescription)
      fd.set('coverImage', trimmedCoverImage)
      fd.set('categoryId', categoryId)
      fd.set('difficulty', difficulty)
      if (!isPublished) fd.set('isPublished', 'on')

      const result = await updateQuiz(fd)
      if (!result.ok) {
        addToast(result.message || 'Could not update quiz publishing status.', 'error')
        return
      }
      setMeta({ isPublished: !isPublished })
      setLastSaved(new Date())
    } catch (error) {
      console.error(error)
      addToast('Could not update quiz publishing status.', 'error')
    } finally {
      setSavingLocal(false)
      setSaving(false)
    }
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
        label="Cover image"
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
