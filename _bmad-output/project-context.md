---
project_name: "appeloffresaas"
user_name: "Steeven"
date: "2026-01-16"
sections_completed:
  [
    "technology_stack",
    "typescript_rules",
    "framework_rules",
    "testing_rules",
    "code_quality",
    "workflow_rules",
    "critical_rules",
  ]
workflow_complete: true
status: complete
rule_count: 58
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core

- **Next.js 15** (App Router) - Turbopack dev, strict TypeScript
- **TypeScript 5.x** - Mode strict obligatoire
- **Node.js 20+** - Runtime minimum
- **tRPC v11** - API type-safe end-to-end
- **Drizzle ORM 0.33+** - PostgreSQL, migrations SQL natives

### Database & Cache

- **Neon PostgreSQL** - Serverless, branching support
- **Upstash Redis** - Serverless, @upstash/redis SDK

### UI

- **Tailwind CSS 3.4+** - PostCSS config
- **shadcn/ui** - Radix UI primitives
- **TipTap** - WYSIWYG editor headless

### State Management

- **React Query** (via tRPC) - Server state
- **Zustand** - Client state léger
- **React Hook Form + Zod** - Forms validation

### Infrastructure

- **Vercel Pro** - Deployment, Edge Functions
- **Cloudflare R2** - File storage (S3-compatible)
- **Inngest** - Background jobs durables
- **Resend** - Transactional emails
- **Stripe** - Subscriptions & payments

### AI Integration

- **Vercel AI SDK** - Streaming SSE
- **Claude API** (claude-sonnet-4-20250514) - LLM provider

---

## Critical Implementation Rules

### TypeScript Rules

#### Configuration

- Mode strict obligatoire - jamais désactiver `strict: true`
- Utiliser `@/` pour tous les imports (configuré dans tsconfig paths)
- Éviter les barrel exports (`index.ts` qui re-exportent) - impact performance

#### Types & Inference

- Laisser TypeScript inférer quand possible (pas de types redondants)
- Exporter les types séparément: `export type { MyType }`
- Utiliser `satisfies` pour valider les objets sans élargir le type
- Zod schemas pour validation runtime + inférence types

#### Error Handling

- Toujours utiliser `TRPCError` dans les procedures tRPC
- Codes standards: `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`
- Messages d'erreur en français pour l'utilisateur
- Wrapper les appels externes (AI, Stripe) dans try/catch

#### Async Patterns

- `async/await` préféré aux `.then()` chaînés
- `Promise.allSettled()` pour opérations parallèles avec gestion d'erreur
- Jamais ignorer les rejections de Promise

### Framework Rules (Next.js / React / tRPC)

#### Next.js App Router

- Route groups: `(auth)/` routes protégées, `(public)/` routes publiques
- Server Components par défaut - `"use client"` uniquement si interactivité requise
- Layouts pour UI persistante (sidebar, header)
- `loading.tsx` et `error.tsx` pour chaque route dynamique

#### React Components

- Composants par feature: `components/features/{domain}/`
- Composants UI réutilisables: `components/ui/` (shadcn)
- Hooks custom: `hooks/use{Feature}.ts` (ex: `useTender.ts`)
- Pas de `memo()` par défaut - optimiser uniquement si mesuré

#### tRPC API

- Un router par domaine: `server/api/routers/{domain}.ts`
- Naming procedures: `get{Entity}`, `create{Entity}`, `update{Entity}`, `delete{Entity}`, `list{Entities}`
- Input schemas Zod: `{Action}{Entity}Input` (ex: `CreateTenderInput`)
- Middleware auth: `protectedProcedure` pour routes authentifiées

#### State Management

- **Server state**: React Query via tRPC uniquement (pas de useState pour données API)
- **UI state**: Zustand stores dans `stores/`
- **Form state**: React Hook Form + Zod resolver
- **Editor state**: TipTap internal state

### Testing Rules

#### Test Organization

- Tests co-localisés: `Component.test.tsx` à côté de `Component.tsx`
- Tests d'intégration: `__tests__/integration/`
- Helpers de test: `__tests__/helpers/`

#### Test Patterns

- **Vitest** pour tous les tests (unitaires + intégration)
- **Testing Library** pour composants - tester le comportement, pas l'implémentation
- **MSW** pour mock HTTP/API en tests
- **tRPC createCaller** pour tester procedures directement

#### Test Naming

