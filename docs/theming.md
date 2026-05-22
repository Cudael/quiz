# Theming guide

QuizArena uses CSS-variable-driven semantic tokens in `src/app/globals.css`.

## Core idea

- `:root` defines light values.
- `.dark` overrides dark values.
- Tailwind semantic utilities (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`) read those variables.

## Hero gradient

`bg-hero-gradient` is backed by `--background-image-hero-gradient`, which is built from `--hero-stop-*` variables.
Each theme sets different stop values so the hero/CTA surfaces change when theme changes.
The gradient uses a mesh/multi-stop radial approach for more visual depth in both themes.

## Surface elevation tiers

Three tiers exist for layering surfaces above the page background:

| Utility        | Variable      | Use                                |
| -------------- | ------------- | ---------------------------------- |
| `bg-surface-1` | `--surface-1` | Slightly elevated panels, sidebars |
| `bg-surface-2` | `--surface-2` | Cards on surface-1                 |
| `bg-surface-3` | `--surface-3` | Floating elements, tooltips        |

These map to `--color-surface-*` in the `@theme` block.

## Warning token

`--warning` / `--warning-foreground` is available as `bg-warning` / `text-warning` / `text-warning-foreground`.
Use it for countdown urgency, amber status badges, and time-sensitive UI — **not** `text-yellow-*` or hex.

## Shadow scale

Three CSS custom properties are available for box shadows that adapt to light/dark:

| Property      | Use                        |
| ------------- | -------------------------- |
| `--shadow-sm` | Subtle card lift           |
| `--shadow-md` | Elevated panels, dropdowns |
| `--shadow-lg` | Modals, floating UI        |

Apply via `style={{ boxShadow: 'var(--shadow-md)' }}` or extend Tailwind config if needed.
Dark-mode shadows use a blue-tinted dark hue instead of pitch black.

## Do / Don't

### ✅ Do

- Use semantic tokens for surfaces/text/borders:
  - `bg-background`, `bg-card`, `bg-muted`, `bg-surface-1`, `bg-surface-2`
  - `text-foreground`, `text-muted-foreground`
  - `border-border`
- Use `bg-warning` / `text-warning` for amber/urgency states.
- Keep branded accents (`quiz-*`) for highlights/illustrative UI only.

### ❌ Don't

- Hardcode theme-breaking classes like `text-white`, `text-black`, `bg-white`, `bg-black`, `text-gray-*`, `bg-gray-*` in normal app surfaces.
- Use raw hex Tailwind classes (`text-[#fff]`, etc.) for regular UI copy.

## Guardrail

Run `npm run lint` to execute `scripts/check-hardcoded-colors.mjs`, which fails when banned hardcoded color classes are introduced outside the documented allowlist.

## Motion presets

Standardized Framer Motion variants live in `src/lib/motion.ts`:

- `fadeUp` — element fades in from below (cards, hero text)
- `fadeIn` — simple fade (overlays, images)
- `scaleIn` — scale from 95% (modals, cards)
- `none` — no-op for reduced-motion
- `staggerContainer(ms)` — wraps children with stagger
- `withReducedMotion(variants, shouldReduce)` — respects `prefers-reduced-motion`

Always pair animation with `useReducedMotion()` from `framer-motion` and pass the result to `withReducedMotion`.
