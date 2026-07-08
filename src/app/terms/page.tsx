import type { Metadata } from 'next'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Read the terms and conditions for using BusQuiz, including account rules, content guidelines, and limitations.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service | BusQuiz',
    description: 'Read the terms and conditions for using BusQuiz.',
    url: absoluteUrl('/terms'),
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | BusQuiz',
    description: 'Read the terms and conditions for using BusQuiz.',
  },
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-4 text-muted-foreground">Last updated: 9 June 2026</p>
      <p className="mt-4 text-muted-foreground">
        By accessing or using BusQuiz, you agree to be bound by these Terms of Service. If you do
        not agree, please do not use the service.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Eligibility</h2>
        <p className="text-muted-foreground">
          You must be at least 13 years old to use BusQuiz. By creating an account, you confirm that
          you meet this age requirement.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Account Responsibilities</h2>
        <p className="text-muted-foreground">
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity that occurs under your account. You agree to provide accurate and current
          information during registration.
        </p>
        <p className="text-muted-foreground">
          We reserve the right to suspend or terminate accounts that violate these terms or engage
          in abusive behavior.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">User Content</h2>
        <p className="text-muted-foreground">
          By submitting quizzes, questions, or other content to BusQuiz, you grant us a worldwide,
          non-exclusive, royalty-free license to host, display, and distribute your content on the
          platform.
        </p>
        <p className="text-muted-foreground">
          You retain ownership of your content and are solely responsible for ensuring it does not
          infringe on third-party rights or violate any laws.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Acceptable Use</h2>
        <p className="text-muted-foreground">
          You agree not to use BusQuiz for any unlawful purpose or in a way that disrupts the
          service. Prohibited activities include:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Harassment, hate speech, or abusive behavior toward other users.</li>
          <li>Uploading malicious content, spam, or deceptive material.</li>
          <li>Attempting to circumvent security measures or access unauthorized data.</li>
          <li>Using automated tools to scrape, manipulate, or overload the platform.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Intellectual Property</h2>
        <p className="text-muted-foreground">
          The BusQuiz name, logo, and platform design are our intellectual property. You may not use
          them without our prior written permission.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
        <p className="text-muted-foreground">
          BusQuiz is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do
          not guarantee uninterrupted access or error-free operation. To the fullest extent
          permitted by law, we disclaim all warranties and shall not be liable for any damages
          arising from your use of the service.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Termination</h2>
        <p className="text-muted-foreground">
          You may stop using BusQuiz at any time. We may suspend or terminate your access if you
          violate these terms, with or without notice.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Changes to These Terms</h2>
        <p className="text-muted-foreground">
          We may update these Terms of Service from time to time. Continued use of the platform
          after changes are posted constitutes your acceptance of the revised terms.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p className="text-muted-foreground">
          For questions about these terms, please visit our{' '}
          <Link href="/contact" className="text-primary underline underline-offset-4">
            contact page
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
