# Story 3.2: Build the Batch Triage Workspace and Status-First Review Grid

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want a batch review workspace that surfaces readiness counts, filters, and row states,
so that I can triage the highest-priority work quickly.

## Acceptance Criteria

1. Given a batch contains evaluated rows, when the operator opens the batch review workspace, then they see a status-first triage surface with summary counts, row states, and filtering tools and the interface follows the approved table-first UX direction using server-backed batch data.
2. Given the operator needs to focus on a subset of rows, when they filter or sort the workspace, then the grid responds with the relevant rows and stable status presentation and warnings, blockers, and readiness states remain visually distinct in text and visual treatment.
3. Given a batch contains many rows, when the operator scans the workspace, then the grid remains operationally usable for triage and the highest-leverage blocked or incomplete work is easy to identify.
4. Given the current prototype previously used mock rows, when the triage workspace loads, then it reads rows and counts through the API/query layer from Neon and hardcoded demo batch or row IDs are not used as fallback data.

## Tasks / Subtasks

- [x] Replace mock-driven triage data loading (AC: 1, 4)
  - [x] Update `apps/web/src/routes/pages/TriageWorkspace.tsx` to load the active `batchId` from the route and active organization from `OrganizationProvider`.
  - [x] Fetch readiness rows and summary counts through `apps/web/src/lib/api-client/batches.ts`.
  - [x] Show an explicit not-found/error state for unknown batch IDs instead of falling back to prototype rows.
- [x] Build status-first summary and priority guidance from server data (AC: 1, 3)
  - [x] Derive counts from persisted readiness states.
  - [x] Surface highest-priority blockers from server issue summaries.
  - [x] Keep submission actions gated when rows are not eligible; do not implement submission itself.
- [x] Implement filter and sort behavior (AC: 2, 3)
  - [x] Support at minimum readiness-status filter, blocker/warning filter, search by row ID/SKU/product name, and updated-time or status-priority sort.
  - [x] Represent active filters in stable UI state and prepare for Story 3.8 URL persistence.
  - [x] Preserve text labels for all statuses; do not rely on color alone.
- [x] Keep row selection and side preview server-backed (AC: 1, 4)
  - [x] Use selected readiness row data from the API result.
  - [x] Link to `/batches/:id/rows/:rowId` using actual IDs.
  - [x] Remove `prototypeBatchId`, `prototypeRowId`, and `@/data/mock` dependencies from this route.
- [x] Add focused tests (AC: 1, 2, 3, 4)
  - [x] Cover rendered counts from server/API-client data.
  - [x] Cover filters/sorting changing visible rows.
  - [x] Cover unknown batch ID does not fabricate rows.
  - [x] Cover links preserve actual batch and row IDs.

## Dev Notes

- Story 3.1 should provide the readiness DTO/API surface. This story consumes it and converts the existing visual prototype into real server-backed behavior.
- Current `TriageWorkspace.tsx` imports `rows`, `batches`, `prototypeBatchId`, and `prototypeRowId`; those imports are the primary anti-pattern to remove for this story.
- The current route exists at `/batches/:id/review`. Preserve this route and make it entity-aware instead of creating a new route.

### Technical Requirements

- Use Neon-backed readiness data from the API as the source of truth.
- Keep the frontend dense and operational; do not redesign into a marketing-style or card-heavy dashboard.
- Use existing status chip patterns where possible, but extend them carefully if readiness states no longer match old mock `Readiness` values.
- Use route `id` and active workspace ID for every query. Do not load cross-organization data.
- Avoid adding a broad table library unless necessary. Existing table markup is acceptable if accessible and testable.

### Architecture Compliance

- Use query-driven server state for batches, rows, validations, and outcomes. [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Route-based screens should remain the primary navigation model. [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Statuses, warnings, blockers, and validation results must be presented in text form, not color alone. [Source: `_bmad-output/planning-artifacts/epics.md#NonFunctional Requirements`]

### UX Requirements

- The batch workspace should be a table-first triage surface with summary counts, filtering tools, and a persistent diagnostic side panel or split view. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy`]
- A priority guidance banner should direct users toward the highest-leverage blocked or incomplete work first. [Source: `_bmad-output/planning-artifacts/epics.md#UX Design Requirements`]

### Previous Story Intelligence

- Story 3.1 owns the persisted evaluation contract. This story should not duplicate readiness computation in the browser.
- Story 2.6 introduced handoff from intake to `/batches/:id/review`; this story turns that handoff destination into a real triage workspace.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/src/routes/pages/TriageWorkspace.tsx`
  - `apps/web/src/lib/api-client/batches.ts`
  - `apps/web/src/components/StatusChip.tsx`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Run `npm run test:web`.
- Run `npm run lint:web`.
- Run `npm run build:web`.
- Add tests for server-backed row rendering, filtering, sorting, and no demo fallback.

### Scope Boundaries

- In scope: batch review workspace, status counts, filters/sorts, selected-row preview, route/entity correctness.
- Out of scope: full row detail page rebuild, correction/revalidation mutations, submission creation.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.2`]
- Current prototype route: [Source: `apps/web/src/routes/pages/TriageWorkspace.tsx`]
- UX triage guidance: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Primary Application Pattern`]

## Dev Agent Record

### Agent Model Used

SOLO (proprietary)

### Debug Log References

### Completion Notes List

- Replaced mock-driven triage route data with server-backed readiness evaluation via query layer and active workspace scoping.
- Implemented status-first summary counts, priority guidance, and submission gating based on persisted readiness state.
- Added filter/search/sort controls and stable selection/side preview using readiness rows.
- Extended readiness records to include SKU/product/brand for triage display.
- Added focused triage workspace tests and validated with `npm run test:web`, `npm run lint:web`, and `npm run build:web`.

### File List

- apps/web/server/bulk-sku-api.ts
- apps/web/src/lib/api-client/batches.ts
- apps/web/src/routes/pages/TriageWorkspace.tsx
- apps/web/src/test/triage-workspace.test.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/3-2-build-the-batch-triage-workspace-and-status-first-review-grid.md

## Change Log

- 2026-05-03: Converted triage workspace to server-backed readiness triage (filters/sort/preview + tests).
