<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project Overview

**BusQuiz** — a free online quiz and trivia platform. Next.js 16 (App Router), React 19, Prisma ORM, PostgreSQL, NextAuth v5 (beta), Tailwind CSS v4, Zustand, Zod, Framer Motion, Cloudflare R2 (images), Upstash Redis (rate limiting).

## Project Structure

```
src/
  app/                  Next.js App Router pages, layouts, API routes
    layout.tsx          Root layout (App shell)
    page.tsx            Homepage
    error.tsx           Error boundary
    global-error.tsx    Global error boundary
    not-found.tsx       404 page
    globals.css         Tailwind v4 CSS with semantic tokens
    manifest.ts         PWA manifest
    robots.ts           Robots.txt
    sitemap.ts          Sitemap generation
    opengraph-image.tsx Dynamic OG image (homepage)
    analytics.tsx       Analytics integration
    api/                API route handlers
      auth/             [...nextauth], forgot-password, register, reset-password, verify-email
      cron/             cleanup-guests, finalize-season, weekly-digest (all require CRON_SECRET)
      duel/             create, join, [id] (state), start, submit, [id]/rematch
      notifications/    GET list, PATCH read
      play/             submit (score, XP, badges; mode param STANDARD/DAILY/PRACTICE/BLITZ)
      profile/          PATCH/DELETE (canonical), profile/ (compat PATCH alias),
                        password, preferences
      quiz/[id]/        play (token endpoint; ?mode=practice serves missed questions,
                        ?mode=blitz forces 60s quiz timer)
      studio/quizzes/   CRUD endpoints
      survival/         questions (random batch GET), submit (run validation POST)
      upload/           Image upload to R2
      v1/               Public read-only API (CORS *, rate-limited): quizzes,
                        quizzes/[id] (id or slug, no correct-answer flags), categories
    about/              About page + accessibility sub-page
    admin/              Admin dashboard, users, quizzes, categories, reports, feedback,
                        suggestions, audit-log, statistics, forbidden
    badges/             Public badges catalog
    blog/               Blog listing + [slug] dynamic pages
    categories/         Category browser + [slug] detail
    challenges/         Daily/weekly/monthly quiz challenges + quest board
    collections/        Curated quiz collections + [slug] detail
    contact/            Contact page
    daily/              Daily quiz (deterministic pick, today's board)
    duel/               Duel entry + [id] active session (supports group duels + rematch)
    embed/              /embed/quiz/[id] iframe-able quiz card (bare chrome, framing allowed)
    feedback/           Feedback form (auth required)
    for-you/            Personalized quiz feed (auth required)
    forgot-password/    Password reset request
    leaderboard/        Global leaderboard with filters + pagination (friends + season filters)
    learn/              Learning hub
    offline/            Offline fallback page (PWA service worker)
    play/[id]           Quiz play session + results/ sub-route (?mode=daily|practice|blitz)
    playlists/          User playlists + [slug] public detail
    popular/            Top 50 quizzes by play count
    practice/           Practice hub — replay missed questions (auth required)
    privacy/            Privacy policy
    profile/            User profile, badges, completed, quizzes, settings
    quiz/[id]           Quiz detail/info page
    r/[id]              Short-link redirect for quizzes
    random-quiz/        Server-side random quiz redirect (noindex)
    reset-password/     Password reset form
    results/[id]        Play session results
    sign-in/            Sign-in page
    sign-up/            Sign-up page
    stats/              Global platform statistics
    studio/             Quiz Studio dashboard (auth required)
      quiz/new/         New quiz creation
      quiz/[id]/edit/   Quiz editor (co-authors allowed; AI question generator)
      quiz/[id]/analytics/ Quiz analytics (choice distribution, plays trend)
      quiz/[id]/import/ Bulk question import (CSV/JSON)
      quiz/[id]/revisions/ Version history (snapshots, restore — owner only)
    survival/           Survival mode — one life, endless questions
    terms/              Terms of service
    trending/           Trending quizzes this week
    trivia-facts/       Curated trivia facts
    u/[username]/       Public user profile
  components/
    ui/                 Primitive design-system components (shadcn-style): avatar, badge,
                        badges-grid, button, card, category-tile, dropdown-menu, empty-state,
                        input, level-progress, logo, modal, page-header, progress-bar,
                        quiz-card, sheet, star-rating, streak-flame, toast, tooltip, zone-marker
    layout/             App shell (AppShell), navbar, nav-dropdown, left-menu, category-bar,
                        site-footer
    auth/               Auth controls, provider, email verification banner, OAuth buttons,
                        sign-in form, sign-up form
    notifications/      Notification bell with inbox dropdown
    pwa/                Service worker registration (offline support; worker at public/sw.js)
    theme/              Theme provider, toggle, theme switching tests
    home/               Home server component, HomePageClient, colocated sections/:
                        hero-cards, hero-insight-box, quiz-featured-grid, quiz-sections,
                        section-primitives, badge-showcase, continue-streak-strip
  content/              Static content: blog-posts.ts, collections.ts
  server/               Server-only modules:
                          auth.ts, auth.config.ts, authorize-email-password.ts,
                          prisma.ts, play-token.ts, password.ts, rate-limit.ts,
                          leaderboard.ts, email.ts, home-quiz-cache.ts, home-page-data.ts,
                          token-hash.ts, duel.ts, cron-auth.ts, daily.ts, for-you.ts,
                          quests.ts, season.ts
  domain/               Pure domain logic:
                          badges.ts, leveling.ts, scoring.ts, streak.ts,
                          evaluate-answer.ts, text-answer.ts,
                          quiz-import.ts, quiz-bulk-import.ts, quiz-constants.ts
  schemas/              Zod schemas (index.ts)
  lib/                  Generic utilities:
                          utils.ts, slugify.ts, motion.ts, copy.ts, site.ts,
                          theme.ts, usernames.ts, time.ts, preferences.ts,
                          safe-callback-url.ts, seo.ts, quiz-url.ts, analytics.ts,
                          author-display.ts, badge-display.ts, category-icons.ts
  store/                Zustand stores: play-session.ts, quiz-creator-store.ts
  test/                 Global test infrastructure: setup.ts, server-only.ts,
                          axe-smoke.test.tsx, lucide-icons.test.ts, seed-data.test.ts
```

