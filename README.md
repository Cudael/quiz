# BusQuiz 🧠

A full-featured quiz platform built with Next.js, TypeScript, Tailwind CSS v4, and Prisma — featuring a creation studio, competitive leaderboards, gamification, and admin moderation.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env    # edit DATABASE_URL and AUTH_SECRET at minimum
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui primitives + Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (email/password, GitHub OAuth, Google OAuth, guest)
- **State**: Zustand
- **Testing**: Vitest + React Testing Library + vitest-axe

## 📦 Scripts

| Script                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Start development server                       |
| `npm run build`       | Build for production (requires `DATABASE_URL`) |
| `npm start`           | Start production server                        |
| `npm run lint`        | ESLint + hardcoded-color check                 |
| `npm run typecheck`   | TypeScript type check (`tsc --noEmit`)         |
| `npm test`            | Run Vitest unit tests                          |
| `npm run db:push`     | Sync Prisma schema to database                 |
| `npm run db:migrate`  | Run Prisma migrations                          |
| `npm run db:seed`     | Seed database with demo content                |
| `npm run db:reset`    | Reset and reseed (destructive)                 |
| `npm run db:generate` | Regenerate Prisma client                       |

> **Note**: `npm run build` queries Prisma at build time for leaderboard OG image generation, so `DATABASE_URL` must be set even for a production build.

## 🗂 Project Structure

```
prisma/
├── schema.prisma             # PostgreSQL schema with native enums
├── seed-data.ts              # Seed content (categories, quizzes, badges, users)
└── seed.ts                   # Seed runner script
scripts/
└── check-hardcoded-colors.mjs  # Lint rule: ban raw Tailwind color utilities
docs/
├── architecture.md
├── testing.md
└── theming.md
src/
├── app/                # Next.js App Router pages and API routes
├── components/
│   ├── ui/             # Design system primitives (shadcn-style)
│   ├── layout/         # AppShell, Navbar, SiteFooter
│   ├── auth/           # Auth controls, provider, email verification banner
│   ├── notifications/  # Notification bell and inbox
│   ├── theme/          # ThemeProvider, ThemeToggle
│   └── home/           # HomePage server component + HomePageClient
├── server/             # Server-only modules (see below)
├── domain/             # Pure domain logic (see below)
├── schemas/            # Zod schemas (index.ts)
├── lib/                # Generic utilities (see below)
├── store/              # Zustand stores
└── test/               # Test infrastructure (setup, axe-smoke, lucide-icons, seed-data)
```

## 🗄️ Database Setup

BusQuiz uses **PostgreSQL** for all environments.

```bash
cp .env.example .env
# Set DATABASE_URL to your PostgreSQL connection string
npm run db:push    # create tables / sync schema
npm run db:seed    # populate with demo content
```

### Seeded content

| Entity     | Count |
| ---------- | ----- |
| Categories | 10+   |
| Quizzes    | 30+   |
| Questions  | 80+   |
| Badges     | 10+   |
| Demo users | 5     |

**Demo accounts (after `npm run db:seed`):**

| Name         | Email             | Role  |
| ------------ | ----------------- | ----- |
| Admin Demo   | admin@busquiz.com | ADMIN |
| Alice Chen   | alice@busquiz.com | USER  |
| Bob Martinez | bob@busquiz.com   | USER  |
| Carol Zhang  | carol@busquiz.com | USER  |
| Dave Okonkwo | demo@busquiz.com  | USER  |

Sign in with email/password on the `/sign-in` page. The password for each demo account is defined in `prisma/seed.ts`.

## 🔧 Environment Variables

Copy `.env.example` to `.env`. Generate an auth secret with:

```bash
openssl rand -base64 32
```

