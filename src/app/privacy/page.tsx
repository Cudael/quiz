import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { absoluteUrl } from '@/lib/site'
import { LEGAL_ADDRESS, LEGAL_NAME, POLICY_LAST_UPDATED, PRIVACY_EMAIL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn what personal data BusQuiz processes, why it is used, and how to exercise your privacy rights.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy | BusQuiz',
    description:
      'Learn what personal data BusQuiz processes, why it is used, and how to exercise your privacy rights.',
    url: absoluteUrl('/privacy'),
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | BusQuiz',
    description: 'Learn what personal data BusQuiz processes and how it is used.',
  },
}

const linkClassName = 'text-primary underline underline-offset-4'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        eyebrow="Legal"
        accent="purple"
        title="Privacy Policy"
        description="How BusQuiz processes personal data and how you can exercise your privacy rights."
        className="mb-4"
      />
      <p className="mt-4 text-muted-foreground">Last updated: {POLICY_LAST_UPDATED}</p>
      <p className="mt-4 text-muted-foreground">
        This policy explains how BusQuiz processes personal data when you browse, play, create an
        account, publish content, or contact us. It should be read together with our{' '}
        <Link href="/cookies" className={linkClassName}>
          Cookie Policy
        </Link>
        .
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Who controls your data</h2>
        <p className="text-muted-foreground">
          <strong>{LEGAL_NAME}</strong> is the controller of personal data processed through
          BusQuiz. BusQuiz is operated from Latvia.
        </p>
        {LEGAL_ADDRESS ? (
          <p className="text-muted-foreground">Postal address: {LEGAL_ADDRESS}</p>
        ) : null}
        <p className="text-muted-foreground">
          Privacy requests:{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClassName}>
            {PRIVACY_EMAIL}
          </a>
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Data we process</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>
            <strong>Account and authentication data:</strong> email address, username, password
            hash, email-verification status, account identifiers, sign-in sessions, and security
            tokens. Verification codes and reset tokens are stored in hashed form.
          </li>
          <li>
            <strong>OAuth data:</strong> if you choose Google or GitHub sign-in, we receive your
            email address, provider account identifier, and authentication data needed to connect
            and secure the account. We do not save your provider profile name as your BusQuiz
            display name; you choose a username instead.
          </li>
          <li>
            <strong>Profile and community data:</strong> username, optional avatar, bio, banner,
            follows, favourites, playlists, ratings, comments, reports, feedback, and quizzes or
            other content you submit.
          </li>
          <li>
            <strong>Gameplay data:</strong> answers, scores, play history, timing, difficulty,
            streaks, XP, levels, badges, quests, leaderboard results, and duel or survival activity.
            Signed-out play may be linked to a random browser identifier rather than an account.
          </li>
          <li>
            <strong>Technical and security data:</strong> IP address, request metadata, device and
            browser information, cookies, rate-limit records, and diagnostic or abuse-prevention
            logs.
          </li>
          <li>
            <strong>Analytics data:</strong> page views, usage events, device/browser details, and
            approximate location only when you enable Analytics in the consent settings.
          </li>
          <li>
            <strong>Communications:</strong> messages and any contact email you provide through
            support, feedback, reports, or other correspondence.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Why we use it</h2>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">GDPR legal basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="px-4 py-3">
                  Provide accounts, gameplay, profiles, creator tools, and requested emails
                </td>
                <td className="px-4 py-3">Performance of our contract with you</td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  Secure the service, prevent abuse, moderate content, and improve reliability
                </td>
                <td className="px-4 py-3">
                  Our legitimate interests in operating a safe and reliable service
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">Comply with lawful requests and legal duties</td>
                <td className="px-4 py-3">Compliance with a legal obligation</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Measure site usage with Google Analytics</td>
                <td className="px-4 py-3">Your consent, which you may withdraw at any time</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Send optional digest or promotional communications</td>
                <td className="px-4 py-3">
                  Consent where required; you may disable the weekly digest in account settings
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">What is public</h2>
        <p className="text-muted-foreground">
          Usernames, avatars, bios, published quizzes, public playlists, ratings, comments,
          achievements, and leaderboard results may be visible to anyone. Your email address,
          password, authentication tokens, private drafts, and detailed account settings are not
          displayed publicly. Avoid placing personal or sensitive information in public content.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Service providers and sharing</h2>
        <p className="text-muted-foreground">
          We do not sell personal data. We share data only when needed to operate BusQuiz, follow
          your instructions, protect rights and safety, complete a business transfer, or comply with
          law. Providers may include:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Vercel for application hosting and delivery.</li>
          <li>Neon for PostgreSQL database hosting.</li>
          <li>Cloudflare R2 for user-uploaded image storage and delivery.</li>
          <li>Upstash for rate limiting and short-lived play-security records.</li>
          <li>Google Workspace for transactional and account email.</li>
          <li>Google and GitHub when you choose their sign-in option.</li>
          <li>Google Analytics only after you consent.</li>
          <li>
            OpenAI when an authorised creator or administrator deliberately uses an AI-assisted quiz
            generation, image-search, or fact-checking feature; the submitted prompt and quiz
            context needed for that request may be sent to OpenAI.
          </li>
        </ul>
        <p className="text-muted-foreground">
          These companies process data under their own terms and privacy commitments. Some may
          process data outside Latvia or the European Economic Area. Where GDPR requires it, such
          transfers rely on an adequacy decision, standard contractual clauses, or another lawful
          safeguard.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Retention</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Account and associated activity are generally kept while your account is active.</li>
          <li>Account sessions can remain valid for up to 30 days.</li>
          <li>
            Email-verification codes expire after 15 minutes; password-reset links expire after 1
            hour.
          </li>
          <li>The anonymous gameplay identifier can remain in your browser for up to 1 year.</li>
          <li>Consent and preference storage remains until you change it or clear browser data.</li>
          <li>
            Security, moderation, backup, and legal records are kept only as long as reasonably
            necessary for their purpose or a legal obligation.
          </li>
        </ul>
        <p className="text-muted-foreground">
          You can delete your account in profile settings. Deletion removes the account and data
          directly tied to it, subject to temporary backups and records we must retain for security,
          legal claims, or legal obligations. Aggregated or irreversibly de-identified statistics
          may remain.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Your privacy rights</h2>
        <p className="text-muted-foreground">
          Depending on the law that applies, you may request access to your data, correction,
          deletion, restriction, portability, or object to processing based on legitimate interests.
          You may withdraw consent at any time without affecting earlier lawful processing. We may
          need to verify your identity before acting on a request.
        </p>
        <p className="text-muted-foreground">
          Send requests to{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClassName}>
            {PRIVACY_EMAIL}
          </a>
          . You also have the right to complain to Latvia&apos;s{' '}
          <a
            href="https://www.dvi.gov.lv/en/services/complaint-concerning-processing-personal-data"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            Data State Inspectorate
          </a>{' '}
          or the supervisory authority where you live or work.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Children</h2>
        <p className="text-muted-foreground">
          BusQuiz is not intended for children under 13. If local law requires parental or guardian
          permission for a young person to use an online service, that permission must be obtained.
          If you believe a child provided personal data contrary to this rule, contact us so we can
          investigate and remove it where appropriate.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Security and automated processing</h2>
        <p className="text-muted-foreground">
          We use technical and organisational safeguards such as password hashing, hashed one-time
          tokens, access controls, secure cookies, rate limits, and encrypted transport. No system
          can guarantee absolute security.
        </p>
        <p className="text-muted-foreground">
          BusQuiz automatically calculates scores, ranks, recommendations, and achievements. These
          features do not produce legal or similarly significant effects. We do not use solely
          automated decision-making of that kind.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Changes and contact</h2>
        <p className="text-muted-foreground">
          We may update this policy when the service or law changes. Material changes will be given
          reasonable notice where required, and the date above will be updated. For questions, email{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClassName}>
            {PRIVACY_EMAIL}
          </a>{' '}
          or use our{' '}
          <Link href="/contact" className={linkClassName}>
            contact page
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