### Other top-level directories

```
prisma/                 schema.prisma, migrations/, seed.ts, seed-data.ts
worker/                 Cloudflare Worker for R2 image serving (worker/src/index.ts)
scripts/                check-hardcoded-colors.mjs, generate-quiz-slugs.ts
docs/                   architecture.md, testing.md, theming.md, AUDIT-REPORT.md
public/                 Static assets: logos, PWA icons, OG image, sfx/, templates/
.github/workflows/      ci.yml (lint, typecheck, test on push/PR to main)
```

### Module conventions

Large routes/components are broken up by responsibility and colocated next to
where they are used:

- `_components/` — colocated presentational sub-components for a route
  (e.g. `app/play/[id]/_components/`, `app/duel/[id]/_components/`,
  `app/profile/settings/_components/`, `app/leaderboard/_components/`,
  `app/u/[username]/_components/`, `app/studio/_components/`,
  `app/admin/categories/_components/`).
- `sections/` — larger composable UI sections (e.g. `components/home/sections/`).
- `use-*.ts` — custom hooks holding stateful/effect logic, colocated with their route
  (e.g. `app/play/[id]/use-play-runner.ts`, `app/duel/[id]/use-duel-session.ts`,
  `app/studio/_components/use-image-upload.ts`, `app/studio/_components/use-question-card.ts`).
- `*.types.ts` — shared component/route types (e.g. `home-page-client.types.ts`).
- `*.utils.ts` — pure, framework-agnostic helpers.
- Server actions live in `actions.ts`, or an `actions/` folder of grouped
  modules re-exported from a barrel `index.ts` (see `app/studio/actions/`).
- Tests are colocated as `*.test.ts(x)` next to their source.

## Key Commands

