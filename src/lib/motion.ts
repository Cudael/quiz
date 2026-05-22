/**
 * Standardized Framer Motion presets.
 * Always wrap animation usage with `useReducedMotion` from framer-motion
 * and skip or snap to final state when it returns true.
 *
 * Usage:
 *   const shouldReduce = useReducedMotion()
 *   const variants = shouldReduce ? motionPresets.none : motionPresets.fadeUp
 */

import type { Variants, Transition } from 'framer-motion'

/* ─── Transition presets ─────────────────────────────────────────────────── */

export const transitions = {
  /** Fast spring — UI element snap */
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 28,
  } satisfies Transition,

  /** Gentle spring — content slides */
  springGentle: {
    type: 'spring',
    stiffness: 200,
    damping: 24,
  } satisfies Transition,

  /** Simple eased fade (200 ms) */
  ease: {
    duration: 0.2,
    ease: 'easeOut',
  } satisfies Transition,

  /** Longer eased reveal (400 ms) */
  easeMd: {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1],
  } satisfies Transition,
} as const

/* ─── Variant presets ────────────────────────────────────────────────────── */

/** Element fades in from below — use for cards, hero text, etc. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: transitions.easeMd },
}

/** Element fades in — use for overlays, images, secondary content */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transitions.ease },
}

/** Element scales in from 95% — use for modals, cards */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: transitions.spring },
}

/** No-op preset — use when reduced-motion is active */
export const none: Variants = {
  hidden: {},
  show: {},
}

/* ─── Stagger container presets ──────────────────────────────────────────── */

/**
 * Container that staggers its children.
 * Pair with `fadeUp`, `fadeIn`, or `scaleIn` on children.
 */
export function staggerContainer(staggerMs = 0.08): Variants {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerMs,
        delayChildren: 0,
      },
    },
  }
}

/* ─── Convenience wrapper for reduced-motion ─────────────────────────────── */

/**
 * Returns the given variants, or the `none` preset if the user prefers
 * reduced motion. Pass the result of `useReducedMotion()` as `shouldReduce`.
 */
export function withReducedMotion(variants: Variants, shouldReduce: boolean | null): Variants {
  return shouldReduce ? none : variants
}
