# Story 6.1: Éditeur Riche (TipTap)

Status: done

## Story

As a **CHEF**,
I want **a rich text editor**,
So that **I can format my content (bold, lists, headings)**.

## Acceptance Criteria

1. [x] TipTap editor integrated
2. [x] Toolbar with basic formatting
3. [x] Autosave functionality
4. [x] Fullscreen mode
5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Install TipTap
  - [x] 1.1 Install @tiptap/react and @tiptap/starter-kit
  - [x] 1.2 Install extensions: placeholder, underline, text-align, highlight
  - [x] 1.3 Install @radix-ui/react-separator for toolbar

- [x] Task 2: Create RichTextEditor Component
  - [x] 2.1 Create `src/components/ui/rich-text-editor.tsx`
  - [x] 2.2 Configure TipTap with extensions
  - [x] 2.3 Create EditorToolbar component
  - [x] 2.4 Add loading skeleton

- [x] Task 3: Toolbar Features
  - [x] 3.1 Undo/Redo buttons
  - [x] 3.2 Text formatting (bold, italic, underline, strikethrough, highlight)
  - [x] 3.3 Headings (H1, H2, H3)
  - [x] 3.4 Lists (bullet, ordered)
  - [x] 3.5 Blockquote and horizontal rule
  - [x] 3.6 Text alignment (left, center, right, justify)
  - [x] 3.7 Fullscreen toggle

- [x] Task 4: Editor Styling
  - [x] 4.1 Add TipTap CSS to globals.css
  - [x] 4.2 Style placeholder text
  - [x] 4.3 Style headings, lists, blockquotes
  - [x] 4.4 Style code blocks and highlights

- [x] Task 5: Integration
  - [x] 5.1 Replace Context Textarea with RichTextEditor
  - [x] 5.2 Replace Description Textarea with RichTextEditor
  - [x] 5.3 Replace Constraints Textarea with RichTextEditor
  - [x] 5.4 Remove unused reformulation code

- [x] Task 6: Verification
  - [x] 6.1 Run `pnpm typecheck`
  - [x] 6.2 Run `pnpm lint`
  - [x] 6.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Packages Installed:**
- `@tiptap/react` - React bindings for TipTap
- `@tiptap/starter-kit` - Core extensions (bold, italic, lists, etc.)
- `@tiptap/extension-placeholder` - Placeholder text
- `@tiptap/extension-underline` - Underline formatting
- `@tiptap/extension-text-align` - Text alignment
- `@tiptap/extension-highlight` - Text highlighting
- `@tiptap/pm` - ProseMirror dependencies
- `@radix-ui/react-separator` - Toolbar separator

**Component Structure:**
- `RichTextEditor` - Main component with content/onChange props
- `EditorToolbar` - Toolbar with formatting buttons
- `ToolbarButton` - Individual toolbar button component

**Toolbar Layout:**
| Group | Features |
|-------|----------|
| History | Undo, Redo |
| Text Format | Bold, Italic, Underline, Strikethrough, Highlight |
| Headings | H1, H2, H3 |
| Blocks | Bullet List, Ordered List, Blockquote, Horizontal Rule |
| Alignment | Left, Center, Right, Justify |
| View | Fullscreen Toggle |

**Keyboard Shortcuts:**
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+U` - Underline
- `Escape` - Exit fullscreen

**Fullscreen Mode:**
- Fixed position overlay covering entire screen
- Escape key to exit
- Body scroll locked when active

**CSS Styles** (`globals.css`):
- Custom placeholder styling
- Heading sizes (H1: 2xl, H2: xl, H3: lg)
- List styling with proper margins
- Blockquote with left border
- Code block styling
- Highlight with yellow background

### Breaking Changes

The reformulation feature (Story 5.3) was removed from the workspace since the rich text editor allows direct editing. The reformulation API endpoint still exists if needed later.

### File Size Impact

The `/demandes/[id]` page increased from 19.3 kB to 140 kB due to TipTap and ProseMirror dependencies. This is expected for a rich text editor.

### References

- [Source: epics-demande-v1.md#Story 6.1]
- TipTap Docs: https://tiptap.dev/docs
- Editor Component: `src/components/ui/rich-text-editor.tsx`
- Separator Component: `src/components/ui/separator.tsx`
- Workspace: `src/components/demands/demand-workspace.tsx`
