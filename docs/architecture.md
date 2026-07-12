# Architecture

See [R2 image lifecycle](./r2-lifecycle.md) for bucket retention and safe orphan-cleanup guidance.
See [SEO operations](./seo.md) for metadata, sitemap, and indexability policy.

BusQuiz is a **Next.js 16 App Router** application with a clear layered architecture.

## High-level overview

```
Browser / Client
       │
       ▼
┌─────────────────────────────────────────┐
│  Next.js App Router (src/app/)          │
│  • Server Components (default)          │
│  • Client Components ('use client')     │
│  • API Route Handlers (route.ts files)  │
└────────────┬────────────────────────────┘
             │
     ┌───────┴────────┐
     ▼                ▼
┌─────────┐    ┌────────────┐
│ Prisma  │    │  NextAuth  │
│  ORM    │    │   v5       │
└────┬────┘    └─────┬──────┘
     │               │
     ▼               ▼
┌──────────────────────────┐
│  Database (SQLite dev /  │
│  PostgreSQL prod)        │
└──────────────────────────┘
```

## Directory structure

| Path                            | Purpose                                                              |
| ------------------------------- | -------------------------------------------------------------------- |
| `src/app/`                      | Next.js App Router — pages, layouts, API routes, OG images           |
| `src/components/`               | Reusable React components                                            |
| `src/components/ui/`            | Design-system primitives (Button, Card, Skeleton, Toast, …)          |
| `src/components/layout/`        | App shell — Navbar, Footer                                           |
| `src/components/auth/`          | Auth-aware components (AuthControls)                                 |
| `src/components/notifications/` | Notification bell + inbox dropdown                                   |
| `src/components/home/`          | Homepage sections (hero, quiz cards, leaderboard widget)             |
| `src/domain/`                   | Pure business logic — badges, leveling, scoring, streak, quiz-import |
| `src/lib/`                      | Generic utilities — slugify, time, copy, motion presets, preferences |
| `src/schemas/`                  | Zod validation schemas shared between client and server              |
| `src/server/`                   | Server-only modules — Prisma client, NextAuth config, helpers        |
| `src/store/`                    | Zustand client-side state stores                                     |
| `src/hooks/`                    | React hooks (useSound, useHotkeys, …)                                |
| `src/test/`                     | Global test infrastructure (setup, axe-smoke)                        |
| `prisma/`                       | Prisma schema, migrations, seed scripts                              |
| `docs/`                         | Project documentation                                                |
| `scripts/`                      | Dev/CI scripts (check-hardcoded-colors, …)                           |

## Key layers

### 1. Presentation layer — `src/app/` + `src/components/`

- **Server Components** fetch data directly via Prisma and pass it to Client Components as props.
- **Client Components** (`'use client'`) manage interactivity, animations, and Zustand state.
- Layout hierarchy: `app/layout.tsx` → nested route layouts → page components.

### 2. API layer — `src/app/api/`

REST-style route handlers. Key endpoints:

| Route                                  | Purpose                                             |
| -------------------------------------- | --------------------------------------------------- |
| `POST /api/play/submit`                | Score a completed quiz session, award XP and badges |
| `GET /api/notifications`               | Fetch recent notifications for the signed-in user   |
| `PATCH /api/notifications/read`        | Mark notifications as read                          |
| `GET/POST /api/studio/quizzes`         | Studio quiz CRUD                                    |
| `POST /api/studio/quizzes/[id]/import` | Bulk CSV/JSON question import                       |
| `GET/POST /api/admin/*`                | Moderation actions (admin role required)            |
| `POST /api/follow/[userId]`            | Follow / unfollow a user                            |
| `POST /api/report`                     | Report a quiz                                       |

### 3. Domain layer — `src/domain/`

Pure functions and data structures with no framework dependencies:

| Module              | Responsibility                                                    |
| ------------------- | ----------------------------------------------------------------- |
| `badges.ts`         | Evaluate which badges a user has earned after a session           |
| `leveling.ts`       | XP ↔ level conversion (`xpForLevel`, `levelForXp`)                |
| `scoring.ts`        | Per-question point calculation (base score × streak × time bonus) |
| `streak.ts`         | Daily streak increment / reset / grace-window logic               |
| `quiz-import.ts`    | Parse and validate CSV/JSON question files                        |
| `quiz-constants.ts` | Shared constants (`FILL_BLANK_PLACEHOLDER`, …)                    |

