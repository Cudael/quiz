import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Bug,
  CircleUserRound,
  FileWarning,
  Lightbulb,
  LockKeyhole,
  Mail,
  MessageSquareText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHero } from '@/components/ui/page-hero'
import { PRIVACY_EMAIL, SUPPORT_EMAIL } from '@/lib/legal'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact BusQuiz for account help, technical support, privacy, or general questions.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact BusQuiz',
    description: 'Find the right way to contact BusQuiz and get help quickly.',
    url: absoluteUrl('/contact'),
  },
  twitter: {
    card: 'summary',
    title: 'Contact BusQuiz',
    description: 'Find the right way to contact BusQuiz and get help quickly.',
  },
}

const contactOptions = [
  {
    icon: Mail,
    title: 'General questions',
    description: 'Questions about BusQuiz, collaboration, or anything that does not fit below.',
    action: `mailto:${PRIVACY_EMAIL}`,
    label: PRIVACY_EMAIL,
    external: true,
    accent: 'text-quiz-purple bg-quiz-purple/10',
  },
  {
    icon: CircleUserRound,
    title: 'Account support',
    description: 'Help with sign-in, verification codes, usernames, passwords, or account access.',
    action: `mailto:${SUPPORT_EMAIL}`,
    label: SUPPORT_EMAIL,
    external: true,
    accent: 'text-quiz-green bg-quiz-green/10',
  },
  {
    icon: Bug,
    title: 'Bug reports',
    description: 'Tell us what happened, what you expected, and which page or device was involved.',
    action: '/feedback',
    label: 'Send a bug report',
    external: false,
    accent: 'text-quiz-orange bg-quiz-orange/10',
  },
  {
    icon: Lightbulb,
    title: 'Ideas and feedback',
    description: 'Suggest a feature, share a usability concern, or tell us what is working well.',
    action: '/feedback',
    label: 'Open feedback form',
    external: false,
    accent: 'text-quiz-blue bg-quiz-blue/10',
  },
] as const

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="Contact BusQuiz"
        icon={<MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />}
        title="How can we help?"
        description="Choose the option that best matches your question. Both email addresses reach the same BusQuiz team, so you only need to send one message."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {contactOptions.map((option) => (
          <Card key={option.title} className="h-full">
            <CardContent className="flex h-full flex-col pt-6">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-md ${option.accent}`}
              >
                <option.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-bold">{option.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </p>
              {option.external ? (
                <a
                  href={option.action}
                  className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-bold text-primary underline-offset-4 hover:underline"
                >
                  {option.label}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  href={option.action}
                  className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-bold text-primary underline-offset-4 hover:underline"
                >
                  {option.label}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <section className="rounded-md border border-t-4 border-t-quiz-purple bg-card p-6">
          <div className="flex items-center gap-3">
            <LockKeyhole className="h-5 w-5 text-quiz-purple" aria-hidden="true" />
            <h2 className="text-lg font-bold">Privacy requests</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            To request access, correction, deletion, restriction, or portability of personal data,
            email{' '}
            <a
              href={`mailto:${PRIVACY_EMAIL}`}
              className="font-semibold text-primary underline underline-offset-4"
            >
              {PRIVACY_EMAIL}
            </a>{' '}
            from the address connected to your account. We may need to verify your identity.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/privacy">Read the Privacy Policy</Link>
          </Button>
        </section>

        <section className="rounded-md border border-t-4 border-t-quiz-orange bg-card p-6">
          <div className="flex items-center gap-3">
            <FileWarning className="h-5 w-5 text-quiz-orange" aria-hidden="true" />
            <h2 className="text-lg font-bold">Quiz or comment concerns</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Use the report control on the quiz or comment when available. It gives moderators the
            relevant content and reason immediately. For intellectual-property concerns, email{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-primary underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>{' '}
            with the content URL and supporting details.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/terms">Review the content rules</Link>
          </Button>
        </section>
      </div>

      <aside className="mt-10 rounded-md border bg-muted/30 p-6 text-center">
        <h2 className="font-bold">Help us understand the issue quickly</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Include the page address, what you were trying to do, what happened, and any exact error
          message. Never email your password, verification code, reset link, or OAuth token.
        </p>
      </aside>
    </div>
  )
}