- Fichiers: `{name}.test.ts` ou `{name}.test.tsx`
- `describe('FeatureName', ...)` pour grouper
- `it('should do something when condition', ...)` pour cas de test

#### What to Test

- Procedures tRPC: input validation, auth, business logic
- Composants: interactions utilisateur, états, edge cases
- Hooks custom: comportement, cleanup
- **Ne pas tester**: styles, implémentation interne React Query

### Code Quality & Style Rules

#### Naming Conventions

| Element     | Convention        | Example           |
| ----------- | ----------------- | ----------------- |
| DB Tables   | snake_case plural | `tender_projects` |
| DB Columns  | snake_case        | `created_at`      |
| DB Enums    | PascalCase        | `TenderStatus`    |
| Components  | PascalCase.tsx    | `TenderCard.tsx`  |
| Hooks       | useCamelCase      | `useTender`       |
| Utilities   | camelCase         | `formatDate`      |
| Constants   | SCREAMING_SNAKE   | `MAX_FILE_SIZE`   |
| Types       | PascalCase        | `Tender`          |
| Zod Schemas | camelCaseSchema   | `tenderSchema`    |

#### File Organization

- `app/` - Next.js routes only (no business logic)
- `components/features/{domain}/` - Feature components grouped by domain
- `components/ui/` - shadcn/ui components (don't modify directly)
- `server/api/routers/` - One router file per domain
- `server/db/schema/` - One schema file per entity group
- `server/services/` - Business logic, external integrations
- `lib/` - Pure utility functions
- `hooks/` - Custom React hooks
- `stores/` - Zustand store definitions

#### Code Style

- ESLint + Prettier configurés - toujours formatter avant commit
- Max 1 composant exporté par fichier
- Destructurer les props en paramètre de fonction
- Éviter les commentaires évidents - code auto-documenté

### Development Workflow Rules

#### Git Branching

- `main` - Production branch, always deployable
- `feature/{story-id}-{description}` - Feature work (ex: `feature/1-1-user-auth`)
- `fix/{issue}-{description}` - Bug fixes
- Merge via Pull Request uniquement

#### Commit Messages

- Format: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Scope: domaine métier (`tender`, `chat`, `auth`, `profile`, `document`)
- Exemple: `feat(tender): implement RC parsing with Inngest`

#### Database Workflow

- `pnpm db:push` - Sync schema (dev only, destructive)
- `pnpm db:generate` - Generate migration
- `pnpm db:migrate` - Run migrations (production)
- `pnpm db:studio` - Open Drizzle Studio

#### Deployment

- Push to `main` → Auto-deploy production (Vercel)
- Pull Request → Preview deployment
- Environment variables in Vercel dashboard (never in code)
- Feature flags via environment variables for gradual rollout

### Critical Don't-Miss Rules

#### Anti-Patterns to Avoid

- ❌ **No secrets in code** - Always use environment variables
- ❌ **No barrel exports** - Import directly from source files
- ❌ **No `any` type** - Use `unknown` and narrow with type guards
- ❌ **No silent error swallowing** - Always handle or rethrow
- ❌ **No direct fetch** - Use tRPC for API, Vercel AI SDK for LLM

#### Security Rules

- **Server-side validation** - Never trust client input, validate with Zod
- **User isolation** - Always filter by `userId` in queries
- **Rate limiting** - Apply to all public endpoints (Upstash Ratelimit)
- **RGPD compliance** - Support data export and deletion
- **Auth middleware** - Use `protectedProcedure` for all authenticated routes

#### Performance Rules

- **No N+1 queries** - Use Drizzle `with` for relations
- **Pagination required** - All list endpoints must accept `limit`/`offset`
- **Lazy load heavy components** - TipTap, charts, PDF preview
- **Optimistic updates** - Use React Query mutation callbacks
- **Debounce saves** - Auto-save with 2s debounce minimum

#### AI-Specific Rules

- **Always stream** - Use SSE for Claude responses, never await full response
- **Inngest for long jobs** - RC parsing, document generation (>10s)
- **Context management** - Keep chat context < 100k tokens
- **Graceful fallback** - Handle Claude API unavailability
- **Cost tracking** - Log token usage per request

#### Edge Cases

- **Empty states** - Always handle empty lists, null data
- **Loading states** - Show skeletons, never blank screens
- **Error boundaries** - Wrap feature sections, not whole app
- **Offline handling** - Show clear message, queue actions if possible

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

_Last Updated: 2026-01-16_
