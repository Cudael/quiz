import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact | BusQuiz',
  description: 'Get in touch with the BusQuiz team for support, privacy requests, or general help.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | BusQuiz',
    description:
      'Get in touch with the BusQuiz team for support, privacy requests, or general help.',
    url: absoluteUrl('/contact'),
  },
  twitter: {
    card: 'summary',
    title: 'Contact | BusQuiz',
    description: 'Get in touch with the BusQuiz team.',
  },
}

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-4 text-muted-foreground">
        We&apos;d love to hear from you. Reach out with support questions, privacy requests, or
        general feedback about BusQuiz.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Contact Options</h2>
        <p className="text-muted-foreground">
          Email us at{' '}
          <a href="mailto:hello@busquiz.com" className="text-primary underline underline-offset-4">
            hello@busquiz.com
          </a>
          .
        </p>
        <p className="text-muted-foreground">
          You can also reach the team through the placeholder Discord and Twitter / X links in the
          site footer.
        </p>
      </section>
    </div>
  )
}
