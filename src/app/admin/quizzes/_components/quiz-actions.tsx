'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { getQuizPath } from '@/lib/quiz-url'
import { FactCheckBadge } from './fact-check-badge'
import {
  deleteQuiz,
  factCheckQuiz,
  toggleQuizPublished,
  type FactCheckActionResult,
} from '../actions'

interface AdminQuizActionsProps {
  quizId: string
  quizSlug: string | null
  quizTitle: string
  isPublished: boolean
  nextPublish: string
}

export function AdminQuizActions({
  quizId,
  quizSlug,
  quizTitle,
  isPublished,
  nextPublish,
}: AdminQuizActionsProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [factChecking, setFactChecking] = useState(false)
  const [factCheckModalOpen, setFactCheckModalOpen] = useState(false)
  const [factCheckResult, setFactCheckResult] = useState<FactCheckActionResult | null>(null)

  async function handlePublish() {
    setPublishing(true)
    try {
      const formData = new FormData()
      formData.set('quizId', quizId)
      formData.set('publish', nextPublish)
      await toggleQuizPublished(formData)
      router.refresh()
    } finally {
      setPublishing(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const formData = new FormData()
      formData.set('quizId', quizId)
      await deleteQuiz(formData)
      setDeleteModalOpen(false)
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  async function handleFactCheck() {
    setFactChecking(true)
    try {
      const result = await factCheckQuiz(quizId)
      setFactCheckResult(result)
      setFactCheckModalOpen(true)
      if (!result.ok) {
        addToast(result.message, 'error')
      } else if (result.flaggedCount === 0) {
        addToast(`"${quizTitle}": all answers look correct.`, 'success')
      } else {
        addToast(
          `"${quizTitle}": ${result.flaggedCount} question${result.flaggedCount === 1 ? '' : 's'} flagged — filed as a report.`,
          'warning'
        )
      }
    } catch {
      addToast('Fact-check failed. Please try again.', 'error')
    } finally {
      setFactChecking(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={getQuizPath({ id: quizId, slug: quizSlug })}>View</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/studio/quiz/${quizId}/edit`}>Edit</Link>
        </Button>
        <Button size="sm" variant="outline" onClick={handlePublish} disabled={publishing}>
          {isPublished ? 'Unpublish' : 'Publish'}
        </Button>
        <Button size="sm" variant="outline" onClick={handleFactCheck} disabled={factChecking}>
          {factChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Fact-check
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setDeleteModalOpen(true)}>
          Delete
        </Button>
      </div>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete quiz?"
        description={`Are you sure you want to permanently delete "${quizTitle}"? This cannot be undone.`}
        size="sm"
      >
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={factCheckModalOpen}
        onClose={() => setFactCheckModalOpen(false)}
        title={`AI fact-check — ${quizTitle}`}
        size="lg"
      >
        {factCheckResult?.ok ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {factCheckResult.flaggedCount === 0
                ? 'All answers look correct.'
                : `${factCheckResult.flaggedCount} of ${factCheckResult.questions.length} question(s) flagged.${
                    factCheckResult.reportCreated ? ' A report was filed for follow-up.' : ''
                  }`}
            </p>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {factCheckResult.questions.map((q) => {
                const verdict = factCheckResult.verdicts.find((v) => v.questionOrder === q.order)
                if (!verdict) return null
                return (
                  <div key={q.order} className="rounded-md border border-border bg-muted/30 p-3">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">
                        Q{q.order + 1}: {q.prompt}
                      </p>
                      <FactCheckBadge verdict={verdict.verdict} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Stated correct answer: {q.correctAnswerText}
                    </p>
                    {verdict.verdict !== 'correct' && (
                      <div className="mt-2 rounded border border-destructive/20 bg-destructive/5 px-2 py-1.5 text-xs">
                        <span className="font-semibold text-destructive">AI reasoning: </span>
                        {verdict.reasoning}
                        {verdict.suggestedAnswer && (
                          <span className="mt-1 block">
                            <span className="font-semibold">Suggested answer: </span>
                            {verdict.suggestedAnswer}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-destructive">{factCheckResult?.message}</p>
        )}
      </Modal>
    </>
  )
}
