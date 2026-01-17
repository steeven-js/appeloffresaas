# Story 1.5.2: AppSidebar Navigation

Status: done

## Story

As a **logged-in user**,
I want **a sidebar with clear navigation links and visual indicators**,
So that **I can quickly access different sections of the application**.

## Acceptance Criteria

1. Sidebar displays application logo at the top
2. Navigation links include: Dashboard, Mes AO, Profil Entreprise, Documents, Paramètres, Facturation
3. Each link has an icon (Lucide) and label
4. Current page/section is highlighted with visual indicator
5. Clicking a navigation link navigates to the corresponding page
6. Parent section is highlighted when on a child page
7. `components/layout/app-sidebar.tsx` component exists
8. Uses `usePathname()` for active state detection
9. `pnpm typecheck` passes
10. `pnpm lint` passes
11. `pnpm build` succeeds

## Technical Context

### Navigation Structure

Based on existing routes in `src/app/(auth)/`:
- `/dashboard` - Dashboard (Home icon)
- `/tenders` - Mes AO (FileText icon) - Future
- `/profile/company` - Profil Entreprise (Building icon)
- `/documents` - Documents (FolderOpen icon) - Future
- `/settings` - Paramètres (Settings icon)
- `/billing` - Facturation (CreditCard icon)

### From Architecture

- Client Component required for `usePathname()` hook
- Use shadcn/ui Button with `variant="ghost"` for nav items
- Lucide React for icons

### From UX Design Specification

- Section 7.3: Sidebar navigation with main navigation links
- Active state: primary color background, bold text
- Hover state: subtle background change

## Tasks / Subtasks

- [x] Task 1: Create AppSidebar component (AC: #7)
  - [x] 1.1 Create `src/components/layout/app-sidebar.tsx`
  - [x] 1.2 Add "use client" directive for usePathname hook
  - [x] 1.3 Define navigation items array with label, href, icon

- [x] Task 2: Implement logo section (AC: #1)
  - [x] 2.1 Add logo/brand at top of sidebar
  - [x] 2.2 Link logo to dashboard

- [x] Task 3: Implement navigation links (AC: #2, #3, #4, #5)
  - [x] 3.1 Render navigation items with icons and labels
  - [x] 3.2 Use Link component for navigation
  - [x] 3.3 Implement active state detection with usePathname
  - [x] 3.4 Style active state (highlight current page with primary bg)

- [x] Task 4: Handle nested routes (AC: #6)
  - [x] 4.1 Match parent paths for nested routes (e.g., /profile/* highlights Profile)

- [x] Task 5: Integrate with auth layout (AC: #8)
  - [x] 5.1 Update `(auth)/layout.tsx` to use AppSidebar
  - [x] 5.2 Remove placeholder sidebar content (kept user email area for Story 1.5.3)

- [x] Task 6: Verification (AC: #9, #10, #11)
  - [x] 6.1 Run `pnpm typecheck` - passed
  - [x] 6.2 Run `pnpm lint` - passed
  - [x] 6.3 Run `pnpm build` - passed

## Dev Notes

### Navigation Items Configuration

```typescript
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mes AO", href: "/tenders", icon: FileText },
  { label: "Profil Entreprise", href: "/profile/company", icon: Building },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Paramètres", href: "/settings", icon: Settings },
  { label: "Facturation", href: "/billing", icon: CreditCard },
];
```

### Active State Logic

```typescript
const isActive = (href: string) => {
  if (href === "/dashboard") return pathname === href;
  return pathname.startsWith(href);
};
```

### References

- [Source: epics.md#Story 1.5.2: AppSidebar Navigation]
- [Lucide React Icons](https://lucide.dev/icons/)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/layout/app-sidebar.tsx` | Create | Sidebar navigation component |
| `src/app/(auth)/layout.tsx` | Modify | Use AppSidebar instead of placeholder |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 1.5 - Dashboard Shell implementation |
| 2026-01-17 | Implementation completed | All tasks and acceptance criteria satisfied |

### Completion Notes

- Created `AppSidebar` client component with usePathname for active state
- Navigation includes 6 items: Dashboard, Mes AO, Profil Entreprise, Documents, Paramètres, Facturation
- Active state detection: exact match for /dashboard, startsWith for others
- Logo links to dashboard, styled consistently with marketing header
- Integrated into auth layout, keeping user email area for Story 1.5.3
- All verification passed: typecheck, lint, build
