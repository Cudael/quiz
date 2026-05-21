# QuizMaster 🧠

A full-featured, Kahoot-inspired quiz platform built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Auth**: NextAuth.js
- **State**: Zustand
- **Testing**: Vitest + React Testing Library

## 📦 Scripts

| Script              | Description                 |
| ------------------- | --------------------------- |
| `npm run dev`       | Start development server    |
| `npm run build`     | Build for production        |
| `npm run lint`      | Run ESLint                  |
| `npm run typecheck` | Run TypeScript type checker |
| `npm test`          | Run unit tests              |

## 🗂 Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
│   └── ui/        # Design system primitives
├── lib/           # Utility functions
└── test/          # Test setup and utilities
```

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

## 🏗 Development Phases

- [x] **Phase 1** — Foundation & Design System
- [ ] **Phase 2** — Data Model & Seed Content
- [ ] **Phase 3** — Core Quiz Gameplay
- [ ] **Phase 4** — Quiz Creation Studio
- [ ] **Phase 5** — Leaderboards, Profiles & Gamification
- [ ] **Phase 6** — Polish & Delight
- [ ] **Phase 7** — Tests & Docs
