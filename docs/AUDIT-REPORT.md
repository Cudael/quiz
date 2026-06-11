# Production Readiness Audit Report

**Date:** 2026-06-11  
**Application:** BusQuiz (Next.js 16 Quiz Platform)  
**Repository:** Cudael/quiz  
**Deployed at:** https://quiz-remindes.vercel.app

---

## 1. What Was Broken and Why

### Test Failures (3 files, 3 failing tests)

| Test File                                          | Root Cause                                                                                                                                                         | Fix                                                                                                                                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/test/seed-data.test.ts`                       | Test hardcoded `validTypes = ['SINGLE']` but seed data contained `TRUEFALSE` and `FILL_BLANK` questions (added in a later PR without updating the test assertion). | Updated `validTypes` to `['SINGLE', 'TRUEFALSE', 'FILL_BLANK']` to match the Prisma `QuestionType` enum.                                                                                       |
| `src/app/play/[id]/play-view.test.tsx`             | Test expected fill-in-the-blank UI (text input, blanked prompt) but `QuestionPanel` had no `FILL_BLANK` rendering and mock data used type `'SINGLE'`.              | Implemented FILL_BLANK rendering in `QuestionPanel`, added `onTextSubmit`/`onTextChange` props, wired through `use-play-runner.ts` and `play-view.tsx`. Fixed mock to use type `'FILL_BLANK'`. |
| `src/app/studio/_components/step-publish.test.tsx` | `next-auth@5.0.0-beta.31` imports `next/server` (bare specifier without `.js` extension). Vitest's ESM resolution failed to resolve this in the jsdom environment. | Added `next/server` → `node_modules/next/server.js` alias in `vitest.config.ts` and configured `server.deps.inline: ['next-auth']` to bundle the import.                                       |

### Cascading Failure Pattern

The root cause of the "fix one thing, break another" pattern was the `next-auth` module resolution failure. When vitest couldn't load `next-auth/lib/env.js`, any test that transitively imported `@/server/auth` (even through mocked actions) would fail with 0 tests reported. The fix (vitest alias + inlining) was the single change that unblocked all transitive imports.

### Lint Warnings (3 warnings + 1 color check)

- Unused `StarRating` import in `src/app/quiz/[id]/page.tsx` — removed.
- Unused `createFetchResponse` in `image-upload.test.tsx` — suppressed (kept for future test use).
- Unused `QuizCardHorizontalSkeleton` import — removed.
- `text-white` in `hero-cards.tsx` — intentional contrast on dark overlay image; added to allowlist.

---

## 2. Security Findings

### Critical

| Issue                                                                                                                                        | Severity | Fix Applied                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Play token nonce replay across instances** — `usedNonces` in-memory Map is per-instance; on Vercel, replays succeed across warm instances. | Critical | Replaced with Upstash Redis `SET NX PX` (atomic cross-instance). Falls back to in-memory with warning log when Redis unavailable. |
| **Auth signIn: non-transactional DB writes** — User create + Account upsert with no transaction; account upsert failure leaves orphan user.  | Critical | Wrapped both operations in `prisma.$transaction()`.                                                                               |

### High

| Issue                                                                                                        | Severity | Fix Applied                                                    |
| ------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------- |
| **CSP connect-src hardcodes wrong domain** — `https://busquiz.com` but app is at `quiz-remindes.vercel.app`. | High     | Made dynamic from `NEXTAUTH_URL` env var origin.               |
| **Rate-limit in-memory store unbounded** — No cleanup; long-running instances accumulate entries forever.    | High     | Added lazy cleanup at 10,000 entries (purges expired windows). |
| **next-auth `^5.0.0-beta.31`** — caret range on pre-release allows silent breaking changes.                  | High     | Pinned to exact `5.0.0-beta.31` (no caret).                    |

### Medium

| Issue                                            | Severity | Status                                                                                              |
| ------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| **`style-src 'unsafe-inline'`** in CSP           | Medium   | Cannot be removed — Tailwind v4 generates runtime inline styles. Documented in code comment.        |
| **X-Frame-Options + frame-ancestors redundancy** | Low      | Both kept for backwards compatibility; documented in CSP builder comment.                           |
| **TOKEN_TTL_MS = 4 hours**                       | Low      | Appropriate — quiz sessions may be paused; documented rationale in code.                            |
| **IP extraction trusts x-real-ip**               | Low      | Added documentation comment — Vercel sets this header at platform level (not spoofable by clients). |
| **PLAY_TOKEN_SECRET not in .env.example**        | Medium   | Already present in .env.example (verified).                                                         |
| **`wrangler.toml` placeholder bucket_name**      | Medium   | Documented — requires per-environment configuration in Cloudflare dashboard.                        |

### Input Validation Notes

- `questionSchema` only validates `SINGLE` type — currently only SINGLE questions can be created in the Studio UI. TRUEFALSE/FILL_BLANK come from seed data and admin imports.
- `submitAnswerInputSchema.textAnswer` — used for FILL_BLANK answers; does not need a DB column since the matched `choiceIds` array stores the canonical answer.
- `Question.points` field (Prisma default 1) vs `scoring.ts` hardcoded base 100 — `points` is unused; recommend removing from schema or using as a multiplier in a future iteration.