| Variable                | Required    | Description                                               |
| ----------------------- | ----------- | --------------------------------------------------------- |
| `DATABASE_URL`          | ✅ Always   | PostgreSQL connection string                              |
| `AUTH_SECRET`           | ✅ Always   | NextAuth JWT signing secret                               |
| `NEXTAUTH_URL`          | Prod        | Full public URL (e.g. `https://busquiz.com`)              |
| `NEXTAUTH_SECRET`       | Fallback    | Older NextAuth secret alias                               |
| `PLAY_TOKEN_SECRET`     | Prod        | HMAC secret for play tokens (falls back to `AUTH_SECRET`) |
| `GITHUB_CLIENT_ID`      | OAuth only  | GitHub OAuth app client ID                                |
| `GITHUB_CLIENT_SECRET`  | OAuth only  | GitHub OAuth app secret                                   |
| `GOOGLE_CLIENT_ID`      | OAuth only  | Google OAuth app client ID                                |
| `GOOGLE_CLIENT_SECRET`  | OAuth only  | Google OAuth app secret                                   |
| `GMAIL_USER`            | Email       | Gmail address used as the authenticated SMTP sender       |
| `GMAIL_APP_PASSWORD`    | Email       | Gmail App Password used for SMTP authentication           |
| `CRON_SECRET`           | Cron        | Bearer token for `/api/cron/cleanup-guests`               |
| `OPENAI_API_KEY`        | AI features | OpenAI API key (optional)                                 |
| `BLOB_READ_WRITE_TOKEN` | Uploads     | Vercel Blob token for image uploads                       |
| `NEXT_PUBLIC_SITE_URL`  | Optional    | Public URL override (falls back to `VERCEL_URL`)          |

**Minimum required**: `DATABASE_URL` + `AUTH_SECRET`. Email/password auth works without any OAuth keys. OAuth provider buttons are hidden when their env vars are absent.

**Gmail email setup:** enable 2FA on the Google account you want to send from, generate a 16-character App Password in Google Account → Security → App Passwords, then set `GMAIL_USER` and `GMAIL_APP_PASSWORD`. If these variables are omitted, verification and reset links are logged in dev/test and skipped in production.

**OAuth callback URLs:**

- GitHub: `{NEXTAUTH_URL}/api/auth/callback/github`
- Google: `{NEXTAUTH_URL}/api/auth/callback/google`

## 🧠 Domain Logic Reference

### XP & Leveling (`src/domain/leveling.ts`)

`xpForLevel(n) = 100 * (n-1) * n / 2` — cumulative XP required to reach level `n` (level 1 = 0 XP).

| Level | XP Required |
| ----- | ----------- |
| 1     | 0           |
| 2     | 100         |
| 3     | 300         |
| 4     | 600         |
| 5     | 1000        |
| 6     | 1500        |
| 7     | 2100        |
| 8     | 2800        |
| 9     | 3600        |
| 10    | 4500        |

### Scoring (`src/domain/scoring.ts`)

Per-question: `base(100) + speedBonus(round(100 × timeRemaining / timeLimit))`.  
Survival mode applies a streak multiplier: `1 + 0.25 × floor(streak / 3)`.

### Streak rules (`src/domain/streak.ts`)

- Same UTC calendar day as `lastPlayedAt` → no change.
- Yesterday (by UTC day boundary) → increment by 1.
- Older than yesterday but within 36h grace window from `lastPlayedAt` → increment by 1.
- Outside grace window → reset to 1.
- `bestStreak` is always `max(previousBest, newStreak)`.

**Win definition**: any session where `correctCount / totalCount >= 0.7`.

### Badge criteria (`src/domain/badges.ts`)

Badges are stored in the database with a JSON `criteria` field. The engine evaluates all unevaluated badges against collected stats after each session.

| Slug                      | Criterion type    | Threshold                     |
| ------------------------- | ----------------- | ----------------------------- |
| `first-win`               | `wins`            | 1                             |
| `perfect-score`           | `perfectScore`    | —                             |
| `streak-7`                | `streak`          | 7 days                        |
| `streak-30`               | `streak`          | 30 days                       |
| `quiz-author`             | `quizzesAuthored` | 1                             |
| `category-master-science` | `categoryMaster`  | 10 quizzes in `science`       |
| `speed-demon`             | `avgAnswerMs`     | < 5000 ms average answer time |
| `night-owl`               | `playedBetween`   | 00:00–05:00 UTC               |
| `centurion`               | `playsCount`      | 100 sessions                  |

### Play token (`src/server/play-token.ts`)

HMAC-SHA256 tokens bind a `quizId` and `issuedAt` timestamp. Tokens expire after 4 hours. The secret is `PLAY_TOKEN_SECRET`, falling back to `AUTH_SECRET` (or a dev constant when neither is set).

### Leaderboard query strategy (`src/server/leaderboard.ts`)