```bash
npm run dev          # start dev server
npm run build        # production build (needs DATABASE_URL)
npm run start        # start production server
npm run lint         # ESLint + hardcoded-color check
npm run typecheck    # tsc --noEmit
npm test -- --run    # Vitest unit tests (CI mode)
npm run db:generate  # generate Prisma client
npm run db:push      # sync Prisma schema to database
npm run db:migrate   # create/run migrations
npm run db:seed      # seed demo content
npm run db:reset     # reset database (migrate reset --force)
npm run worker:dev   # start Cloudflare Worker dev server
npm run worker:deploy # deploy Cloudflare Worker
```

## Database

PostgreSQL via Prisma ORM. `prisma/schema.prisma` uses `provider = "postgresql"` with native enums. Always set `DATABASE_URL` in `.env` before running builds, migrations, or seeds. Optional `DIRECT_URL` for Prisma Accelerate/migrations.

### Key models

User, Category, Quiz, Question, Choice, PlaySession, QuestionAnswer, Duel, DuelParticipant, Rating, Badge, UserBadge, Follow, FavoriteQuiz, Notification, Report, CategorySuggestion, AdminAction, Feedback, Account, Session, VerificationToken, QuizComment, SeasonResult, Quest, UserQuest, SurvivalRun, DailyQuiz, QuizRevision, QuizCollaborator, Playlist, PlaylistItem.

### Key enums

Role (USER/ADMIN), Difficulty (EASY/MEDIUM/HARD), QuestionType (SINGLE/TRUEFALSE/FILL_BLANK/HOTSPOT/ORDER/MATCH/NUMBER_GUESS/GROUPS), QuizFormat (TEXT_CHOICE/IMAGE_CHOICE/IMAGE_HOTSPOT/ORDER/MATCH/ODD_ONE_OUT/TYPE_ANSWER/NUMBER_GUESS/IMAGE_REVEAL/AUDIO_CHOICE/VERSUS/CONNECTIONS/ANAGRAM/MEMORY_FLASH), DuelStatus (WAITING/IN_PROGRESS/FINISHED), PlayMode (STANDARD/DAILY/PRACTICE/BLITZ), ReportReason, ReportStatus (reports can target quizzes or comments), SuggestionStatus, NotificationType, FeedbackType, FeedbackStatus, QuestPeriod.

### Quiz formats & answer evaluation

- `QuizFormat` is an editor-side concern (which Studio editor UI is used); `QuestionType` + `Question.meta`/`Choice.meta` drive play rendering and scoring.
- Format → type mapping: ORDER→ORDER (choices carry `meta.position`, assigned from editor order at save), MATCH→MATCH (`meta.side` 'L'/'R' + `meta.matchKey`), CONNECTIONS→GROUPS (`meta.groupKey` per tile, `Question.meta.groups`), NUMBER_GUESS→NUMBER_GUESS (`Question.meta` {answer,min,max,tolerance,unit}), TYPE_ANSWER/ANAGRAM→FILL_BLANK (`Question.meta.acceptedAnswers`, optional `fuzzy`, `anagram: true` for tiles; list mode via `meta.answers`), ODD_ONE_OUT/IMAGE_REVEAL (`meta.reveal`)/AUDIO_CHOICE (`meta.audioUrl`)/VERSUS (`Choice.meta.value`, higher auto-correct)/MEMORY_FLASH (`meta.studyText|studyImageUrl|studyDurationMs`)→SINGLE.
- Server-authoritative evaluation for all types lives in `src/domain/evaluate-answer.ts` (used by `POST /api/play/submit`). ORDER/MATCH/GROUPS/NUMBER_GUESS/list-FILL_BLANK earn partial credit (0..1); `scoreQuestion` awards `round(10*credit)` with no speed bonus; `QuestionAnswer.isCorrect`/`correctCount` require credit === 1. `Question.points` is reserved for a future weighted-scoring migration and is not currently applied.
- `submitAnswerInputSchema` accepts `choiceIds` (ordered for ORDER), `textAnswer`, `textAnswers`, `numberAnswer`, `pairs`, `groups`. Non-choice answers are persisted encoded in `QuestionAnswer.chosenIds` (MATCH: `left::right`, GROUPS: `id|id|…`, NUMBER_GUESS: the guess, FILL_BLANK: given text).
- Survival and duel question pools exclude interactive types (`ORDER`, `MATCH`, `NUMBER_GUESS`, `GROUPS`, `FILL_BLANK`) — they render plain choice grids.

