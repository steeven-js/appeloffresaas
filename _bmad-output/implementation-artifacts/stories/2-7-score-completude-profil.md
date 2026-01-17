# Story 2.7: Score Complétude Profil

Status: done

## Story

As a **user**,
I want **to see my profile completeness score and suggestions**,
So that **I know what information is missing**.

## Acceptance Criteria

1. Given I am on my company profile page
2. When I view the completeness gauge
3. Then I see a percentage score (0-100%)
4. And I see a list of missing or incomplete sections
5. And clicking a suggestion takes me to that section
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create backend completeness calculation (AC: #3, #4)
  - [x] 1.1 Add `getCompleteness` query to companyProfile router
  - [x] 1.2 Fetch all related data (financial, certifications, team, references)
  - [x] 1.3 Define 8 weighted sections
  - [x] 1.4 Calculate completion per section
  - [x] 1.5 Generate suggestions for incomplete sections
  - [x] 1.6 Return totalScore, sections[], suggestions[]

- [x] Task 2: Create UI components (AC: #2, #3, #4, #5)
  - [x] 2.1 Create `CompletionGauge` SVG circular gauge
  - [x] 2.2 Add color coding (red < 50%, yellow 50-80%, green >= 80%)
  - [x] 2.3 Create `ProfileCompletenessCard` with full breakdown
  - [x] 2.4 Add section checklist with weights
  - [x] 2.5 Add suggestions panel with icons
  - [x] 2.6 Create `ProfileCompletenessCompact` for sidebar/dashboard
  - [x] 2.7 Add link to /profile/company from compact view

- [x] Task 3: Verification (AC: #6, #7, #8)
  - [x] 3.1 Run `pnpm typecheck`
  - [x] 3.2 Run `pnpm lint`
  - [x] 3.3 Run `pnpm build`

## Dev Notes

### Section Weights

| Section | Weight | Completion Criteria |
|---------|--------|---------------------|
| Informations de base | 20% | name + siret present |
| Informations légales | 15% | 3+ of 4 fields (legalForm, capitalSocial, nafCode, creationDate) |
| Adresse | 10% | address + city + postalCode present |
| Contact | 10% | phone OR email present |
| Données financières | 15% | At least 1 year of data |
| Certifications | 10% | At least 1 certification |
| Équipe | 10% | At least 1 team member |
| Références projets | 10% | At least 1 project reference |
| **Total** | **100%** | |

### Color Coding

```typescript
const getScoreColor = () => {
  if (score >= 80) return "text-green-600";  // Excellent
  if (score >= 50) return "text-yellow-600"; // Good
  return "text-red-500";                      // Needs work
};
```

### Components

#### CompletionGauge
- SVG circular progress gauge
- Three sizes: sm (64px), md (96px), lg (128px)
- Animated stroke-dashoffset transition
- Optional label below gauge

#### ProfileCompletenessCard
- Full card with gauge, progress bar, section breakdown, and suggestions
- Used on company profile page

#### ProfileCompletenessCompact
- Small gauge with label, links to /profile/company
- Used in sidebar or dashboard

### Suggestions Logic

Suggestions are generated dynamically based on missing data:
- Up to 5 suggestions shown
- Prioritized by incomplete sections
- French language messages

### API Response

```typescript
{
  totalScore: number;        // 0-100
  sections: ProfileSection[];
  suggestions: string[];     // Max 5
  counts: {
    financialYears: number;
    certifications: number;
    teamMembers: number;
    projectReferences: number;
  };
}
```

### References

- [Source: epics.md#Story 2.7: Score Complétude Profil]
- [FR15: User can view profile completeness score]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/api/routers/companyProfile.ts` | Modified | Added getCompleteness query with 8 weighted sections |
| `src/components/company/profile-completeness.tsx` | Created | CompletionGauge, ProfileCompletenessCard, ProfileCompletenessCompact |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 2 Story 2.7 implementation |
| 2026-01-17 | Implementation verified | All acceptance criteria satisfied |

### Completion Notes

- All acceptance criteria satisfied
- 8-section weighted completeness calculation
- SVG circular gauge with smooth animation
- Color-coded scores (red/yellow/green)
- Section checklist with checkmarks
- Suggestions panel with up to 5 actionable items
- Compact version for sidebar/dashboard use
- Link to profile page from compact view
- All validations pass: typecheck, lint, build
