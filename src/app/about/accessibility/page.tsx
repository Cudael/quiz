import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'BusQuiz targets WCAG AA, supports reduced motion, and runs axe smoke checks in CI.',
  alternates: { canonical: '/about/accessibility' },
}

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Accessibility Statement</h1>
      <p className="mt-4 text-muted-foreground">
        BusQuiz aims for WCAG AA contrast and keyboard-first access across play, creation,
        leaderboard, and moderation flows.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-muted-foreground">
        <li>Visible focus rings on interactive controls.</li>
        <li>Keyboard-accessible navigation and controls.</li>
        <li>Reduced-motion support for timers and celebration effects.</li>
        <li>Automated axe smoke tests for critical routes in CI.</li>
      </ul>
    </div>
  )
}