## Auth

NextAuth.js v5 (beta) with JWT sessions. Providers: GitHub OAuth, Google OAuth, email+password credentials, guest credentials (creates a `User` with `email: null` — email presence distinguishes persistent accounts from guest sessions).

Minimum env: `DATABASE_URL` + `AUTH_SECRET`. OAuth providers are optional; their buttons are hidden when the corresponding env vars are absent.

### Auth-related files

- `src/server/auth.ts` — NextAuth instance + session helpers
- `src/server/auth.config.ts` — NextAuth config (providers, callbacks)
- `src/server/authorize-email-password.ts` — Credentials provider logic
- `src/server/password.ts` — bcrypt hashing/verification
- `src/server/token-hash.ts` — Token hashing utilities
- `src/server/email.ts` — Gmail SMTP (verification, password reset)
- `src/app/api/auth/` — API routes (register, verify-email, forgot-password, reset-password)

## Middleware

`middleware.ts` handles:

- **Route protection**: `/studio*` and `/admin*` require auth. Unauthenticated → `/api/auth/signin`. Non-admin on `/admin*` → rewrite to `/admin/forbidden`.
- **Guest-only routes**: `/sign-in` and `/sign-up` redirect authenticated users to `/profile`.
- **CSP**: Dynamic Content-Security-Policy with per-request nonce for scripts. Tailwind v4 requires `style-src 'unsafe-inline'`. `/embed/*` routes get `frame-ancestors *` (all other routes `frame-ancestors 'self'`).
- **Security headers**: Set in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy). X-Frame-Options is omitted for `/embed/*` so third-party sites can iframe embed widgets.

## Documentation Policy

Functional PRs that change route contracts, endpoint behavior, or compatibility aliases must update `AGENTS.md` in the same PR so this file remains the operational source of truth.

## SEO and indexability

- The root layout provides shared title/Open Graph defaults but intentionally does not declare a canonical URL. Every indexable page must declare its own canonical.
- Published quizzes are indexable and included in the sitemap only when they have at least 5 questions, a normalized description of at least 30 characters, and no pending report. Other published quizzes remain accessible with `noindex,follow`.
- Internal search/filter variants use the base route as canonical and are `noindex,follow` where appropriate.
- Curated collections require at least 3 matching indexable quizzes before they are indexable or included in the sitemap. Public playlists require at least 1 published quiz.
- Reuse `src/lib/seo-metadata.ts` for bounded titles/descriptions and quiz indexability so page metadata and sitemap behavior stay consistent.
- Private gameplay, results, Studio, admin, authentication, personalized, and compatibility routes must remain `noindex`; relevant route families are also excluded in `robots.ts`.

## Environment Variables

Required: `DATABASE_URL`, `AUTH_SECRET`. See `.env.example` for the full list of 16 variables (OAuth, SMTP, R2, Redis, analytics, cron, OpenAI).

## Styling

Tailwind CSS v4 with CSS-variable-driven semantic tokens defined in `globals.css`. Light (`:root`) / dark (`.dark`) mode via `class` strategy. Do NOT use hardcoded color classes — the `scripts/check-hardcoded-colors.mjs` lint script enforces this.

See `docs/theming.md` for the full token reference (surface tiers, hero gradients, shadows, motion presets).

## Worker

A Cloudflare Worker (`worker/src/index.ts`) serves images from an R2 bucket with 1-year cache headers. Deployed as `busquiz-images` via `wrangler.toml`.

## Testing

- **Framework**: Vitest v4 + React Testing Library + jsdom
- **Setup**: `src/test/setup.ts` (jest-dom, matchMedia, IntersectionObserver, canvas stubs)
- **Accessibility**: `vitest-axe` for a11y smoke tests
- **Location**: Tests are colocated as `*.test.ts(x)` next to their source
- **CI**: `npm test -- --run` in GitHub Actions

