# Story 5.4: Questions de Relance

Status: done

## Story

As a **CHEF**,
I want **the AI to ask me clarifying questions**,
So that **I can complete my document better**.

## Acceptance Criteria

1. [x] AI suggests contextual questions
2. [x] Questions based on missing information
3. [x] Easy answer interface
4. [x] Answers integrated into document
5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: AI Questions Service
  - [x] 1.1 Create `generateFollowUpQuestions` function
  - [x] 1.2 Analyze project for missing/incomplete information
  - [x] 1.3 Generate relevant questions with JSON output

- [x] Task 2: tRPC Endpoint
  - [x] 2.1 Add `getFollowUpQuestions` query to demandChat router
  - [x] 2.2 Input: demandProjectId
  - [x] 2.3 Return list of questions with target sections

- [x] Task 3: UI Components
  - [x] 3.1 Create collapsible questions panel
  - [x] 3.2 Display suggested questions with priority badges
  - [x] 3.3 Show target section for each question
  - [x] 3.4 Refresh questions button

- [x] Task 4: Integration
  - [x] 4.1 Add questions panel to workspace (editing mode)
  - [x] 4.2 Auto-fetch when entering edit mode
  - [x] 4.3 Refresh capability

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**AI Service** (`src/server/services/ai/demand-assistant.ts`):
- Added `FollowUpQuestion` interface with fields: id, question, targetSection, priority, hint
- `generateFollowUpQuestions()` function that:
  - Analyzes project for missing fields (context, description, constraints, budget, date, needType)
  - Detects incomplete fields (too short content)
  - Uses JSON output format for structured questions
  - Returns 3-5 contextual questions with priorities

**tRPC Router** (`src/server/api/routers/demandChat.ts`):
- Added `getFollowUpQuestions` query
- Returns questions array + availability flag
- Graceful error handling (returns empty array on failure)

**UI Components** (`src/components/demands/demand-workspace.tsx`):
- Collapsible questions panel at top of editing form
- Primary-colored card with Lightbulb icon
- Each question displays:
  - Question text
  - Optional hint (💡)
  - Priority badge (Important/Recommandé/Optionnel)
  - Target section indicator
- Refresh button to regenerate questions
- Loading state while fetching

### Question Structure

```typescript
interface FollowUpQuestion {
  id: string;
  question: string;
  targetSection: "context" | "description" | "constraints" | "budget" | "general";
  priority: "high" | "medium" | "low";
  hint?: string;
}
```

### Priority Levels

- **high** (Important): Critical missing information
- **medium** (Recommandé): Helpful additions
- **low** (Optionnel): Nice-to-have details

### User Flow

1. User enters editing mode
2. Questions panel loads automatically
3. AI analyzes document and generates contextual questions
4. Questions displayed with priorities and target sections
5. User reads questions and fills in the corresponding sections
6. User can refresh to get new questions after making changes

### References

- [Source: epics-demande-v1.md#Story 5.4]
- AI Service: `src/server/services/ai/demand-assistant.ts`
- Router: `src/server/api/routers/demandChat.ts`
- Workspace: `src/components/demands/demand-workspace.tsx`