---

## 3. Performance Improvements

### Database Query Optimization

| Before                                                                              | After                                                                  | Impact                                                |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| N+1: one `prisma.quiz.findMany` per parent category in `getHomePageData()`          | Single batched query for all categories, grouped in memory             | Reduced from ~10 DB queries to 1 for category quizzes |
| Duplicate PlaySession fetch (once for `playedQuizIds`, again for category counting) | Single query reused for both `playedQuizIds` and personalization logic | Eliminated 1 redundant DB round-trip                  |
| `recentlyPlayed` mapping duplicated `mapQuizCard` logic inline                      | Reused `mapQuizCard` utility                                           | Reduced code duplication, consistent behavior         |
| Unbounded `prisma.category.findMany`                                                | Added `take: 100` limit                                                | Prevents unbounded result sets                        |

### Caching

- `unstable_cache` in `home-quiz-cache.ts`: Retained as-is since Next.js 16 still uses this API (no stable `use cache` replacement found in the installed version). TTLs documented:
  - Trending: 300s (5 min) — appropriate for fast-changing data
  - Popular: 3600s (1 hour) — appropriate for slowly-changing aggregates

---

## 4. Tests Removed

None. All existing tests were preserved and made to pass.

---

## 5. Tests Added

No new test files were added in this audit (focus was on fixing broken tests and security). The following areas are recommended for future coverage:

- `src/server/play-token.ts` — nonce consumption with Redis mock
- `src/server/leaderboard.ts` — ranking queries with fixture data
- `src/domain/streak.ts`, `src/domain/badges.ts` — branch coverage
- Middleware route protection logic

---

## 6. Architecture Recommendations (Next 6 Months)

### Migration Path Off next-auth Beta

- Pin to exact version (done: `5.0.0-beta.31`).
- Monitor [next-auth/releases](https://github.com/nextauthjs/next-auth/releases) for stable v5.
- When stable ships: update, verify all callbacks, run integration tests, check JWT payload changes.

### Caching API Migration

- `unstable_cache` → replace with stable `use cache` directive when Next.js ships it.
- Monitor Next.js release notes for cache API stabilization.

### Nonce/Rate-Limiting Improvements

- ✅ Redis-based nonce tracking (implemented in this audit).
- Rate limiting: already uses Redis when available. Consider adding dedicated rate-limit keys per user (not just IP) for authenticated endpoints.
- Add monitoring/alerting for Redis fallback (currently logs `console.warn`).

### Database Migrations

- Move from `prisma db push` to `prisma migrate dev` for production schema changes.
- Add migration CI check that blocks deployment if unapplied migrations exist.

### Integration/E2E Tests

- Add Playwright tests for: play flow, duel flow, auth flow (OAuth + credentials + guest).
- Add database integration tests using a test PostgreSQL instance.

### Deployment

- Consider adding `output: 'standalone'` to `next.config.ts` for Docker deployments.
- Document the Vercel deployment process and env var requirements.
- Set up a staging environment with separate `DATABASE_URL`.

### Image Handling

- Evaluate whether Cloudflare Worker (`worker/src/index.ts`) and Next.js API routes should share a unified image-handling abstraction.
- The Worker is minimal (GET from R2 bucket) — acceptable as-is for now.

### Cleanup Items

- Remove unused `Question.points` field from Prisma schema OR integrate into scoring.
- Consider extracting `computeRatingInfo` to a shared utility (currently only used in `home-page-data.ts`).
- Document `src/content/` directory in AGENTS.md.
- The `/app/r/[id]` route should have rate limiting added for abuse prevention.

---

## 7. Environment Variables Reconciliation

All `process.env.*` references verified against `.env.example`:

| Variable                  | In .env.example    | Required                                |
| ------------------------- | ------------------ | --------------------------------------- |
| `DATABASE_URL`            | ✅                 | Yes (production)                        |
| `AUTH_SECRET`             | ✅                 | Yes (production)                        |
| `NEXTAUTH_URL`            | ✅                 | Yes                                     |
| `NEXTAUTH_SECRET`         | ✅                 | Alias for AUTH_SECRET                   |
| `PLAY_TOKEN_SECRET`       | ✅                 | Recommended (falls back to AUTH_SECRET) |
| `GITHUB_CLIENT_ID/SECRET` | ✅                 | Optional                                |
| `GOOGLE_CLIENT_ID/SECRET` | ✅                 | Optional                                |
| `GMAIL_USER/APP_PASSWORD` | ✅                 | Optional (dev logs to console)          |
| `R2_*`                    | ✅                 | Optional (image uploads)                |
| `UPSTASH_REDIS_*`         | ✅                 | Recommended (rate limiting + nonce)     |
| `NEXT_PUBLIC_SITE_URL`    | ✅ (added)         | Optional (falls back to VERCEL_URL)     |
| `VERCEL_URL`              | Auto-set by Vercel | N/A                                     |
| `NODE_ENV`                | Auto-set           | N/A                                     |
