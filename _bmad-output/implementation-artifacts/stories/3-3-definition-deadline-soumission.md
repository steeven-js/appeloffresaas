# Story 3.3: Définition Deadline Soumission

Status: done

## Story

As a **user**,
I want **to set the submission deadline for my tender**,
So that **I can track time remaining and receive reminders**.

## Acceptance Criteria

1. Given I am in a tender project
2. When I set the submission deadline (date and time)
3. Then the deadline is saved and displayed prominently
4. And I see a countdown to the deadline
5. And the system will send reminders based on this date (Epic 8)
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing deadline infrastructure (AC: #2)
  - [x] 1.1 Schema has submissionDeadline field (timestamp with timezone)
  - [x] 1.2 API accepts datetime-local string input
  - [x] 1.3 Form field exists with datetime-local input type
  - [x] 1.4 getDeadlineStatus() function returns urgency level

- [x] Task 2: Implement countdown timer (AC: #4)
  - [x] 2.1 Create calculateCountdown() function
  - [x] 2.2 Add countdown state with CountdownValue interface
  - [x] 2.3 Add useEffect with setInterval to update every second
  - [x] 2.4 Display days, hours, minutes, seconds in grid layout

- [x] Task 3: Create prominent deadline display (AC: #3)
  - [x] 3.1 Add dedicated Deadline Card above Quick Stats
  - [x] 3.2 Show formatted date with countdown grid
  - [x] 3.3 Add urgency styling (orange for < 3 days, red for < 12h)
  - [x] 3.4 Add "Expirée" badge when deadline has passed
  - [x] 3.5 Add "Urgent" badge when deadline is within 3 days
  - [x] 3.6 Show prompt to set deadline when not defined

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Countdown Implementation

Created `calculateCountdown()` function that returns:
```typescript
interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;      // total milliseconds remaining
  isPassed: boolean;  // true if deadline has passed
}
```

### Real-time Updates

Using `useEffect` with `setInterval` to update countdown every second:
- Interval is cleared on component unmount
- Countdown recalculates when deadline changes

### Visual Urgency Indicators

| Condition | Color | Visual |
|-----------|-------|--------|
| > 3 days | Default | Normal display |
| < 3 days | Orange | Orange text + "Urgent" badge |
| < 12 hours | Red | Red text + border |
| Passed | Red | "Expirée" badge + warning message |

### Deadline Card States

1. **No deadline set**: Dashed border, prompt button to set deadline
2. **Deadline upcoming**: Normal display with countdown
3. **Deadline urgent**: Orange styling, "Urgent" badge
4. **Deadline passed**: Red styling, "Expirée" badge, warning message

### Reminder System

The `submissionDeadline` field is used for:
- Countdown display (this story)
- Reminder emails (Epic 8 - Story 8.4)
- Sorting projects by urgency in list view

### References

- [Source: epics.md#Story 3.3: Définition Deadline Soumission]
- [FR23: Set submission deadline with countdown]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/tenders/project-workspace.tsx` | Modified | Added countdown timer and prominent deadline card |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 3 Story 3.3 - Deadline with countdown |
| 2026-01-17 | Added calculateCountdown() | Real-time countdown calculation |
| 2026-01-17 | Added Deadline Card | Prominent display with urgency indicators |

### Completion Notes

- All acceptance criteria satisfied
- Countdown updates every second in real-time
- Visual urgency indicators work correctly
- Prompt to set deadline when not defined
- Reminder integration prepared for Epic 8
- All validations pass: typecheck, lint, build