See `docs/testing.md` for mocking conventions (Next.js navigation, NextAuth, Link, Framer Motion, Prisma, `server-only`).

## Code Style

- **Prettier**: No semicolons, single quotes, ES5 trailing commas, 2-space indent, 100 char width
- **ESLint**: `eslint-config-next` (core-web-vitals + typescript) + `jsx-a11y` rules (aria-role, alt-text, label-has-associated-control)
- **Husky + lint-staged**: Auto-fix on commit for `*.{ts,tsx,js,jsx}` (eslint + prettier) and `*.{json,md,css}` (prettier)
- **Path aliases**: `@/*` → `./src/*` (plus specific aliases for `@/components/*`, `@/hooks/*`, `@/server/*`, `@/domain/*`, `@/lib/*`, `@/schemas/*`, `@/store/*`)

## Domain Logic

Pure business logic in `src/domain/` (no framework dependencies):

- `badges.ts` — Badge criteria evaluation
- `leveling.ts` — XP/level calculations (formula: `100 * (n-1) * n / 2`)
- `scoring.ts` — Quiz scoring (70% win threshold; supports partial credit 0..1)
- `evaluate-answer.ts` — Server-authoritative answer evaluation for all question types
- `text-answer.ts` — Free-text answer normalization + fuzzy matching (FILL_BLANK)
- `streak.ts` — Streak tracking (36-hour grace period; streak freezes consume `User.streakFreezes`)
- `quiz-import.ts` — Single quiz import parsing
- `quiz-bulk-import.ts` — Bulk CSV/JSON import
- `quiz-constants.ts` — Shared quiz constants

### Play modes

`PlaySession.mode` (PlayMode enum): STANDARD (default), DAILY (validated against today's `DailyQuiz` pick, downgraded to STANDARD on mismatch), PRACTICE (serves previously missed questions; no XP/streak/badges/quests, excluded from quiz aggregates and leaderboards), BLITZ (60-second quiz-level timer, normal rewards). Clients pass `?mode=` to `/play/[id]`, `GET /api/quiz/[id]/play`, and `mode` in the `POST /api/play/submit` body (legacy values like `classic` are ignored via `.catch(undefined)` — do not remove).

### Gamification services (src/server/)

- `quests.ts` — Daily/weekly/monthly quests (ensureDefaultQuests, getQuestBoard, progress on submit)
- `season.ts` — Monthly seasonal leaderboard finalization (SeasonResult + badges)
- `daily.ts` — Deterministic daily quiz pick (FNV-1a hash of UTC date)
- `for-you.ts` — Personalized feed (followed authors + category affinity + fresh quizzes)
- Duels support up to `Duel.maxPlayers` participants, rematches (`rematchOfId`, `POST /api/duel/[id]/rematch`), and Elo ratings (`User.duelRating`/`duelGames`, updated on duel finish)

## Zustand Stores

- `play-session.ts` — Active quiz play session state (score, answers, timer)
- `quiz-creator-store.ts` — Quiz editor state in Studio

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`): On push/PR to `main` — checkout, Node 20, `npm ci`, `prisma generate`, `npm run lint`, `npm run typecheck`, `npm test -- --run`.

Vercel deployment with cron jobs (all require `Authorization: Bearer <CRON_SECRET>`):

- `GET /api/cron/cleanup-guests` — daily 3:00 UTC, bounded guest-only cleanup
- `GET /api/cron/finalize-season` — monthly (1st, 0:10 UTC), snapshots season leaderboard + awards badges
- `GET /api/cron/weekly-digest` — Mondays 9:00 UTC, emails trending quizzes + per-user stats to verified users who haven't opted out (`preferences.weeklyDigest !== false`)

## Documentation

Full docs in `docs/`:

- `architecture.md` — Architecture overview, auth flow, quiz play flow, gamification model
- `testing.md` — Testing guide with mocking conventions
- `theming.md` — Theming guide with token reference
- `AUDIT-REPORT.md` — Production readiness audit
