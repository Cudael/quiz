import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { FeedbackForm } from './feedback-form'

export const metadata: Metadata = {
  title: 'Send Feedback',
  robots: { index: false },
}

export default async function FeedbackPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/feedback')
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Send Us Feedback</h1>
        <p className="mt-2 text-muted-foreground">
          We read every piece of feedback. Help us make BusQuiz better.
        </p>
      </div>

      <FeedbackForm defaultEmail={session.user.email ?? ''} />
    </div>
  )
}
