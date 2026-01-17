# Story 1.5.3: UserDropdown Menu

Status: done

## Story

As a **logged-in user**,
I want **a user dropdown menu in the sidebar**,
So that **I can access my profile, settings, and logout quickly**.

## Acceptance Criteria

1. User section at bottom of sidebar shows avatar (or initials), name, and email
2. Clicking the user section opens a dropdown menu
3. Dropdown options: Mon profil, Paramètres, Thème (toggle), Déconnexion
4. Each option has an appropriate icon
5. Theme toggle switches between light and dark mode
6. Theme preference is persisted
7. Logout redirects to login page
8. `components/layout/user-dropdown.tsx` component exists
9. `pnpm typecheck` passes
10. `pnpm lint` passes
11. `pnpm build` succeeds

## Technical Context

### Dependencies Added

- `next-themes` - Theme switching
- `shadcn/ui dropdown-menu` - Dropdown component
- `shadcn/ui avatar` - Avatar component

### From Architecture

- Use signOut from next-auth for logout
- Client Component required for dropdown interaction

## Tasks / Subtasks

- [x] Task 1: Install dependencies (AC: prerequisite)
  - [x] 1.1 Install next-themes
  - [x] 1.2 Add shadcn dropdown-menu component
  - [x] 1.3 Add shadcn avatar component

- [x] Task 2: Setup theme provider (AC: #5, #6)
  - [x] 2.1 Create ThemeProvider wrapper component
  - [x] 2.2 Add ThemeProvider to root layout

- [x] Task 3: Create UserDropdown component (AC: #1, #2, #3, #4, #8)
  - [x] 3.1 Create `src/components/layout/user-dropdown.tsx`
  - [x] 3.2 Display avatar with initials fallback
  - [x] 3.3 Show user name and email
  - [x] 3.4 Add dropdown with menu items
  - [x] 3.5 Add icons to each menu item

- [x] Task 4: Implement theme toggle (AC: #5, #6)
  - [x] 4.1 Add theme toggle submenu with Light/Dark/System options

- [x] Task 5: Implement logout (AC: #7)
  - [x] 5.1 Add logout button with signOut action

- [x] Task 6: Integrate with auth layout
  - [x] 6.1 Update auth layout to use UserDropdown
  - [x] 6.2 Pass session data to UserDropdown

- [x] Task 7: Verification (AC: #9, #10, #11)
  - [x] 7.1 Run `pnpm typecheck` - passed
  - [x] 7.2 Run `pnpm lint` - passed
  - [x] 7.3 Run `pnpm build` - passed

## Dev Notes

### Session Data Required

```typescript
interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}
```

### References

- [Source: epics.md#Story 1.5.3: UserDropdown Menu]
- [next-themes docs](https://github.com/pacocoursey/next-themes)
- [shadcn/ui DropdownMenu](https://ui.shadcn.com/docs/components/dropdown-menu)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/layout/user-dropdown.tsx` | Create | User dropdown menu component |
| `src/components/theme-provider.tsx` | Create | ThemeProvider wrapper |
| `src/app/layout.tsx` | Modify | Add ThemeProvider |
| `src/app/(auth)/layout.tsx` | Modify | Use UserDropdown |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 1.5 - Dashboard Shell implementation |
| 2026-01-17 | Implementation completed | All tasks and acceptance criteria satisfied |

### Completion Notes

- Installed next-themes 0.4.6 for theme management
- Added shadcn/ui dropdown-menu and avatar components
- Created ThemeProvider wrapper with system/light/dark support
- Created UserDropdown with avatar, name, email display
- Dropdown includes: Mon profil, Paramètres, Thème submenu, Déconnexion
- Theme persists via next-themes localStorage
- Logout uses signOut from next-auth/react with redirect to /login
- All verification passed: typecheck, lint, build
