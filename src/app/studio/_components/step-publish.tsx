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
import { addQuestion, updateQuestion } from '@/app/studio/actions/question-actions'
import { togglePublish } from '@/app/studio/actions'
import { getPendingFile, uploadFileToStorage, clearPendingUpload } from './use-image-upload'

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
  // In edit mode, only count questions already persisted to the DB (dbId !== null).
  // Fall back to questions.length if no questions have been persisted yet (e.g. during
  // the brief transition after a new quiz is first created) so the checklist does not
  // flash a false failure while the page is navigating away.
  const publishableQuestionsCount =
    quizId && questions.some((q) => q.dbId !== null)
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

    /** Upload a blob URL to R2 and return the permanent URL.
     *  Throws if the blob file is no longer available (e.g. after a page refresh). */
    const resolveBlobUrl = async (url: string): Promise<string> => {
      if (url && url.startsWith('blob:')) {
        const file = getPendingFile(url)
        if (!file) {
          throw new Error('An image is no longer available. Please re-upload it before publishing.')
        }
        const permanent = await uploadFileToStorage(file)
        clearPendingUpload(url)
        return permanent
      }
      return url
    }

    // Resolve blob URLs for every image in every question before saving.
    const resolvedQuestions = await Promise.all(
      questions.map(async (q) => {
        const resolvedImageUrl = await resolveBlobUrl(q.imageUrl)
        const resolvedChoices = await Promise.all(
          q.choices.map(async (c) => {
            if (c.imageUrl && c.imageUrl.startsWith('blob:')) {
              const permanent = await resolveBlobUrl(c.imageUrl)
              return { ...c, imageUrl: permanent }
            }
            return c
          })
        )
        return { ...q, imageUrl: resolvedImageUrl, choices: resolvedChoices }
      })
    )
    const resolvedCoverImage = await resolveBlobUrl(trimmedCoverImage)
    if (resolvedCoverImage !== imageUrl) {
      setMeta({ imageUrl: resolvedCoverImage })
    }

    try {
      if (!quizId) {
        // Quiz hasn't been saved yet – create as draft, save questions, then publish
        const fd = new FormData()
        fd.set('title', trimmedTitle)
        fd.set('description', trimmedDescription)
        fd.set('coverImage', resolvedCoverImage)
        fd.set('categoryId', categoryId)
        fd.set('difficulty', difficulty)
        fd.set('format', quizFormat)
        if (defaultTimeLimitSec !== null) {
          fd.set('defaultTimeLimitSec', String(defaultTimeLimitSec))
        }
        // Create as draft first so we have a quizId for question saves
        const createResult = await createQuizAndReturnId(fd)
        if (!createResult.ok) {
          addToast(createResult.message || 'Could not create quiz.', 'error')
          return
        }
        const newQuizId = createResult.quizId

        // Persist all questions to the database
        for (let i = 0; i < resolvedQuestions.length; i++) {
          const q = resolvedQuestions[i]
          const qFd = new FormData()
          qFd.set('quizId', newQuizId)
          qFd.set('type', q.type)
          qFd.set('prompt', q.prompt)
          qFd.set('timeLimitSec', String(q.timeLimitSec))
          qFd.set('order', String(i))
          if (q.imageUrl) qFd.set('imageUrl', q.imageUrl)
          if (q.explanation) qFd.set('explanation', q.explanation)
          qFd.set(
            'choices',
            JSON.stringify(
              q.choices.map((c) => ({
                text: c.text,
                imageUrl: c.imageUrl || undefined,
                isCorrect: c.isCorrect,
                ...(c.meta ? { meta: c.meta } : {}),
              }))
            )
          )

          let qResult
          if (q.dbId) {
            qFd.set('questionId', q.dbId)
            qResult = await updateQuestion(qFd)
          } else {
            qResult = await addQuestion(qFd)
          }
          if (!qResult.ok) {
            addToast(qResult.message || 'Could not save a question.', 'error')
            return
          }
        }

        // Publish the quiz
        const pubFd = new FormData()
        pubFd.set('quizId', newQuizId)
        const pubResult = await togglePublish(pubFd)
        if (!pubResult.ok) {
          addToast(pubResult.message || 'Could not publish quiz.', 'error')
          return
        }

        setQuizId(newQuizId)
        setMeta({ isPublished: true })
        setLastSaved(new Date())
        router.push(`/quiz/${newQuizId}`)
        return
      }

      // Existing quiz — persist any unsaved questions, then toggle publish
      for (let i = 0; i < resolvedQuestions.length; i++) {
        const q = resolvedQuestions[i]
        if (!q.dbId) {
          const qFd = new FormData()
          qFd.set('quizId', quizId)
          qFd.set('type', q.type)
          qFd.set('prompt', q.prompt)
          qFd.set('timeLimitSec', String(q.timeLimitSec))
          qFd.set('order', String(i))
          if (q.imageUrl) qFd.set('imageUrl', q.imageUrl)
          if (q.explanation) qFd.set('explanation', q.explanation)
          qFd.set(
            'choices',
            JSON.stringify(
              q.choices.map((c) => ({
                text: c.text,
                imageUrl: c.imageUrl || undefined,
                isCorrect: c.isCorrect,
                ...(c.meta ? { meta: c.meta } : {}),
              }))
            )
          )
          const qResult = await addQuestion(qFd)
          if (!qResult.ok) {
            addToast(qResult.message || 'Could not save a question.', 'error')
            return
          }
        }
      }

      const fd = new FormData()
      fd.set('quizId', quizId)
      fd.set('title', trimmedTitle)
      fd.set('description', trimmedDescription)
      fd.set('coverImage', resolvedCoverImage)
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
