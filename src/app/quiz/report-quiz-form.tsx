'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { reportQuiz } from './actions'

const reasons = ['SPAM', 'INAPPROPRIATE', 'INCORRECT_ANSWERS', 'COPYRIGHT', 'OTHER'] as const
const reasonLabels: Record<(typeof reasons)[number], string> = {
  SPAM: 'Spam',
  INAPPROPRIATE: 'Inappropriate content',
  INCORRECT_ANSWERS: 'Wrong question or answer',
  COPYRIGHT: 'Copyright concern',
  OTHER: 'Other',
}

interface ReportQuizFormProps {
  quizId: string
  questionId?: string
  questionPrompt?: string
  compact?: boolean
}

export function ReportQuizForm({
  quizId,
  questionId,
  questionPrompt,
  compact = false,
}: ReportQuizFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()
  const isQuestionReport = Boolean(questionId)

  return (
    <>
      <Button
        type="button"
        variant={compact ? 'ghost' : 'outline'}
        size={compact ? 'sm' : 'default'}
        onClick={() => {
          setError(null)
          setOpen(true)
        }}
      >
        <Flag className="h-4 w-4" />
        {compact ? 'Report question' : 'Report'}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isQuestionReport ? 'Report a question or answer' : 'Report this quiz'}
        description={
          isQuestionReport
            ? 'Tell our moderators what may be inaccurate or misleading.'
            : 'Tell us why this quiz should be reviewed by moderators.'
        }
      >
        {isQuestionReport && questionPrompt ? (
          <p className="mb-4 rounded-md bg-muted/40 p-3 text-sm font-medium">“{questionPrompt}”</p>
        ) : null}
        <form
          action={async (formData) => {
            setError(null)
            setIsSubmitting(true)
            try {
              const result = await reportQuiz(formData)
              if (result.ok) {
                setOpen(false)
                addToast(
                  isQuestionReport
                    ? 'Question reported. Thanks for helping improve BusQuiz.'
                    : 'Quiz reported. Thanks for letting us know.',
                  'success'
                )
              } else {
                setError(result.message)
              }
            } finally {
              setIsSubmitting(false)
            }
          }}
          className="space-y-3"
        >
          <input type="hidden" name="quizId" value={quizId} />
          {questionId ? <input type="hidden" name="questionId" value={questionId} /> : null}
          {isQuestionReport ? (
            <input type="hidden" name="reason" value="INCORRECT_ANSWERS" />
          ) : (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Reason</span>
              <select
                name="reason"
                required
                defaultValue={reasons[0]}
                className="w-full rounded-md border px-3 py-2 text-base md:text-sm"
              >
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reasonLabels[reason]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              {isQuestionReport ? 'What seems wrong?' : 'Details'}
            </span>
            <textarea
              name="details"
              required={isQuestionReport}
              minLength={isQuestionReport ? 5 : undefined}
              maxLength={500}
              className="min-h-24 w-full rounded-md border px-3 py-2 text-base md:text-sm"
              placeholder={
                isQuestionReport
                  ? 'For example: the marked answer should be…, or the question is ambiguous because…'
                  : 'Optional details (max 500 chars)'
              }
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit report'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
