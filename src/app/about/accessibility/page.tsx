import type { Metadata } from 'next'
import Link from 'next/link'
import { POLICY_LAST_UPDATED, SUPPORT_EMAIL } from '@/lib/legal'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    'BusQuiz accessibility goals, supported features, known limitations, and feedback contact.',
  alternates: { canonical: '/about/accessibility' },
  openGraph: {
    title: 'Accessibility Statement | BusQuiz',
    description:
      'BusQuiz accessibility goals, supported features, known limitations, and feedback contact.',
    url: absoluteUrl('/about/accessibility'),
  },
}

const linkClassName = 'text-primary underline underline-offset-4'

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Accessibility Statement</h1>
      <p className="mt-4 text-muted-foreground">Last updated: {POLICY_LAST_UPDATED}</p>
      <p className="mt-4 text-muted-foreground">
        BusQuiz wants quiz discovery, play, creation, and community features to be usable by as many
        people as possible. We use the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA as
        our design and improvement target. This is a target, not a claim that every page and every
        item of user-created content currently conforms in full.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Accessibility features</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Semantic headings, labels, landmarks, and visible keyboard focus indicators.</li>
          <li>Keyboard-operable navigation, dialogs, forms, and primary quiz controls.</li>
          <li>Light and dark themes with semantic colour and contrast tokens.</li>
          <li>A reduced-motion setting for people who prefer fewer animations.</li>
          <li>Text alternatives required for core image-upload and interface workflows.</li>
          <li>Responsive layouts that support zoom and common mobile screen sizes.</li>
          <li>Automated accessibility smoke checks on representative routes during development.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Known limitations</h2>
        <p className="text-muted-foreground">
          We are continuing to assess and improve the site. Current or possible limitations include:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>
            User-created quiz images, audio, wording, captions, and colour choices may vary in
            accessibility even though creator tools provide guidance and validation.
          </li>
          <li>
            Image-hotspot, ordering, matching, memory, and other highly visual or time-based quiz
            formats may be harder to use with some assistive technologies.
          </li>
          <li>
            Some older or third-party content may not yet have complete text alternatives or
            transcripts.
          </li>
          <li>
            Automated checks cannot identify every barrier, and a full independent WCAG audit has
            not yet been completed.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Compatibility and technical basis</h2>
        <p className="text-muted-foreground">
          BusQuiz is designed for current versions of major browsers and the assistive technologies
          they support. Accessibility depends on HTML, CSS, JavaScript, and WAI-ARIA. Very old
          browsers, disabled JavaScript, or unusual browser extensions may reduce functionality.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">How we assess accessibility</h2>
        <p className="text-muted-foreground">
          We use code review, automated axe-based smoke tests, lint rules, keyboard checks, and
          testing of representative components. Accessibility is reviewed as features change. We
          plan to expand manual assistive-technology testing and document confirmed issues here.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Feedback and alternative access</h2>
        <p className="text-muted-foreground">
          If you encounter a barrier or need content in another accessible form, email{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClassName}>
            {SUPPORT_EMAIL}
          </a>{' '}
          or use the{' '}
          <Link href="/contact" className={linkClassName}>
            contact page
          </Link>
          . Please include the page address, what you were trying to do, the problem you
          encountered, and—if you are comfortable sharing it—your browser and assistive technology.
          We will review the request and try to provide a reasonable alternative.
        </p>
      </section>
    </div>
  )
}
