'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { submitFeedback } from './actions'

const FEEDBACK_TYPES = [
  { value: 'BUG_REPORT', label: 'Bug Report' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'GENERAL_FEEDBACK', label: 'General Feedback' },
  { value: 'CONTENT_ISSUE', label: 'Content Issue' },
] as const

export function FeedbackForm({ defaultEmail }: { defaultEmail: string }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setStatus('submitting')
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)
    const result = await submitFeedback(formData)

    if (result.ok) {
      form.reset()
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMessage(result.message)
    }
  }

  if (status === 'success') {
    return (
      <Card role="status" aria-live="polite">
        <CardContent className="py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-quiz-green/10 text-quiz-green">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-bold">Thanks for your feedback</p>
          <p className="mt-1 text-sm text-muted-foreground">
            It has been sent to the BusQuiz team for review.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={() => setStatus('idle')}>
              Send more feedback
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell us what you noticed</CardTitle>
        <CardDescription>
          Fields marked as required must be completed. Messages can contain up to 5,000 characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="feedback-type" className="text-sm font-medium">
              Feedback type
            </label>
            <select
              id="feedback-type"
              name="type"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-base md:text-sm"
            >
              {FEEDBACK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="feedback-message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="feedback-message"
              name="message"
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              placeholder="What happened, or what would you like us to improve?"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-y md:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="feedback-email" className="text-sm font-medium">
              Email <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="feedback-email"
              name="email"
              type="email"
              defaultValue={defaultEmail}
              placeholder="your@email.com"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary md:text-sm"
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll only use this to follow up on your feedback.
            </p>
          </div>

          {status === 'error' && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-md font-bold"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {status === 'submitting' ? 'Sending…' : 'Send feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
