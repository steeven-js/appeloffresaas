# Story 6.2: Templates par Secteur

Status: done

## Story

As a **CHEF**,
I want **sector-specific templates with pre-defined sections**,
So that **I can start writing my demand with an appropriate structure**.

## Acceptance Criteria

1. [x] Template selection at demand creation
2. [x] Templates: IT/Logiciel, BTP, Services, Formation, Fournitures, Maintenance
3. [x] Generic template as default
4. [x] Pre-defined sections based on template
5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create Template Definitions
  - [x] 1.1 Create `src/lib/demand-templates.ts`
  - [x] 1.2 Define DemandTemplate interface
  - [x] 1.3 Create templates for each sector:
    - Générique (default)
    - IT/Logiciel
    - BTP/Travaux
    - Prestation de service
    - Formation
    - Fourniture/Équipement
    - Maintenance/Support

- [x] Task 2: Template Selection UI
  - [x] 2.1 Add template selector step in ProjectFormDialog
  - [x] 2.2 Display template cards with icons and descriptions
  - [x] 2.3 Highlight selected template
  - [x] 2.4 Add "Continue" button to proceed to form
  - [x] 2.5 Add "Back to templates" button from form view

- [x] Task 3: Apply Template Content
  - [x] 3.1 Pre-fill needType based on template selection
  - [x] 3.2 Apply template context, description, and constraints on creation
  - [x] 3.3 Template content uses HTML for rich text formatting

- [x] Task 4: Verification
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Template Structure:**
Each template contains:
- `id`: Unique identifier
- `name`: Display name
- `description`: Short description shown in selector
- `needType`: Maps to the demand's need type
- `icon`: Lucide icon name
- `context`: Pre-defined context section (HTML)
- `descriptionContent`: Pre-defined description section (HTML)
- `constraints`: Pre-defined constraints section (HTML)

**Available Templates:**
| Template | Need Type | Sections Focus |
|----------|-----------|----------------|
| Générique | autre | Basic structure for any demand |
| IT/Logiciel | logiciel | Software specs, integrations, security |
| BTP/Travaux | travaux | Site, lots, safety, regulations |
| Service | service | Mission phases, profiles, governance |
| Formation | formation | Modules, pedagogy, certification |
| Fourniture | fourniture | Specs, delivery, installation |
| Maintenance | maintenance | SLA, preventive/corrective, reporting |

**UI Flow:**
1. User clicks "Nouveau dossier"
2. Template selection dialog opens
3. User selects a template (required)
4. User clicks "Continue"
5. Form view opens with needType pre-filled
6. On submit, template content is applied to context, description, constraints

**Template Content Format:**
- HTML content compatible with TipTap editor
- Uses `<h2>`, `<h3>` for section headers
- Uses `<ul>`, `<li>` for lists
- Uses `<p>` for paragraphs
- Placeholder text in brackets: `[À compléter]`

### Files Modified

- `src/lib/demand-templates.ts` - New file with template definitions
- `src/components/demands/demand-projects-list.tsx` - Added template selection UI

### References

- [Source: epics-demande-v1.md#Story 6.2]
- Template definitions: `src/lib/demand-templates.ts`
- Creation dialog: `src/components/demands/demand-projects-list.tsx`
