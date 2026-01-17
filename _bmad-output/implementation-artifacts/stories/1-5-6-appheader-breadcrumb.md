# Story 1.5.6: AppHeader avec Breadcrumb

Status: done

## Story

As a **logged-in user**,
I want **a contextual header with breadcrumb navigation**,
So that **I know where I am and can navigate back easily**.

## Acceptance Criteria

1. Header with breadcrumb visible on desktop (lg+)
2. Breadcrumb shows current path segments
3. Each segment (except current) is clickable
4. French labels for known routes
5. Header supports optional action buttons slot
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Add shadcn Breadcrumb component
  - [x] 1.1 Install shadcn breadcrumb component

- [x] Task 2: Create AppHeader component
  - [x] 2.1 Create `src/components/layout/app-header.tsx`
  - [x] 2.2 Parse pathname into breadcrumb segments
  - [x] 2.3 Map segments to French labels
  - [x] 2.4 Render clickable links (except current page)
  - [x] 2.5 Add optional actions slot

- [x] Task 3: Integrate into AppLayout
  - [x] 3.1 Import AppHeader in app-layout.tsx
  - [x] 3.2 Render header in main content area (desktop only)

- [x] Task 4: Verification
  - [x] 4.1 Run `pnpm typecheck` - passed
  - [x] 4.2 Run `pnpm lint` - passed
  - [x] 4.3 Run `pnpm build` - passed

## Dev Notes

### Route Labels

```typescript
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  tenders: "Mes AO",
  profile: "Profil",
  company: "Entreprise",
  documents: "Documents",
  settings: "Paramètres",
  billing: "Facturation",
};
```

### Future Enhancements

- Add action buttons for specific pages
- Dynamic page titles from data
- Mobile breadcrumb (simplified)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/breadcrumb.tsx` | Created | shadcn Breadcrumb component |
| `src/components/layout/app-header.tsx` | Created | Header with breadcrumb navigation |
| `src/components/layout/app-layout.tsx` | Modified | Integrated AppHeader |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Implementation completed | Header with breadcrumb |

### Completion Notes

- AppHeader uses shadcn Breadcrumb component
- Dynamic breadcrumb based on pathname
- French labels via routeLabels mapping
- Supports optional actions slot for future use
- Visible on desktop only (lg:block)
- All verification passed
