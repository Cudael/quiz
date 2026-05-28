import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | BusQuiz',
  description:
    'Learn what BusQuiz collects, how it is used, and how to contact us about privacy requests.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">Last updated: 28 May 2025</p>
      <p className="mt-4 text-muted-foreground">
        This Privacy Policy explains what information BusQuiz collects, how we use it, and the
        choices you have about your data when you use the service.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Information We Collect</h2>
        <p className="text-muted-foreground">
          We may collect account details such as your email address and username, along with profile
          information provided by sign-in providers like GitHub or Google.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Account information, including email address and username.</li>
          <li>OAuth profile information shared by GitHub or Google during sign-in.</li>
          <li>Quiz play history, scores, streaks, and badges earned in the app.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
        <p className="text-muted-foreground">
          We use your information to operate BusQuiz, personalise your experience, and maintain
          account features such as progress tracking and achievements.
        </p>
        <p className="text-muted-foreground">
          If you choose to receive them, we may also send optional email notifications related to
          your account or activity.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Data Sharing</h2>
        <p className="text-muted-foreground">
          We do not sell your personal data. OAuth access tokens are used only to support secure
          sign-in and are not used for unrelated third-party marketing or data sales.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Data Retention</h2>
        <p className="text-muted-foreground">
          We keep account-related data while your account remains active so that your profile,
          history, and achievements continue to work as expected.
        </p>
        <p className="text-muted-foreground">
          Guest accounts do not include a persistent email address, and their retained information
          is limited compared with registered accounts.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Your Rights</h2>
        <p className="text-muted-foreground">
          You may request access to, correction of, or deletion of your personal data by contacting
          us.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p className="text-muted-foreground">
          For privacy-related questions or requests, please visit our{' '}
          <Link href="/contact" className="text-primary underline underline-offset-4">
            contact page
          </Link>
          .
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Changes to this Policy</h2>
        <p className="text-muted-foreground">
          We may update this Privacy Policy from time to time. When we do, we will revise the last
          updated date shown at the top of this page.
        </p>
      </section>
    </div>
  )
}
