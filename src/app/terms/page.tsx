import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_ADDRESS, LEGAL_NAME, POLICY_LAST_UPDATED, SUPPORT_EMAIL } from '@/lib/legal'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms for using BusQuiz, including account rules, creator content, moderation, and service limitations.',
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

const linkClassName = 'text-primary underline underline-offset-4'

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-4 text-muted-foreground">Last updated: {POLICY_LAST_UPDATED}</p>
      <p className="mt-4 text-muted-foreground">
        These terms are an agreement between you and <strong>{LEGAL_NAME}</strong>, the operator of
        BusQuiz{LEGAL_ADDRESS ? `, located at ${LEGAL_ADDRESS}` : ''}. By using BusQuiz, you agree
        to these terms. If you do not agree, do not use the service.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">The service</h2>
        <p className="text-muted-foreground">
          BusQuiz is a free quiz and trivia platform where visitors can browse and play, and account
          holders can track progress, interact with the community, and create content. Features may
          change, be interrupted, or be discontinued. We do not promise that every feature or item
          of content will always be available.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Eligibility</h2>
        <p className="text-muted-foreground">
          You must be at least 13 years old. If the law where you live requires permission from a
          parent or legal guardian to use an online service, you may use BusQuiz only with that
          permission. A parent or guardian who allows a minor to use BusQuiz is responsible for
          supervising that use.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Accounts and usernames</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Provide accurate account information and keep your credentials secure.</li>
          <li>Email/password accounts must verify their email before sign-in.</li>
          <li>
            Your username is your public display identity. Do not impersonate another person or use
            a username that is unlawful, deceptive, infringing, or abusive.
          </li>
          <li>Tell us promptly if you believe your account has been compromised.</li>
          <li>You are responsible for activity performed through your account.</li>
        </ul>
        <p className="text-muted-foreground">
          Signed-out visitors may play supported modes anonymously. Anonymous activity may be
          temporary, may not be recoverable, and does not receive every account feature.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Your content</h2>
        <p className="text-muted-foreground">
          You retain ownership of quizzes, comments, images, playlists, feedback, and other content
          you submit. You grant BusQuiz a worldwide, non-exclusive, royalty-free licence to host,
          store, reproduce, format, display, distribute, and make that content available as needed
          to operate, improve, moderate, and promote BusQuiz. This licence includes allowing our
          service providers to perform those tasks for us. It lasts while the content is hosted and
          for a reasonable backup period after deletion.
        </p>
        <p className="text-muted-foreground">
          You confirm that you have the rights and permissions needed to submit the content and to
          grant this licence. Do not upload confidential information or personal data about another
          person without a lawful reason and any required permission.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Quiz review and moderation</h2>
        <p className="text-muted-foreground">
          Creator quizzes are not public automatically. Submission places a quiz into review, and
          only an administrator may approve and publish it. We may reject, unpublish, restrict,
          edit, label, or remove content that violates these terms, creates risk, receives credible
          reports, or does not meet publication standards. Review does not guarantee that a quiz is
          accurate, original, lawful, or suitable for every audience.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Acceptable use</h2>
        <p className="text-muted-foreground">You must not:</p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>
            Break the law, infringe intellectual-property or privacy rights, or encourage harm.
          </li>
          <li>Harass, threaten, impersonate, exploit, or publish hateful or abusive material.</li>
          <li>
            Upload malware, spam, deceptive material, or content designed to manipulate users.
          </li>
          <li>Cheat, manipulate scores, votes, ratings, leaderboards, or account metrics.</li>
          <li>
            Circumvent access controls, probe for vulnerabilities, or access another user&apos;s
            data.
          </li>
          <li>
            Scrape, copy, or automate access at a scale that burdens BusQuiz, except through an
            expressly provided public API and in accordance with its limits.
          </li>
          <li>
            Use BusQuiz content or infrastructure to train a competing model or service without
            permission.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Intellectual property and reports</h2>
        <p className="text-muted-foreground">
          BusQuiz software, branding, original design, and operator-provided content are protected
          by intellectual-property law. These terms do not transfer those rights to you. If you
          believe content infringes your copyright or other rights, send the content URL, a clear
          description of the work or right, your contact details, and supporting information to{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClassName}>
            {SUPPORT_EMAIL}
          </a>
          . We may ask for identity or authority verification before acting.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Quiz information and game results</h2>
        <p className="text-muted-foreground">
          Quizzes are for entertainment and general learning. They may contain mistakes and are not
          professional, medical, legal, financial, or other specialist advice. Scores, XP, badges,
          streaks, rankings, duel ratings, and similar items have no cash value, are not property,
          and do not entitle you to a prize unless separate written rules explicitly say otherwise.
          We may correct errors or recalculate results affected by cheating or technical faults.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Third-party services and links</h2>
        <p className="text-muted-foreground">
          BusQuiz relies on third-party hosting, sign-in, email, storage, analytics, and optional AI
          providers. Third-party links and services are governed by their own terms and privacy
          policies. We are not responsible for third-party sites that we do not control.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Suspension, deletion, and termination</h2>
        <p className="text-muted-foreground">
          You may stop using BusQuiz or delete your account in profile settings. We may restrict,
          suspend, or terminate access, and remove content, where reasonably necessary to enforce
          these terms, protect users or the service, comply with law, or address serious security
          risk. Where appropriate, we will consider the nature of the issue and give notice or an
          opportunity to appeal. Provisions that by their nature should survive termination remain
          effective, including ownership, licences already needed for backups, and liability terms.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Disclaimers and liability</h2>
        <p className="text-muted-foreground">
          BusQuiz is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the
          extent permitted by law, we do not give warranties that the service will be uninterrupted,
          error-free, secure, or that user content will be accurate. We are not liable for indirect
          or unforeseeable loss, loss caused by events outside our reasonable control, or loss
          caused by your breach of these terms.
        </p>
        <p className="text-muted-foreground">
          Nothing in these terms excludes or limits liability that cannot legally be excluded,
          including liability for fraud, intentional misconduct, or death or personal injury caused
          by negligence where applicable. Nothing limits mandatory consumer rights available to you.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Law and disputes</h2>
        <p className="text-muted-foreground">
          These terms are governed by Latvian law, without depriving consumers in the European
          Economic Area or elsewhere of mandatory protections under the law of their country. Please
          contact us first so we can try to resolve a dispute. Courts with jurisdiction under
          applicable law may hear unresolved disputes.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Changes and contact</h2>
        <p className="text-muted-foreground">
          We may update these terms when the service or law changes. For material changes, we will
          provide reasonable notice where required. Changes apply from the stated effective date;
          continued use after that date means you accept the updated terms. If a provision is found
          unenforceable, the remaining provisions continue to apply.
        </p>
        <p className="text-muted-foreground">
          Questions can be sent to{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClassName}>
            {SUPPORT_EMAIL}
          </a>
          , through our{' '}
          <Link href="/contact" className={linkClassName}>
            contact page
          </Link>
          , or under the privacy process described in our{' '}
          <Link href="/privacy" className={linkClassName}>
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
