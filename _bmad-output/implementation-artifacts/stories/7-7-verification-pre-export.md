# Story 7.7: Vérification Pré-Export

Status: done

## Story

As a **CHEF**,
I want **to verify completeness before export**,
So that **I don't send an incomplete dossier**.

## Acceptance Criteria

1. [x] Checklist of required fields
2. [x] Alert if sections are empty or incomplete
3. [x] Ability to force export despite alerts
4. [x] Completeness report in percentage

5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create Completeness Check Utility
  - [x] 1.1 Create `src/lib/utils/completeness.ts`
  - [x] 1.2 Implement `checkCompleteness()` function
    - Check required fields (title, departmentName, contactName, needType)
    - Check recommended fields (reference, contactEmail, budgetRange, etc.)
    - Check sections (word count, empty detection)
    - Generate warnings for incomplete sections
  - [x] 1.3 Implement `getCompletenessSummary()` function
  - [x] 1.4 Implement `getCompletenessColor()` function
  - [x] 1.5 Calculate weighted percentage (50% required, 20% recommended, 30% sections)

- [x] Task 2: Create Pre-Export Dialog Component
  - [x] 2.1 Create `src/components/demands/pre-export-dialog.tsx`
  - [x] 2.2 Display completeness percentage with progress bar
  - [x] 2.3 Show required fields status with icons
  - [x] 2.4 Show recommended fields status with warnings
  - [x] 2.5 Show sections status with word count
  - [x] 2.6 Display warnings list
  - [x] 2.7 Add export buttons (PDF and Word)

- [x] Task 3: Integrate with Demand Workspace
  - [x] 3.1 Import PreExportDialog in demand-workspace.tsx
  - [x] 3.2 Add exportDialogOpen state
  - [x] 3.3 Replace separate export buttons with single "Exporter" button
  - [x] 3.4 Add PreExportDialog component to JSX
  - [x] 3.5 Pass project data and export handlers to dialog

- [x] Task 4: Verification
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Completeness Calculation:**
- Required fields (50% weight): title, departmentName, contactName, needType
- Recommended fields (20% weight): reference, contactEmail, budgetRange, desiredDeliveryDate, description
- Sections (30% weight): Based on word count (0 = empty, <10 = partial, >=10 = complete)

**Visual Indicators:**
- Green (>=80%): Ready for export
- Yellow (50-79%): Exportable with recommendations
- Red (<50%): Missing critical elements

**Field Status Icons:**
- CheckCircle2 (green): Complete
- AlertCircle (red): Required but missing
- AlertTriangle (yellow): Recommended but missing

**Export Behavior:**
- User can always export regardless of completeness
- Dialog shows completeness before export
- PDF is primary action, Word is secondary
- Dialog closes after initiating export

### Files Created/Modified

**New:**
- `src/lib/utils/completeness.ts` - Completeness check utilities
- `src/components/demands/pre-export-dialog.tsx` - Pre-export verification dialog

**Modified:**
- `src/components/demands/demand-workspace.tsx` - Integrated PreExportDialog

### Type Definitions

```typescript
interface CompletenessInput {
  title: string;
  reference?: string | null;
  description?: string | null;
  departmentName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  needType?: string | null;
  urgencyLevel?: string | null;
  budgetRange?: string | null;
  desiredDeliveryDate?: string | null;
  sections?: DemandSection[] | null;
  annexesCount?: number;
}

interface CompletenessResult {
  isComplete: boolean;
  percentage: number;
  requiredFields: FieldCheck[];
  recommendedFields: FieldCheck[];
  sections: SectionCheck[];
  totalChecks: number;
  passedChecks: number;
  warnings: string[];
}
```

### References

- [Source: epics-demande-v1.md#Story 7.7]
- Completeness utility: `src/lib/utils/completeness.ts`
- Pre-export dialog: `src/components/demands/pre-export-dialog.tsx`
