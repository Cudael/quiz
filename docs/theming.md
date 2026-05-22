# Theming guide

QuizArena uses CSS-variable-driven semantic tokens in `src/app/globals.css`.

## Core idea

- `:root` defines light values.
- `.dark` overrides dark values.
- Tailwind semantic utilities (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`) read those variables.

## Hero gradient

`bg-hero-gradient` is backed by `--background-image-hero-gradient`, which is built from `--hero-stop-*` variables.
Each theme sets different stop values so the hero/CTA surfaces change when theme changes.

## Do / Don't

### ✅ Do

- Use semantic tokens for surfaces/text/borders:
  - `bg-background`, `bg-card`, `bg-muted`
  - `text-foreground`, `text-muted-foreground`
  - `border-border`
- Keep branded accents (`quiz-*`) for highlights/illustrative UI only.

### ❌ Don't

- Hardcode theme-breaking classes like `text-white`, `text-black`, `bg-white`, `bg-black`, `text-gray-*`, `bg-gray-*` in normal app surfaces.
- Use raw hex Tailwind classes (`text-[#fff]`, etc.) for regular UI copy.

## Guardrail

Run `npm run lint` to execute `scripts/check-hardcoded-colors.mjs`, which fails when banned hardcoded color classes are introduced outside the documented allowlist.
