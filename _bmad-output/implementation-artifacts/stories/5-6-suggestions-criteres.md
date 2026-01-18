# Story 5.6: Suggestions de Critères

Status: done

## Story

As a **CHEF**,
I want **the AI to suggest selection criteria**,
So that **it helps the Administration define the tender**.

## Acceptance Criteria

1. [x] "Suggested Criteria" section in the dossier
2. [x] AI proposes criteria based on need type
3. [x] Suggested weightings
4. [x] CHEF can modify/add/delete criteria
5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify DB Schema
  - [x] 1.1 Confirm suggestedCriteria field exists (jsonb)
  - [x] 1.2 Confirm SuggestedCriteria interface defined

- [x] Task 2: AI Criteria Generation
  - [x] 2.1 Create `SuggestedCriterion` interface
  - [x] 2.2 Create `generateSuggestedCriteria()` function
  - [x] 2.3 Generate 5-8 criteria based on project type
  - [x] 2.4 Include weight suggestions totaling 100%
  - [x] 2.5 Include recommendations

- [x] Task 3: tRPC Endpoints
  - [x] 3.1 Add `generateCriteria` mutation
  - [x] 3.2 Add `saveCriteria` mutation
  - [x] 3.3 Convert criteria to storage format

- [x] Task 4: UI Components
  - [x] 4.1 Add criteria section in editing form
  - [x] 4.2 "Suggérer des critères" button with AI
  - [x] 4.3 Total weight indicator with color coding
  - [x] 4.4 Recommendations display
  - [x] 4.5 Collapsible criteria list
  - [x] 4.6 CriterionCard component with inline editing
  - [x] 4.7 Add/Delete criteria functionality
  - [x] 4.8 Save criteria button

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**AI Service** (`src/server/services/ai/demand-assistant.ts`):
- Added `SuggestedCriterion` interface with id, name, description, weight, category
- Added `SuggestedCriteriaResponse` interface with criteria array, totalWeight, recommendations
- `generateSuggestedCriteria()` function:
  - Uses gpt-4o-mini with JSON response format
  - Considers project type, description, context, constraints, budget
  - Generates 5-8 criteria with proper weights
  - Returns recommendations for the Administration

**tRPC Router** (`src/server/api/routers/demandChat.ts`):
- `generateCriteria` mutation: generates AI criteria suggestions
- `saveCriteria` mutation: saves criteria to project's suggestedCriteria field
- Converts structured criteria to DB storage format (categorized string arrays)

**UI Components** (`src/components/demands/demand-workspace.tsx`):
- New "Critères de Sélection Suggérés" section (Section 6)
- State management for criteria, recommendations, expanded state
- Total weight indicator with color coding:
  - Green: exactly 100%
  - Yellow: under 100%
  - Red: over 100%
- Collapsible criteria list
- `CriterionCard` helper component with:
  - Inline editable name and description
  - Weight input (0-100)
  - Category dropdown (Technique, Qualité, Prix, Autre)
  - Delete button
- Add criterion button
- Save and regenerate buttons

### Criteria Categories

| Category | Label | Color |
|----------|-------|-------|
| technical | Technique | Blue |
| quality | Qualité | Green |
| price | Prix | Yellow |
| other | Autre | Gray |

### Criteria Structure

```typescript
interface SuggestedCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100
  category: "technical" | "quality" | "price" | "other";
}
```

### Storage Format

Criteria are stored in the `suggestedCriteria` jsonb field:
```typescript
{
  technicalCriteria: ["Criterion (30%): Description", ...],
  qualityCriteria: [...],
  priceCriteria: [...],
  otherCriteria: [...]
}
```

### User Flow

1. User clicks "Suggérer des critères" button
2. AI analyzes project and generates 5-8 criteria
3. Criteria displayed with weights and categories
4. User can:
   - Edit criterion name, description, weight
   - Change criterion category
   - Delete criteria
   - Add new criteria
5. User clicks "Enregistrer" to save
6. Criteria stored in project for Administration reference

### References

- [Source: epics-demande-v1.md#Story 5.6]
- AI Service: `src/server/services/ai/demand-assistant.ts`
- Router: `src/server/api/routers/demandChat.ts`
- Workspace: `src/components/demands/demand-workspace.tsx`
