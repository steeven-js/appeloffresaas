# Story 5.1: Interface Chat Conversationnelle

Status: done

## Story

As a **CHEF**,
I want **to interact with an AI assistant via chat**,
So that **I can be guided in writing my demand document**.

## Acceptance Criteria

1. [x] Chat interface in the workspace
2. [x] Persistent message history
3. [x] AI asks questions to understand the need
4. [x] Responses saved to corresponding fields
5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Database Schema
  - [x] 1.1 Create `demand_chat_messages` table
  - [x] 1.2 Fields: id, demandProjectId, role, content, metadata, createdAt

- [x] Task 2: tRPC Router
  - [x] 2.1 Create `demandChat` router
  - [x] 2.2 `getMessages` - list messages for a demand
  - [x] 2.3 `sendMessage` - send user message and get AI response
  - [x] 2.4 `clearHistory` - clear chat history

- [x] Task 3: AI Service
  - [x] 3.1 Create demand assistant prompt
  - [x] 3.2 Integrate with OpenAI API (gpt-4o-mini)
  - [x] 3.3 Context-aware responses based on demand data

- [x] Task 4: UI Components
  - [x] 4.1 Create ChatPanel component (`demand-chat-panel.tsx`)
  - [x] 4.2 Message list with user/assistant styling
  - [x] 4.3 Input field with send button
  - [x] 4.4 Loading state during AI response
  - [x] 4.5 Scroll to bottom on new messages

- [x] Task 5: Integration
  - [x] 5.1 Add chat panel to demand workspace
  - [x] 5.2 Toggle chat visibility (floating button)
  - [x] 5.3 Persist chat state across sessions

- [x] Task 6: Verification
  - [x] 6.1 Run `pnpm typecheck`
  - [x] 6.2 Run `pnpm lint`
  - [x] 6.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Database Schema** (`src/server/db/schema/demands.ts`):
- Added `demandChatMessages` table with CASCADE delete on demand project
- Fields: id, demandProjectId, role (user/assistant/system), content, metadata (JSON)
- Metadata stores tokenCount and model for analytics

**AI Service** (`src/server/services/ai/demand-assistant.ts`):
- Uses OpenAI gpt-4o-mini model
- System prompt includes demand project context (title, description, budget, etc.)
- Generates personalized greeting based on project completeness
- Context-aware responses to guide user through document completion

**tRPC Router** (`src/server/api/routers/demandChat.ts`):
- `getMessages`: Returns all chat messages for a demand project
- `sendMessage`: Saves user message, calls AI, saves response
- `clearHistory`: Deletes all messages for a demand project
- `isAvailable`: Checks if OpenAI is configured
- `getGreeting`: Returns context-aware greeting message

**UI Components** (`src/components/demands/demand-chat-panel.tsx`):
- Collapsible chat panel on the right side of workspace
- Message list with user/assistant message bubbles
- Input textarea with Ctrl+Enter to send
- Clear history button with confirmation dialog
- Loading states and error handling

**Workspace Integration** (`src/components/demands/demand-workspace.tsx`):
- Floating sparkle button to open chat
- Slide-in panel from right side
- Panel can be closed with button or clicking outside

### Technical Decisions

- Used gpt-4o-mini for cost efficiency while maintaining quality
- Messages stored in database for full persistence
- System prompt includes truncated project data to stay within context limits
- Chat panel is fixed positioned for consistent UX across scroll positions

### References

- [Source: epics-demande-v1.md#Story 5.1]
- Schema: `src/server/db/schema/demands.ts`
- Router: `src/server/api/routers/demandChat.ts`
- AI Service: `src/server/services/ai/demand-assistant.ts`
- UI: `src/components/demands/demand-chat-panel.tsx`
- Workspace: `src/components/demands/demand-workspace.tsx`
