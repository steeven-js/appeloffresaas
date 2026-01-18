# Story 5.3: Reformulation de Texte

Status: done

## Story

As a **CHEF**,
I want **the AI to improve my text**,
So that **I can have a more professional result**.

## Acceptance Criteria

1. [x] Text selection + "Reformulate" button
2. [x] AI proposes an improved version
3. [x] Before/after comparison
4. [x] Accept or keep original
5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: AI Reformulation Service
  - [x] 1.1 Create `reformulateText` function
  - [x] 1.2 Professional tone prompt
  - [x] 1.3 Preserve meaning while improving clarity

- [x] Task 2: tRPC Endpoint
  - [x] 2.1 Add `reformulate` mutation to demandChat router
  - [x] 2.2 Input: text to reformulate
  - [x] 2.3 Return improved text

- [x] Task 3: UI Components
  - [x] 3.1 Add "Reformuler" button next to text areas
  - [x] 3.2 Create comparison dialog (before/after)
  - [x] 3.3 Accept/Keep original buttons
  - [x] 3.4 Loading state during reformulation

- [x] Task 4: Integration
  - [x] 4.1 Add to Context textarea
  - [x] 4.2 Add to Description textarea
  - [x] 4.3 Add to Constraints textarea

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**AI Service** (`src/server/services/ai/demand-assistant.ts`):
- Added `reformulateText()` function
- System prompt focuses on:
  - Improving clarity and structure
  - Using professional vocabulary
  - Correcting grammar and spelling
  - Preserving original meaning
  - Adapting tone for public procurement context
- Uses lower temperature (0.5) for more consistent output

**tRPC Router** (`src/server/api/routers/demandChat.ts`):
- Added `reformulate` mutation
- Input: text (1-10000 characters)
- Returns: original text + reformulated text + token count
- No need for project ownership check (stateless operation)

**UI Components** (`src/components/demands/demand-workspace.tsx`):
- "Reformuler" ghost button appears below each textarea when content exists
- Loading spinner when reformulation is in progress
- Side-by-side comparison dialog:
  - Left column: Original text (muted background)
  - Right column: Reformulated text (primary highlight)
- Footer buttons: "Garder l'original" / "Accepter la reformulation"
- Accepted reformulation triggers autosave

### User Flow

1. User types text in a section (Context, Description, or Constraints)
2. "Reformuler" button appears below the textarea
3. User clicks "Reformuler"
4. Loading spinner shows while AI processes
5. Dialog opens with side-by-side comparison
6. User can:
   - **Keep original**: Close dialog, nothing changes
   - **Accept reformulation**: Text replaced and autosaved

### Design Decisions

- Button only appears when there's text to reformulate
- Side-by-side comparison for easy visual diff
- Ghost button style to not compete with "Générer avec IA"
- Separate from draft generation (reformulation improves existing text)

### References

- [Source: epics-demande-v1.md#Story 5.3]
- AI Service: `src/server/services/ai/demand-assistant.ts`
- Router: `src/server/api/routers/demandChat.ts`
- Workspace: `src/components/demands/demand-workspace.tsx`
