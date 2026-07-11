'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    setStatus('submitting')
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)
    const result = await submitFeedback(formData)

    if (result.ok) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMessage(result.message)
    }
  }

  if (status === 'success') {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-bold">Thanks for your feedback!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll review it and get back to you if needed.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="feedback-type" className="text-sm font-medium">
              Feedback Type
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
              placeholder="Tell us what's on your mind..."
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

          {status === 'error' && <p className="text-sm text-destructive">{errorMessage}</p>}

          <Button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-md font-bold"
          >
            {status === 'submitting' ? 'Sending...' : 'Send Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
