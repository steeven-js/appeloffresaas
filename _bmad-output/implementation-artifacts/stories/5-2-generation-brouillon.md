# Story 5.2: Génération de Brouillon

Status: done

## Story

As a **CHEF**,
I want **the AI to generate a first draft of a section**,
So that **I can save time on writing**.

## Acceptance Criteria

1. [x] "Generate with AI" button on each section
2. [x] Draft based on already entered information
3. [x] Ability to accept, modify, or reject
4. [x] Clear indication that it's an AI proposal
5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: AI Generation Service
  - [x] 1.1 Create section-specific prompts for each field
  - [x] 1.2 Add `generateSectionDraft` function
  - [x] 1.3 Include project context in generation

- [x] Task 2: tRPC Endpoint
  - [x] 2.1 Add `generateDraft` mutation to demandChat router
  - [x] 2.2 Input: demandProjectId, sectionName
  - [x] 2.3 Return generated content

- [x] Task 3: UI Components
  - [x] 3.1 Add Sparkles button next to section headers
  - [x] 3.2 Create draft preview dialog/modal
  - [x] 3.3 Accept/Reject buttons
  - [x] 3.4 Loading state during generation

- [x] Task 4: Integration
  - [x] 4.1 Add generation to Context section
  - [x] 4.2 Add generation to Description section
  - [x] 4.3 Add generation to Constraints section

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**AI Service** (`src/server/services/ai/demand-assistant.ts`):
- Added `GeneratableSection` type: "context" | "description" | "constraints"
- Created `sectionPrompts` with tailored prompts for each section type
- `generateSectionDraft()` function that:
  - Builds context from all project data
  - Uses section-specific system prompt
  - Returns generated content with token count

**tRPC Router** (`src/server/api/routers/demandChat.ts`):
- Added `generateDraft` mutation
- Input validation with zod enum for section types
- Returns content, section name, and token count
- Error handling with appropriate error codes

**UI Components** (`src/components/demands/demand-workspace.tsx`):
- "Générer avec IA" button on Context, Description, and Constraints sections
- Loading state with spinner when generating
- Draft preview dialog with:
  - Title showing "Brouillon généré par l'IA"
  - Section name display
  - Scrollable content area
  - Warning about AI-generated content
  - "Rejeter" and "Accepter et insérer" buttons
- Accepted draft automatically populates the form field and triggers autosave

### Section Prompts

Each section has tailored generation prompts:

1. **Context**: Explains context, current situation, motivations, objectives
2. **Description**: Details what's needed, specifications, quantities
3. **Constraints**: Lists technical, regulatory, temporal, budgetary constraints

### User Flow

1. User clicks "Générer avec IA" on a section
2. Loading spinner shows while AI generates
3. Dialog opens with generated draft
4. User can:
   - **Reject**: Close dialog, nothing changes
   - **Accept**: Content inserted into form field, autosave triggered
5. User can edit the accepted text as needed

### References

- [Source: epics-demande-v1.md#Story 5.2]
- AI Service: `src/server/services/ai/demand-assistant.ts`
- Router: `src/server/api/routers/demandChat.ts`
- Workspace: `src/components/demands/demand-workspace.tsx`
