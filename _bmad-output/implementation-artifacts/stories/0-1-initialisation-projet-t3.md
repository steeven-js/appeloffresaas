# Story 0.1: Initialisation Projet T3

Status: in-progress

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

- [ ] Task 1: Initialize T3 project (AC: #1)
  - [ ] 1.1 Run `pnpm create t3-app@latest appeloffresaas --tailwind --trpc --drizzle --dbProvider postgresql --appRouter --CI`
  - [ ] 1.2 Verify all dependencies installed correctly
  - [ ] 1.3 Review generated project structure

- [ ] Task 2: Verify TypeScript configuration (AC: #3)
  - [ ] 2.1 Confirm `strict: true` in tsconfig.json
  - [ ] 2.2 Ensure no TypeScript errors with `pnpm typecheck`
  - [ ] 2.3 Verify path aliases configured (`@/` mapping)

- [ ] Task 3: Verify dev server runs (AC: #2)
  - [ ] 3.1 Run `pnpm dev` and confirm Turbopack starts
  - [ ] 3.2 Access http://localhost:3000 and verify T3 homepage renders
  - [ ] 3.3 Verify hot reload works on file changes

- [ ] Task 4: Configure linting and formatting (AC: #4)
  - [ ] 4.1 Verify ESLint configuration is strict
  - [ ] 4.2 Run `pnpm lint` and fix any issues
  - [ ] 4.3 Configure Prettier with project settings
  - [ ] 4.4 Run `pnpm format` to format all files

- [ ] Task 5: Verify project structure (AC: #5)
  - [ ] 5.1 Confirm `app/` directory uses App Router
  - [ ] 5.2 Confirm `server/api/` structure for tRPC
  - [ ] 5.3 Confirm `server/db/` structure for Drizzle
  - [ ] 5.4 Verify `lib/` and `components/` directories exist

- [ ] Task 6: Initialize Git repository (AC: #6)
  - [ ] 6.1 Initialize git if not already done by create-t3-app
  - [ ] 6.2 Verify .gitignore includes: node_modules, .env\*, .next, drizzle
  - [ ] 6.3 Create initial commit with message `feat(foundation): initialize T3 project with Next.js 15, tRPC, Drizzle`

## Dev Notes

### Technical Requirements

- **Node.js:** 20+ required (verify with `node -v`)
- **Package Manager:** pnpm (verify with `pnpm -v`)
- **Next.js Version:** 15 with App Router (not Pages Router)
- **Turbopack:** Enabled by default for dev server
- **TypeScript:** Strict mode mandatory - never disable

### Key Architecture Patterns

From project-context.md:

- Use `@/` for all imports (configured in tsconfig paths)
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

(To be filled by dev agent)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled after completion)

### File List

(To be filled with created/modified files)