Raw SQL `GROUP BY` over `PlaySession` with optional filters for period (`all` / `week` / `today`), category slugs, and quiz ID. Sort options: `total`, `best`, `plays`, `accuracy`.

## 🏗 Studio (Quiz Creation)

### Routes

- `/studio` — Dashboard with Drafts / Published tabs
- `/studio/quiz/new` — Create a new quiz
- `/studio/quiz/[id]/edit` — Edit questions (add / update / delete / reorder)
- `/studio/quiz/[id]/import` — Bulk import via CSV or JSON

### CSV import format

```csv
type,prompt,explanation,timeLimitSec,choices
SINGLE,"What is 2+2?","Basic math",15,"3;*4;5;6"
MULTIPLE,"Which are primes?","",20,"*2;*3;4;*5;6"
TRUEFALSE,"The sky is blue.","",10,"*True;False"
FILL_BLANK,"Capital of France is {{blank}}.","",15,"*Paris;*paris"
```

Prefix a choice with `*` to mark it correct. Choices are semicolon-separated.

### JSON import format

```json
[
  {
    "type": "SINGLE",
    "prompt": "What is 2+2?",
    "explanation": "Basic math",
    "timeLimitSec": 15,
    "choices": [
      { "text": "3", "isCorrect": false },
      { "text": "4", "isCorrect": true }
    ]
  }
]
```

## 🛡 Roles & Permissions

| Role    | Capabilities                                                                                                                                                                                                     |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USER`  | Play quizzes, create/manage own quizzes in Studio, report quizzes, suggest categories, follow users                                                                                                              |
| `ADMIN` | Everything above + full moderation queue (`/admin`): approve/reject category suggestions, resolve reports (dismiss / unpublish / delete quiz), toggle any quiz publish status, manage user roles, view audit log |

## 🔔 Notifications

Authenticated users see a bell icon in the navbar (`src/components/notifications/notification-bell.tsx`). Notification types:

- `BADGE_EARNED` — links to `/me`
- `NEW_FOLLOWER` — links to `/u/[username]`
- `QUIZ_PLAYED` — links to `/quiz/[id]`

Fetched via `GET /api/notifications`; marked read via `PATCH /api/notifications/read`.

## ♿ Accessibility

- Skip-to-content link in `AppShell`
- Semantic landmarks (`<header>`, `<main>`, `<footer>`, `<nav aria-label>`)
- All interactive elements have `aria-label` or visible text
- Focus trapping + restore in modal dialogs
- `aria-live="polite"` countdown announcements (10 s, 5 s, 0 s)
- Keyboard play shortcuts: `1`–`4` / `A`–`D` select choices; `Enter` / `Space` submit or advance
- Reduced motion: respects `prefers-reduced-motion` media query and a `localStorage.reducedMotion` override
- Axe smoke tests for key routes (`src/test/axe-smoke.test.tsx`) — fail on `serious`/`critical` violations

## 🌐 SEO & Open Graph

Dynamic OG image routes (Node.js runtime):

- `src/app/opengraph-image.tsx` — site root
- `src/app/quiz/[id]/opengraph-image.tsx`
- `src/app/u/[username]/opengraph-image.tsx`
- `src/app/leaderboard/opengraph-image.tsx`

Crawl / PWA support:

- `src/app/robots.ts` — disallows `/api`, `/studio`, `/admin`, `/auth`
- `src/app/sitemap.ts` — dynamic sitemap from published quizzes + categories
- `src/app/manifest.ts` — PWA web app manifest

## 🧯 Troubleshooting

### Theme not switching?

The root layout runs a pre-paint script before hydration (`src/lib/theme.ts` → `THEME_INIT_SCRIPT`). Theme-aware components must use semantic Tailwind tokens (`bg-background`, `text-foreground`, `border-border`, etc.) — not hardcoded color utilities. See `docs/theming.md`.

### Icons not rendering?

Run `npm test -- --run`; the `src/test/lucide-icons.test.ts` suite verifies every used icon is exported by the installed `lucide-react` version.

### DB empty after `npm run db:push`?

`db:push` only syncs the schema. Run `npm run db:seed` afterwards to insert demo content.

### Build fails?

`npm run build` queries Prisma at build time (leaderboard OG image). Set `DATABASE_URL` before running the build.
