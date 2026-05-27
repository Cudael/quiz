# Testing guide

BusQuiz uses **Vitest** (v2) with **React Testing Library** and **jsdom** for all unit and component tests.

## Running tests

```bash
# Run all tests once (CI mode)
npm test -- --run

# Run in watch mode (development)
npm test

# Run a single test file
./node_modules/.bin/vitest --run src/lib/time.test.ts
```

## Test structure

Tests live next to the source files they cover:

```
src/
  lib/
    time.ts            → time.test.ts
    copy.ts            → copy.test.ts
    motion.ts          → motion.test.ts
    preferences.ts     → preferences.test.ts
    usernames.ts       → usernames.test.ts
    slugify.ts         → slugify.test.ts
    site.ts            → site.test.ts
    ...
  store/
    play-session.ts    → play-session.test.ts
    quiz-creator-store.ts → quiz-creator-store.test.ts
  components/
    ui/
      skeleton.tsx     → skeleton.test.tsx
      empty-state.tsx  → empty-state.test.tsx
      streak-flame.tsx → streak-flame.test.tsx
      toast.tsx        → toast.test.tsx
    auth/
      guest-upgrade-prompt.tsx → guest-upgrade-prompt.test.tsx
  domain/
    badges.ts          → badges.test.ts
    leveling.ts        → leveling.test.ts
    scoring.ts         → scoring.test.ts
    streak.ts          → streak.test.ts
  test/
    setup.ts           # global setup — jest-dom, matchMedia, IntersectionObserver
    axe-smoke.test.tsx # axe accessibility smoke tests
    lucide-icons.test.ts
    seed-data.test.ts
```

## Setup file (`src/test/setup.ts`)

The global setup file runs before every test and polyfills:

- `@testing-library/jest-dom` — extends `expect` with DOM matchers
- `window.matchMedia` — stub for components that query media
- `IntersectionObserver` — stub for scroll-triggered components
- `HTMLCanvasElement.getContext` — stub to avoid canvas errors

## Mocking conventions

### Next.js navigation

```ts
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

### NextAuth

```ts
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))
```

### Next.js `Link`

```tsx
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
```

### Framer Motion

Wrap animation-heavy components by mocking `framer-motion` with pass-through stubs:

```ts
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))
```

### Prisma / server modules

Use `vi.hoisted` to define mocks before module imports, then call `vi.mock`:

```ts
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { user: { findUnique: vi.fn() } },
}))

vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))
```

### `server-only` stub

`vitest.config.ts` maps the bare `server-only` specifier to `src/test/server-only.ts` (an empty module) so server-only imports don't break in jsdom.

## Writing a new test

1. Create `YourModule.test.ts` (or `.test.tsx` for React components) next to the source file.
2. Import from `vitest` and `@testing-library/react` as needed.
3. Use `vi.mock` for side-effectful dependencies (Prisma, Next.js, NextAuth).
4. Reset mocks in `beforeEach` with `vi.clearAllMocks()`.
5. For Zustand stores, call `reset()` (or re-apply initial values) in `beforeEach`.

## Accessibility tests

`src/test/axe-smoke.test.tsx` uses `vitest-axe` to run automated accessibility checks against rendered HTML for key routes. The helper `expectNoSeriousOrCritical` fails the test if any `serious` or `critical` axe violations are found.

## Coverage

To generate a coverage report:

```bash
./node_modules/.bin/vitest --run --coverage
```

Coverage output is written to `coverage/` (ignored by `.gitignore`).