All domain modules are fully unit-tested (`src/domain/*.test.ts`).

### 4. Server helpers — `src/server/`

| Module               | Responsibility                                                              |
| -------------------- | --------------------------------------------------------------------------- |
| `prisma.ts`          | Singleton Prisma client                                                     |
| `auth.ts`            | NextAuth v5 configuration (Credentials, GitHub, Google providers)           |
| `auth.config.ts`     | Shared auth config (edge-compatible, no Prisma)                             |
| `play-token.ts`      | Short-lived HMAC play tokens (prevent replay attacks on `/api/play/submit`) |
| `password.ts`        | bcrypt password hashing helpers                                             |
| `rate-limit.ts`      | In-memory sliding-window rate limiter                                       |
| `leaderboard.ts`     | Leaderboard query helpers                                                   |
| `email.ts`           | Transactional email helpers                                                 |
| `home-quiz-cache.ts` | Short-lived in-process cache for homepage quiz data                         |

### 5. State layer — `src/store/`

Zustand stores for ephemeral client-side UI state:

| Store                   | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `play-session.ts`       | Active quiz session (score, streak, lifelines, timer, answers) |
| `quiz-creator-store.ts` | Studio quiz editor (draft questions, steps, autosave state)    |

### 6. Schema layer — `src/schemas/`

Zod schemas shared between client and API route handlers for request validation. All schemas are exported from `src/schemas/index.ts`.

## Authentication flow

```
User → POST /api/auth/signin (credentials / OAuth)
     → NextAuth v5 (src/server/auth.ts)
     → Prisma adapter stores Session + Account
     → auth() helper available in Server Components and API routes
```

## Quiz play flow

```
1. User clicks "Play" on a quiz page
2. Client calls POST /api/play/token → receives a short-lived play token
3. Client renders questions (Server Component pre-fetches question list)
4. usePlaySessionStore tracks answers, score, streak, timer
5. On completion → POST /api/play/submit with play token + answers
6. Server:
   a. Verifies play token (prevents replay)
   b. Calculates score (src/domain/scoring.ts)
   c. Updates streak (src/domain/streak.ts)
   d. Awards XP + levels up (src/domain/leveling.ts)
   e. Evaluates badges (src/domain/badges.ts)
   f. Persists PlaySession + QuestionAnswers in a Prisma transaction
7. Client redirects to /results/[sessionId]
```

## Gamification model

- **XP formula**: `xpForLevel(n) = 100 * (n-1) * n / 2`
- **Win**: `correctCount / totalCount >= 0.7`
- **Streak**: increments on consecutive calendar days; 36-hour grace window; resets otherwise
- **Badges**: evaluated post-submission against criteria stored in `Badge.criteria` (JSON)

## Database schema highlights

The database uses Prisma ORM. Key models:

| Model                 | Purpose                                                        |
| --------------------- | -------------------------------------------------------------- |
| `User`                | Accounts (guests + registered), XP, level, streak, preferences |
| `Quiz`                | Quiz metadata, difficulty, category, publish status            |
| `Question` + `Choice` | Questions and answer choices                                   |
| `PlaySession`         | Completed sessions (score, mode, timing)                       |
| `QuestionAnswer`      | Per-question answer records linked to a PlaySession            |
| `Badge` + `UserBadge` | Badge catalog + user award records                             |
| `Follow`              | User follow relationships                                      |
| `FavoriteQuiz`        | User quiz bookmarks                                            |
| `Notification`        | In-app notifications (badge, follower, quiz)                   |
| `Report`              | User-submitted quiz reports                                    |
| `CategorySuggestion`  | User-submitted category suggestions                            |
| `AdminAction`         | Audit log of admin moderation actions                          |

## Styling

- **Tailwind CSS v4** with CSS variable–based semantic tokens
- Hardcoded color utilities are linted out by `scripts/check-hardcoded-colors.mjs`
- Design tokens documented in `docs/theming.md`

## Performance considerations

- `canvas-confetti` is dynamically imported at celebration time
- Howler.js (sound) is lazily initialized after first user interaction
- Homepage quiz data is cached in-process via `src/server/home-quiz-cache.ts`
- Leaderboard queries use composite `PlaySession` indexes for bounded cost
