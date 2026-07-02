'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Loader2, X, AlertTriangle } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ImageUpload } from './image-upload'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import { updateQuiz } from '@/app/studio/actions'
import { createQuizAndReturnId } from '@/app/studio/actions/quiz-meta-actions'
import { togglePublish } from '@/app/studio/actions'
import { getPendingFile, uploadFileToStorage, clearPendingUpload } from './use-image-upload'
import { saveQuestionsForQuiz } from './quiz-save-utils'
import { FORMAT_INFO, isQuestionCompleteForFormat } from './format-defaults'

interface StepPublishProps {
  quizId: string | null
  quizSlug?: string | null
}

interface CheckItem {
  label: string
  ok: boolean
}

const categoryIdSchema = z.string().cuid()

export function StepPublish({ quizId, quizSlug: initialSlug }: StepPublishProps) {
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
    setQuestions,
  } = useQuizCreatorStore()

  const [saving, setSavingLocal] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [quizSlug, setQuizSlug] = React.useState<string | null>(initialSlug ?? null)
  const publishInFlightRef = React.useRef(false)

  const MIN_QUESTIONS = FORMAT_INFO[quizFormat].minQuestions
  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()
  const trimmedCoverImage = imageUrl.trim()
  const isCategorySelected = categoryIdSchema.safeParse(categoryId.trim()).success
  const hasCoverImage = trimmedCoverImage.length > 0

  // ── Question-level validation ──────────────────────────────────────────
  const isImageChoice = quizFormat === 'IMAGE_CHOICE'
  const isClassicChoiceLike =
    quizFormat === 'TEXT_CHOICE' ||
    quizFormat === 'IMAGE_CHOICE' ||
    quizFormat === 'ODD_ONE_OUT' ||
    quizFormat === 'IMAGE_REVEAL' ||
    quizFormat === 'AUDIO_CHOICE' ||
    quizFormat === 'MEMORY_FLASH'

  const emptyPromptCount = questions.filter((q) => !q.prompt.trim()).length
  const noCorrectCount = isClassicChoiceLike
    ? questions.filter((q) => !q.choices.some((c) => c.isCorrect)).length
    : 0
  const tooFewChoicesCount = isClassicChoiceLike
    ? questions.filter((q) => q.type !== 'HOTSPOT' && q.choices.length < 2).length
    : 0
  const emptyChoiceCount = isClassicChoiceLike
    ? questions.filter((q) =>
        q.type === 'HOTSPOT'
          ? false
          : q.choices.some((c) => (isImageChoice ? !c.imageUrl.trim() : !c.text.trim()))
      ).length
    : 0

  const completeQuestionCount = questions.filter((q) =>
    isQuestionCompleteForFormat(q, quizFormat)
  ).length

  const checks: CheckItem[] = [
    { label: 'Title is set', ok: trimmedTitle.length > 0 },
    { label: 'Description is set', ok: trimmedDescription.length > 0 },
    { label: 'Category is selected', ok: isCategorySelected },
    { label: 'Cover image is set', ok: hasCoverImage },
    {
      label: `At least ${MIN_QUESTIONS} complete questions (${completeQuestionCount} of ${questions.length} ready)`,
      ok: completeQuestionCount >= MIN_QUESTIONS,
    },
  ]

  // Build a list of specific issues for partial/warning diagnostics
  const questionIssues: string[] = []
  if (questions.length === 0) {
    questionIssues.push('No questions added yet.')
  } else {
    if (emptyPromptCount > 0) {
      questionIssues.push(
        `${emptyPromptCount} question${emptyPromptCount > 1 ? 's have' : ' has'} an empty prompt.`
      )
    }
    if (noCorrectCount > 0) {
      questionIssues.push(
        `${noCorrectCount} question${noCorrectCount > 1 ? 's have' : ' has'} no correct answer selected.`
      )
    }
    if (tooFewChoicesCount > 0) {
      questionIssues.push(
        `${tooFewChoicesCount} question${tooFewChoicesCount > 1 ? 's have' : ' has'} fewer than 2 choices.`
      )
    }
    if (emptyChoiceCount > 0) {
      const label = isImageChoice ? 'image' : 'text'
      questionIssues.push(
        `${emptyChoiceCount} question${emptyChoiceCount > 1 ? 's have' : ' has'} choice${emptyChoiceCount > 1 ? 's' : ''} with empty ${label}.`
      )
    }
    if (questionIssues.length === 0 && completeQuestionCount < MIN_QUESTIONS) {
      const missing = MIN_QUESTIONS - completeQuestionCount
      const incomplete = questions.length - completeQuestionCount
      questionIssues.push(
        incomplete > 0
          ? `${incomplete} question${incomplete > 1 ? 's are' : ' is'} incomplete for the ${FORMAT_INFO[quizFormat].name} format — open ${incomplete > 1 ? 'them' : 'it'} to fill in the missing pieces.`
          : `You need ${MIN_QUESTIONS} complete questions but only have ${completeQuestionCount}. Add ${missing} more.`
      )
    }
  }

  const canPublish = checks.every((c) => c.ok)

  const handleTogglePublish = async () => {
    // Guard against double-clicks / concurrent submissions
    if (publishInFlightRef.current) return
    publishInFlightRef.current = true
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

    try {
      // Resolve blob URLs for every image across all questions — in parallel
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

      if (!quizId) {
        // ── New quiz — create draft, save all questions in parallel, then publish ──
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

        const createResult = await createQuizAndReturnId(fd)
        if (!createResult.ok) {
          addToast(createResult.message || 'Could not create quiz.', 'error')
          return
        }
        const newQuizId = createResult.quizId
        const newQuizSlug = createResult.quizSlug
        setQuizId(newQuizId)
        setQuizSlug(newQuizSlug)

        const saveQuestionsResult = await saveQuestionsForQuiz({
          quizId: newQuizId,
          questions: resolvedQuestions,
        })
        setQuestions(saveQuestionsResult.questions)

        if (!saveQuestionsResult.ok) {
          addToast(saveQuestionsResult.message || 'Could not save a question.', 'error')
          return
        }

        // Publish
        const pubFd = new FormData()
        pubFd.set('quizId', newQuizId)
        const pubResult = await togglePublish(pubFd)
        if (!pubResult.ok) {
          addToast(pubResult.message || 'Could not publish quiz.', 'error')
          return
        }

        setMeta({ isPublished: true })
        setLastSaved(new Date())
        addToast('Quiz published! 🎉', 'success')
        router.push(`/quiz/${newQuizSlug}`)
        return
      }

      // ── Existing quiz — save/update questions safely, delete removed, then publish ──
      const saveQuestionsResult = await saveQuestionsForQuiz({
        quizId,
        questions: resolvedQuestions,
        deleteRemovedQuestionsAfterSave: true,
      })
      setQuestions(saveQuestionsResult.questions)

      if (!saveQuestionsResult.ok) {
        addToast(saveQuestionsResult.message || 'Could not save a question.', 'error')
        return
      }

      // Update quiz metadata + publish in one call
      const updateFd = new FormData()
      updateFd.set('quizId', quizId)
      updateFd.set('title', trimmedTitle)
      updateFd.set('description', trimmedDescription)
      updateFd.set('coverImage', resolvedCoverImage)
      updateFd.set('categoryId', categoryId)
      updateFd.set('difficulty', difficulty)
      updateFd.set('format', quizFormat)
      if (defaultTimeLimitSec !== null) {
        updateFd.set('defaultTimeLimitSec', String(defaultTimeLimitSec))
      }
      if (!isPublished) updateFd.set('isPublished', 'on')

      const result = await updateQuiz(updateFd)
      if (!result.ok) {
        addToast(result.message || 'Could not update quiz publishing status.', 'error')
        return
      }

      setMeta({ isPublished: !isPublished })
      setLastSaved(new Date())
      addToast(isPublished ? 'Quiz unpublished.' : 'Quiz published! 🎉', 'success')
    } catch (error) {
      console.error(error)
      addToast('Could not update quiz publishing status.', 'error')
    } finally {
      publishInFlightRef.current = false
      setSavingLocal(false)
      setSaving(false)
    }
  }

  const getShareUrl = () => {
    if (!quizSlug) return ''
    if (typeof window === 'undefined') return `/quiz/${quizSlug}`
    return `${window.location.origin}/quiz/${quizSlug}`
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
      <div className="rounded-md border bg-card p-5 space-y-3">
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

        {/* Question issues — shown when there are problems to fix */}
        {questionIssues.length > 0 && (
          <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5">
            {questionIssues.map((issue) => (
              <div
                key={issue}
                className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
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
        <div className="rounded-md border bg-card p-5 space-y-3">
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
