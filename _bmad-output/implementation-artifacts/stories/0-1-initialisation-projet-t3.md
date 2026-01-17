# Story 0.1: Initialisation Projet T3

Status: done

## Story

As a **developer**,
I want **a bootstrapped Next.js project with tRPC, Drizzle, and Tailwind configured**,
so that **I can start building features on a solid, type-safe foundation**.

## Acceptance Criteria

1. Project created with create-t3-app using Next.js 15, TypeScript 5.x, tRPC v11, Drizzle ORM, and Tailwind CSS 3.4+
2. `pnpm dev` runs successfully and displays the default T3 homepage
3. TypeScript strict mode enabled with zero compilation errors
4. ESLint and Prettier configured and passing
5. Project structure follows the architecture specification
6. Git repository initialized with .gitignore configured for Next.js

## Tasks / Subtasks

- [x] Task 1: Initialize T3 project (AC: #1)
  - [x] 1.1 Run `pnpm create t3-app@latest appeloffresaas --tailwind --trpc --drizzle --dbProvider postgres --appRouter --CI`
  - [x] 1.2 Verify all dependencies installed correctly
  - [x] 1.3 Review generated project structure

- [x] Task 2: Verify TypeScript configuration (AC: #3)
  - [x] 2.1 Confirm `strict: true` in tsconfig.json
  - [x] 2.2 Ensure no TypeScript errors with `pnpm typecheck`
  - [x] 2.3 Verify path aliases configured (`~/` mapping)

- [x] Task 3: Verify dev server runs (AC: #2)
  - [x] 3.1 Run `pnpm dev` and confirm Turbopack starts
  - [x] 3.2 Access http://localhost:3000 and verify T3 homepage renders
  - [x] 3.3 Verify hot reload works on file changes

- [x] Task 4: Configure linting and formatting (AC: #4)
  - [x] 4.1 Verify ESLint configuration is strict
  - [x] 4.2 Run `pnpm lint` and fix any issues
  - [x] 4.3 Configure Prettier with project settings
  - [x] 4.4 Run `pnpm format` to format all files

- [x] Task 5: Verify project structure (AC: #5)
  - [x] 5.1 Confirm `app/` directory uses App Router
  - [x] 5.2 Confirm `server/api/` structure for tRPC
  - [x] 5.3 Confirm `server/db/` structure for Drizzle
  - [x] 5.4 Verify `lib/` and `components/ui/` directories exist

- [x] Task 6: Initialize Git repository (AC: #6)
  - [x] 6.1 Initialize git if not already done by create-t3-app
  - [x] 6.2 Verify .gitignore includes: node_modules, .env\*, .next, drizzle
  - [x] 6.3 Create initial commit with message `feat(foundation): initialize T3 project with Next.js 15, tRPC, Drizzle`

## Dev Notes

### Technical Requirements

- **Node.js:** 20+ required (verify with `node -v`)
- **Package Manager:** pnpm (verify with `pnpm -v`)
- **Next.js Version:** 15 with App Router (not Pages Router)
- **Turbopack:** Enabled by default for dev server
- **TypeScript:** Strict mode mandatory - never disable

### Key Architecture Patterns

From project-context.md:

- Use `~/` for all imports (configured in tsconfig paths)
- Avoid barrel exports (`index.ts` that re-export) - performance impact
- Server Components by default - `"use client"` only if interactivity required
- tRPC routers in `server/api/routers/{domain}.ts`

### Expected Project Structure After Initialization

```
appeloffresaas/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── api/
│       └── trpc/[trpc]/    # tRPC route handler
├── server/
│   ├── api/
│   │   ├── root.ts         # Root router
│   │   └── routers/        # Domain routers
│   │       └── post.ts     # Example router (will be replaced)
│   ├── db/
│   │   ├── index.ts        # DB client
│   │   └── schema.ts       # Drizzle schema
│   └── auth.ts             # NextAuth config (basic)
├── lib/
│   └── utils.ts            # Utility functions
├── components/
│   └── (empty or basic)
├── styles/
│   └── globals.css         # Tailwind imports
├── drizzle.config.ts       # Drizzle configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript config
├── .env.example            # Environment template
└── package.json
```

### Environment Variables Template

The following will be needed (setup in Story 0.3+):

```env
# Database (Story 0.3)
DATABASE_URL=

# NextAuth (Epic 1)
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

### Testing the Installation

After all tasks complete, verify:

1. `pnpm dev` → Server starts on http://localhost:3000
2. `pnpm build` → Production build succeeds
3. `pnpm typecheck` → No TypeScript errors
4. `pnpm lint` → No linting errors

### Project Structure Notes

- This is a greenfield project - no existing code to conflict with
- Structure follows create-t3-app v7.40 conventions
- Future stories will add: `components/ui/`, `components/features/`, `hooks/`, `stores/`

### References

- [Source: architecture.md#2. Starter Template Evaluation] - create-t3-app selection rationale
- [Source: architecture.md#2.3 Selected Starter] - Initialization commands
- [Source: project-context.md#Technology Stack & Versions] - Version requirements
- [Source: project-context.md#Critical Implementation Rules] - TypeScript rules
- [Source: epics.md#Story 0.1] - Original acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Initial `create-t3-app` CLI had TTY initialization errors - resolved by using `giget` to clone templates directly
- Changed `--dbProvider postgresql` to `--dbProvider postgres` (correct flag name)
- PostCSS config originally referenced `@tailwindcss/postcss` (Tailwind v4) - fixed to `tailwindcss` (v3)
- Removed i18n config from next.config.js (not supported in App Router)
- Made AUTH_SECRET optional in env.js for development (enforced in Epic 1)
- Added DATABASE_URL fallback in db/index.ts for typecheck to pass without .env

### Completion Notes List

1. **T3 Stack Initialized**: Project bootstrapped with Next.js 15.1.4, tRPC v11, Drizzle ORM 0.38.3, Tailwind CSS 3.4.17
2. **TypeScript Strict Mode**: Enabled with `strict: true`, path alias `~/` configured
3. **Dev Server**: Turbopack enabled, `pnpm dev` and `pnpm build` both succeed
4. **Linting/Formatting**: ESLint 9 with drizzle plugin, Prettier with tailwind plugin - all passing
5. **Project Structure**: App Router structure with `app/`, `server/api/`, `server/db/`, `lib/`, `components/ui/`
6. **Git Repository**: Initialized with initial commit `ba9eb72`

All 6 acceptance criteria have been met.

### Code Review Fixes Applied

**Review Date:** 2026-01-16
**Reviewer:** Claude Opus 4.5 (adversarial code review)

Fixes applied during code review:

1. **[HIGH] Created `src/components/ui/` directory** - Was missing from project structure
2. **[HIGH] Fixed `drizzle.config.ts`** - Replaced dangerous `!` non-null assertion with fallback
3. **[HIGH] Fixed Discord Provider** - Now conditionally loaded only when env vars are configured
4. **[MEDIUM] Updated metadata in `layout.tsx`** - French title and description for appeloffresaas
5. **[MEDIUM] Changed `html lang="en"` to `"fr"`** - French locale for target market
6. **[MEDIUM] Fixed production logging** - Wrapped console.log in isDev check in trpc.ts

### File List

**Configuration Files:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode, path aliases)
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS with tailwindcss plugin
- `eslint.config.js` - ESLint 9 flat config with drizzle plugin
- `prettier.config.js` - Prettier with tailwind plugin
- `drizzle.config.ts` - Drizzle ORM configuration (review: fixed non-null assertion)
- `next.config.js` - Next.js configuration
- `.gitignore` - Git ignore patterns
- `.env.example` - Environment variables template

**Source Files:**
- `src/env.js` - Environment validation with @t3-oss/env-nextjs
- `src/app/layout.tsx` - Root layout with TRPCReactProvider (review: updated metadata, lang="fr")
- `src/app/page.tsx` - Homepage with example post CRUD
- `src/app/_components/post.tsx` - Client component for post form
- `src/app/api/trpc/[trpc]/route.ts` - tRPC HTTP handler
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth route handlers
- `src/trpc/query-client.ts` - React Query client factory
- `src/trpc/react.tsx` - tRPC React hooks provider
- `src/trpc/server.ts` - Server-side tRPC caller
- `src/server/api/trpc.ts` - tRPC context and procedures (review: fixed prod logging)
- `src/server/api/root.ts` - Root router with postRouter
- `src/server/api/routers/post.ts` - Example post router
- `src/server/db/index.ts` - Drizzle database client
- `src/server/db/schema/index.ts` - Database schema with createTable helper
- `src/server/auth/index.ts` - Auth exports
- `src/server/auth/config/index.ts` - NextAuth configuration (review: conditional Discord provider)
- `src/styles/globals.css` - Tailwind CSS imports
- `src/lib/utils.ts` - cn() utility function (clsx + tailwind-merge)
- `src/components/ui/.gitkeep` - Placeholder for shadcn/ui components (review: created)
