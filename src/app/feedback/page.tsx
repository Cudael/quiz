import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Bug, Lightbulb, MessageSquareText, ShieldCheck } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { auth } from '@/server/auth'
import { FeedbackForm } from './feedback-form'

export const metadata: Metadata = {
  title: 'Send Feedback',
  description: 'Report a problem, suggest a feature, or share feedback with the BusQuiz team.',
  robots: { index: false },
}

export default async function FeedbackPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/feedback')
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="Product feedback"
        icon={<MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />}
        title="Help shape BusQuiz"
        description="Report something that went wrong, suggest an improvement, or tell us what made a quiz experience work well."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <FeedbackForm defaultEmail={session.user.email ?? ''} />

        <aside className="space-y-5">
          <div className="rounded-md border bg-card p-5">
            <h2 className="font-bold">Useful details to include</h2>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <Bug className="mt-0.5 h-4 w-4 shrink-0 text-quiz-orange" aria-hidden="true" />
                The page address, device, and exact error for a bug.
              </li>
              <li className="flex gap-3">
                <Lightbulb
                  className="mt-0.5 h-4 w-4 shrink-0 text-quiz-yellow"
                  aria-hidden="true"
                />
                The problem your feature idea would solve.
              </li>
              <li className="flex gap-3">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-quiz-green"
                  aria-hidden="true"
                />
                A quiz or comment URL when reporting content.
              </li>
            </ul>
          </div>

          <div className="rounded-md border bg-muted/30 p-5">
            <h2 className="font-bold">Keep account details safe</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Never include your password, verification code, reset link, or OAuth token. Your
              signed-in account already tells us who submitted the feedback.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
