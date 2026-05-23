<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project Structure

```
src/
  app/          Next.js App Router pages and API routes
  components/
    ui/         Primitive design-system components (shadcn-style)
    layout/     App shell, navbar, footer
    auth/       Auth controls and provider
    theme/      Theme provider and toggle
    home/       Home page components
  hooks/        React hooks
  server/       Server-only modules (prisma, auth, play-token, daily-seed)
  domain/       Pure domain logic (badges, leveling, scoring, streak, quiz-*)
  schemas/      Zod schemas (index.ts)
  lib/          Generic utilities (utils, slugify, motion, copy, site, theme, usernames)
  store/        Zustand stores
  test/         Global test infrastructure (setup, axe-smoke, lucide-icons, seed-data)
```
