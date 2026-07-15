import type { Metadata } from 'next'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How BusQuiz uses cookies, browser storage, and optional analytics.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Cookie Policy | BusQuiz',
    description: 'How BusQuiz uses cookies, browser storage, and optional analytics.',
    url: absoluteUrl('/cookies'),
  },
}

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <p className="mt-4 text-muted-foreground">Last updated: 15 July 2026</p>
      <p className="mt-4 text-muted-foreground">
        This policy explains how BusQuiz uses cookies and similar browser storage. Cookies are small
        pieces of data stored by your browser; local storage keeps preferences on your device in a
        similar way.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Necessary storage</h2>
        <p className="text-muted-foreground">
          These technologies support features you request and are not used for advertising. They
          remain available when optional analytics is rejected.
        </p>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3">Storage</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Typical duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="px-4 py-3">Auth.js cookies</td>
                <td className="px-4 py-3">Sign-in sessions, security, and safe redirects</td>
                <td className="px-4 py-3">Session or configured account-session duration</td>
              </tr>
              <tr>
                <td className="px-4 py-3">qa_guest_id</td>
                <td className="px-4 py-3">Recognises an anonymous duel participant</td>
                <td className="px-4 py-3">Up to 1 year</td>
              </tr>
              <tr>
                <td className="px-4 py-3">BusQuiz preference storage</td>
                <td className="px-4 py-3">
                  Remembers consent, theme, sound, motion, and creator-layout choices
                </td>
                <td className="px-4 py-3">Until changed or browser storage is cleared</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Optional analytics</h2>
        <p className="text-muted-foreground">
          If you accept analytics, Google Analytics loads and may set cookies such as{' '}
          <code>_ga</code> and <code>_ga_&lt;container-id&gt;</code>. These help us understand page
          visits, usage patterns, device/browser information, and approximate location. Google
          Analytics cookies may remain for up to 2 years unless you withdraw consent or clear them.
        </p>
        <p className="text-muted-foreground">
          Analytics is disabled by default and the Google Analytics script is not requested before
          consent. Withdrawing consent stops future Analytics collection and BusQuiz attempts to
          remove its first-party Analytics cookies.
        </p>
        <p className="text-muted-foreground">
          Google acts as the analytics provider. You can read the{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Google Privacy Policy
          </a>{' '}
          for more information about Google&apos;s processing.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Advertising</h2>
        <p className="text-muted-foreground">
          BusQuiz does not currently use advertising cookies. Before introducing advertising
          technology, we will update this policy and request the required choices through an
          advertising-compatible consent platform.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Changing your choice</h2>
        <p className="text-muted-foreground">
          Use the <strong>Cookie settings</strong> button in the site footer at any time. You can
          also clear BusQuiz data through your browser settings. Rejecting optional analytics does
          not prevent you from using the core site.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">More information</h2>
        <p className="text-muted-foreground">
          See our{' '}
          <Link href="/privacy" className="text-primary underline underline-offset-4">
            Privacy Policy
          </Link>{' '}
          for information about personal data and your rights, or use the{' '}
          <Link href="/contact" className="text-primary underline underline-offset-4">
            contact page
          </Link>{' '}
          for privacy questions.
        </p>
      </section>
    </div>
  )
}
