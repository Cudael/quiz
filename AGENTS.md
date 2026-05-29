<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project Structure

```
src/
  app/              Next.js App Router pages and API routes
  components/
    ui/             Primitive design-system components (shadcn-style)
    layout/         App shell (AppShell), Navbar, SiteFooter
    auth/           Auth controls, provider, email verification banner
    notifications/  Notification bell and inbox
    theme/          Theme provider and toggle
    home/           Home server component, HomePageClient, colocated
                      sections/, *.types.ts, and home-page-skeleton
  server/           Server-only modules:
                      auth.ts, auth.config.ts, prisma.ts, play-token.ts,
                      password.ts, daily-seed.ts, rate-limit.ts,
                      leaderboard.ts, email.ts, home-quiz-cache.ts,
                      home-page-data.ts, token-hash.ts
  domain/           Pure domain logic:
                      badges.ts, leveling.ts, scoring.ts, streak.ts,
                      quiz-import.ts, quiz-constants.ts
  schemas/          Zod schemas (index.ts)
  lib/              Generic utilities:
                      utils.ts, slugify.ts, motion.ts, copy.ts, site.ts,
                      theme.ts, usernames.ts, time.ts, preferences.ts,
                      safe-callback-url.ts, seo.ts
  store/            Zustand stores: play-session.ts, quiz-creator-store.ts
  test/             Global test infrastructure (setup, axe-smoke, lucide-icons, seed-data)
```

### Module conventions

Large routes/components are broken up by responsibility and colocated next to
where they are used:

- `_components/` — colocated presentational sub-components for a route
  (e.g. `app/play/[id]/_components/`, `app/duel/[id]/_components/`,
  `app/me/settings/_components/`, `app/leaderboard/_components/`,
  `app/u/[username]/_components/`, `app/studio/_components/`).
- `sections/` — larger composable UI sections (e.g. `components/home/sections/`).
- `use-*.ts` — custom hooks holding stateful/effect logic
  (e.g. `use-play-runner`, `use-duel-session`, `use-image-upload`, `use-question-card`).
- `*.types.ts` — shared component/route types.
- `*.utils.ts` — pure, framework-agnostic helpers.
- Server actions live in `actions.ts`, or an `actions/` folder of grouped
  modules re-exported from a barrel `index.ts` (see `app/studio/actions/`).
- Tests are colocated as `*.test.ts(x)` next to their source.

## Key Commands

```bash
npm run dev          # start dev server
npm run build        # production build (needs DATABASE_URL)
npm run lint         # ESLint + hardcoded-color check
npm run typecheck    # tsc --noEmit
npm test -- --run    # Vitest unit tests (CI mode)
npm run db:push      # sync Prisma schema to database
npm run db:seed      # seed demo content
```

## Database

PostgreSQL. `prisma/schema.prisma` uses `provider = "postgresql"` with native enums. Always set `DATABASE_URL` in `.env` before running builds, migrations, or seeds.

## Auth

NextAuth.js v5 with JWT sessions. Providers: GitHub OAuth, Google OAuth, email+password credentials, guest credentials (creates a `User` with `email: null` — email presence is what distinguishes persistent accounts from guest sessions).

Minimum env: `DATABASE_URL` + `AUTH_SECRET`. OAuth providers are optional; their buttons are hidden when the corresponding env vars are absent.

## Middleware

`middleware.ts` protects `/studio*` and `/admin*`. Unauthenticated users are redirected to `/sign-in`. Non-admin users on `/admin*` are rewritten to `/admin/forbidden`.
