# Story 3.1: Création Nouvelle Demande

Status: done

## Story

As a **CHEF**,
I want **to create a new demand document**,
So that **I can formalize my need for the Administration**.

## Acceptance Criteria

1. ✅ Form with fields: title, department, contact person
2. ✅ Selection of need type (supply, service, works, etc.)
3. ✅ Indication of urgency level (low, medium, high, critical)
4. ✅ Automatic draft save
5. ✅ Redirect to demand workspace after creation
6. ✅ Required fields validation
7. ✅ `pnpm typecheck` passes
8. ✅ `pnpm lint` passes
9. ✅ `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Add needType field to schema and router
  - [x] 1.1 Add `needType` field to `demand_projects` schema
  - [x] 1.2 Add `NEED_TYPES` constant
  - [x] 1.3 Update router input schema
  - [x] 1.4 Run db:push

- [x] Task 2: Enhance creation form in DemandProjectsList
  - [x] 2.1 Add needType select field
  - [x] 2.2 Make required fields properly validated (department, contact)
  - [x] 2.3 Improve form layout and UX
  - [x] 2.4 Add form field descriptions

- [x] Task 3: Verification
  - [x] 3.1 Run `pnpm typecheck`
  - [x] 3.2 Run `pnpm lint`
  - [x] 3.3 Run `pnpm build`

## Dev Notes

### Existing Implementation (from Sprint R1)

The basic creation form already exists in `demand-projects-list.tsx` with:
- Title (required)
- Reference (optional)
- Department name
- Contact name/email
- Urgency level
- Budget range
- Context

### Missing Features

1. **Need Type** - Not yet in schema:
   - `fourniture` (Supply/Equipment)
   - `service` (Service)
   - `travaux` (Construction/Works)
   - `formation` (Training)
   - `logiciel` (Software)
   - `autre` (Other)

2. **Required field enforcement** - Some fields should be required:
   - departmentName
   - contactName
   - contactEmail

### References

- [Source: epics-demande-v1.md#Story 3.1]
- Schema: `src/server/db/schema/demands.ts`
- Component: `src/components/demands/demand-projects-list.tsx`
- Router: `src/server/api/routers/demandProjects.ts`
