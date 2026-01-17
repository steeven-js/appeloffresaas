# Story 1.5.5: Mobile Responsive Drawer

Status: done

## Story

As a **mobile user**,
I want **the sidebar to be accessible via a drawer on smaller screens**,
So that **I can navigate the app comfortably on my phone or tablet**.

## Acceptance Criteria

1. On screens < 1024px (lg breakpoint), sidebar is hidden
2. Mobile header with hamburger menu is visible on mobile
3. Tapping hamburger opens sidebar as drawer from left
4. Drawer shows full sidebar content (navigation + user dropdown)
5. Drawer closes when navigating to a new page
6. Drawer closes when tapping outside or pressing Escape
7. `pnpm typecheck` passes
8. `pnpm lint` passes
9. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Add shadcn Sheet component
  - [x] 1.1 Install shadcn sheet component

- [x] Task 2: Create MobileSidebar component
  - [x] 2.1 Create `src/components/layout/mobile-sidebar.tsx`
  - [x] 2.2 Use Sheet component for drawer
  - [x] 2.3 Close on navigation (usePathname + useEffect)

- [x] Task 3: Update AppLayout for mobile header
  - [x] 3.1 Add mobileHeader prop to AppLayout
  - [x] 3.2 Render mobile header on screens < lg

- [x] Task 4: Update auth layout
  - [x] 4.1 Create mobileHeader with MobileSidebar and logo
  - [x] 4.2 Pass sidebar content to both desktop and mobile

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck` - passed
  - [x] 5.2 Run `pnpm lint` - passed
  - [x] 5.3 Run `pnpm build` - passed

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/sheet.tsx` | Created | shadcn Sheet component |
| `src/components/layout/mobile-sidebar.tsx` | Created | Mobile sidebar drawer wrapper |
| `src/components/layout/app-layout.tsx` | Modified | Added mobileHeader prop |
| `src/app/(auth)/layout.tsx` | Modified | Added mobile header with MobileSidebar |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Implementation completed | Mobile responsive sidebar |

### Completion Notes

- MobileSidebar uses shadcn Sheet component (side="left")
- Auto-closes on pathname change via useEffect
- Mobile header (h-14) shows on lg:hidden screens
- Contains hamburger button + logo
- Same sidebar content in both desktop and mobile views
- All verification passed
