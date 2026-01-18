# Story 3.3: Budget et Délais

Status: done

## Story

As a **CHEF**,
I want **to indicate the estimated budget and desired deadlines**,
So that **the Administration can calibrate the tender accordingly**.

## Acceptance Criteria

1. ✅ Budget field (amount or range)
2. ✅ Desired delivery date (datepicker)
3. ✅ Justification field if deadline is urgent
4. ✅ Indication if budget is already validated or pending validation
5. ✅ Dedicated "Budget & Délais" section in workspace
6. ✅ `pnpm typecheck` passes
7. ✅ `pnpm lint` passes
8. ✅ `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Add missing fields to schema
  - [x] 1.1 Add `urgencyJustification` field (text)
  - [x] 1.2 Add `budgetValidated` field (integer 0/1)
  - [x] 1.3 Update router input schema
  - [x] 1.4 Run db:push

- [x] Task 2: Update workspace with Budget & Délais section
  - [x] 2.1 Add date picker for desiredDeliveryDate
  - [x] 2.2 Add urgency justification field (shown when urgent)
  - [x] 2.3 Add budget validated toggle (checkbox)
  - [x] 2.4 Add estimated amount field
  - [x] 2.5 Improve read-only view for this section

- [x] Task 3: Verification
  - [x] 3.1 Run `pnpm typecheck`
  - [x] 3.2 Run `pnpm lint`
  - [x] 3.3 Run `pnpm build`

## Dev Notes

### Existing Fields

- `budgetRange` (varchar) - Fourchette budgétaire
- `desiredDeliveryDate` (date) - Date de livraison souhaitée
- `estimatedAmount` (integer) - Montant estimé (legacy, can reuse)

### Fields to Add

- `urgencyJustification` (text) - Justification si délai urgent
- `budgetValidated` (boolean) - Budget déjà validé ?

### References

- [Source: epics-demande-v1.md#Story 3.3]
- Schema: `src/server/db/schema/demands.ts`
- Component: `src/components/demands/demand-workspace.tsx`
- Router: `src/server/api/routers/demandProjects.ts`
