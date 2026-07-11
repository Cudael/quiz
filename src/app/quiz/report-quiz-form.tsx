'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { reportQuiz } from './actions'

const reasons = ['SPAM', 'INAPPROPRIATE', 'INCORRECT_ANSWERS', 'COPYRIGHT', 'OTHER'] as const

export function ReportQuizForm({ quizId }: { quizId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Flag className="mr-2 h-4 w-4" />
        Report
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Report this quiz"
        description="Tell us why this quiz should be reviewed by moderators."
      >
        <form
          action={async (formData) => {
            const result = await reportQuiz(formData)
            if (result.ok) {
              setOpen(false)
            }
          }}
          className="space-y-3"
        >
          <input type="hidden" name="quizId" value={quizId} />
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
                  {reason}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Details</span>
            <textarea
              name="details"
              maxLength={500}
              className="min-h-24 w-full rounded-md border px-3 py-2 text-base md:text-sm"
              placeholder="Optional details (max 500 chars)"
            />
          </label>
          <div className="flex justify-end">
            <Button type="submit">Submit report</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
