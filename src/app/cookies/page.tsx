import type { Metadata } from 'next'
import Link from 'next/link'
import { POLICY_LAST_UPDATED, PRIVACY_EMAIL } from '@/lib/legal'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How BusQuiz uses cookies, local storage, and optional analytics.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Cookie Policy | BusQuiz',
    description: 'How BusQuiz uses cookies, local storage, and optional analytics.',
    url: absoluteUrl('/cookies'),
  },
}

const linkClassName = 'text-primary underline underline-offset-4'

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <p className="mt-4 text-muted-foreground">Last updated: {POLICY_LAST_UPDATED}</p>
      <p className="mt-4 text-muted-foreground">
        This policy explains how BusQuiz uses cookies and similar technologies. Cookies are small
        files stored by your browser. Local storage saves settings on your device, while cache and
        service-worker storage help pages and assets load reliably, including limited offline use.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Necessary and preference storage</h2>
        <p className="text-muted-foreground">
          These technologies provide features you request, secure the service, or remember your
          settings. They remain available when optional Analytics is rejected.
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
                <td className="px-4 py-3">
                  Sign-in, account security, OAuth checks, and safe redirects
                </td>
                <td className="px-4 py-3">Temporary or up to 30 days</td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <code>qa_guest_id</code>
                </td>
                <td className="px-4 py-3">
                  Recognises the same signed-out browser during anonymous gameplay, including duels
                </td>
                <td className="px-4 py-3">Up to 1 year</td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <code>busquiz-consent-v1</code>
                </td>
                <td className="px-4 py-3">Records your optional Analytics choice</td>
                <td className="px-4 py-3">Until changed or browser data is cleared</td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <code>theme</code>, <code>reducedMotion</code>, and{' '}
                  <code>quiz-sound-enabled</code>
                </td>
                <td className="px-4 py-3">Remembers appearance, motion, and sound preferences</td>
                <td className="px-4 py-3">Until changed or browser data is cleared</td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <code>studio-quiz-layout</code>
                </td>
                <td className="px-4 py-3">Remembers a signed-in creator&apos;s Studio layout</td>
                <td className="px-4 py-3">Until changed or browser data is cleared</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Cache and service-worker storage</td>
                <td className="px-4 py-3">
                  Caches public application files and an offline fallback; it does not create an
                  advertising profile
                </td>
                <td className="px-4 py-3">Until refreshed or browser site data is cleared</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Optional Google Analytics</h2>
        <p className="text-muted-foreground">
          If you accept Analytics, BusQuiz requests the Google Analytics script. Google may then set
          cookies such as <code>_ga</code> and <code>_ga_&lt;container-id&gt;</code> to measure page
          visits, usage events, device/browser information, and approximate location. These cookies
          may remain for up to 2 years unless you withdraw consent or clear them.
        </p>
        <p className="text-muted-foreground">
          Analytics is off by default: the script is not requested before you choose to enable it.
          Withdrawing consent stops future Analytics collection from BusQuiz and triggers an attempt
          to remove its first-party Analytics cookies. Google may process this data under the{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            Google Privacy Policy
          </a>
          .
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Advertising</h2>
        <p className="text-muted-foreground">
          BusQuiz does not currently load advertising scripts or use advertising cookies. Before
          advertising is activated, we will update this policy and deploy a Google-certified consent
          management platform for visitors in the EEA, United Kingdom, and Switzerland where
          required. Rejecting advertising consent will not block access to core BusQuiz features.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Manage your choices</h2>
        <p className="text-muted-foreground">
          Select <strong>Cookie settings</strong> in the footer at any time to enable or reject
          optional Analytics. You can also delete cookies and local storage in your browser.
          Blocking necessary storage may prevent sign-in, anonymous game continuity, preferences, or
          offline features from working correctly.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">More information</h2>
        <p className="text-muted-foreground">
          See our{' '}
          <Link href="/privacy" className={linkClassName}>
            Privacy Policy
          </Link>{' '}
          for more information about personal data and your rights. Questions can be sent to{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClassName}>
            {PRIVACY_EMAIL}
          </a>{' '}
          or through our{' '}
          <Link href="/contact" className={linkClassName}>
            contact page
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
