# Story 2.14: Recherche Documents

Status: done

## Story

As a **user**,
I want **to search documents in my vault by name and category**,
So that **I can quickly find what I need**.

## Acceptance Criteria

1. Given I have multiple documents in my vault
2. When I type in the search box
3. Then documents matching the name are displayed
4. And I can combine search with category filter
5. And results update as I type (debounced)
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Add search state management (AC: #2, #5)
  - [x] 1.1 Add searchQuery state for input value
  - [x] 1.2 Add debouncedSearch state for filtered value
  - [x] 1.3 Add useEffect for 300ms debounce

- [x] Task 2: Add search UI (AC: #2)
  - [x] 2.1 Import Search icon from lucide-react
  - [x] 2.2 Add search input with icon
  - [x] 2.3 Add results counter when searching

- [x] Task 3: Implement search filtering (AC: #3, #4)
  - [x] 3.1 Filter by originalName (case-insensitive)
  - [x] 3.2 Combine with category filter using useMemo
  - [x] 3.3 Show "no results" state when search has no matches

- [x] Task 4: UX improvements (AC: #3)
  - [x] 4.1 "Clear search" button when no results
  - [x] 4.2 Search results count indicator
  - [x] 4.3 Combined message for search + category filter

- [x] Task 5: Verification (AC: #6, #7, #8)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Search Implementation

The search is implemented client-side for instant feedback:

```typescript
const [searchQuery, setSearchQuery] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

// Debounce search query (300ms delay)
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```

### Filtering Logic

Uses useMemo to combine category and search filters:

```typescript
const documents = useMemo(() => {
  const allDocuments = data?.documents ?? [];
  let filtered = allDocuments;

  // Filter by "uncategorized" if selected
  if (selectedCategory === "uncategorized") {
    filtered = filtered.filter((doc) => !doc.category);
  }

  // Filter by search query (case-insensitive)
  if (debouncedSearch.trim()) {
    const searchLower = debouncedSearch.toLowerCase().trim();
    filtered = filtered.filter((doc) =>
      doc.originalName.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}, [data?.documents, selectedCategory, debouncedSearch]);
```

### React Hooks Order

The useMemo hooks must be called before any early returns (like `if (isLoading) return ...`) to comply with React Hooks rules. This was a key fix during implementation.

### Search UX Features

1. **Debounced input**: 300ms delay prevents excessive re-renders
2. **Results counter**: Shows "X résultat(s) pour [query]"
3. **Combined filters**: Shows category context in results message
4. **Clear button**: Appears when no results found

### References

- [Source: epics.md#Story 2.14: Recherche Documents]
- [FR20: Document search functionality]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/documents/document-vault.tsx` | Modified | Added search input, debounce, filtering |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 2 Story 2.14 - Document search |
| 2026-01-17 | Fixed React Hooks order | Moved useMemo before early return |

### Completion Notes

- All acceptance criteria satisfied
- Search input with Search icon
- 300ms debounce for performance
- Case-insensitive search on document name
- Combines with category filter
- Results counter and "no results" state
- All validations pass: typecheck, lint, build
