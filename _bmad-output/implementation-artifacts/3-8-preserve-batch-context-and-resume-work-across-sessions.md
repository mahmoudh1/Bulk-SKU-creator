# Story 3.8: Preserve Batch Context and Resume Work Across Sessions

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want filters, selections, and row context preserved while I move through review,
so that triage work remains efficient across long sessions and return visits.

## Acceptance Criteria

1. Given the operator is reviewing a filtered or sorted batch, when they open and close row details or navigate within the review workflow, then the batch context such as filters, sort order, selected subset, and row focus is preserved and the operator can continue triage without re-establishing context manually.
2. Given the operator leaves a previously created batch and returns later, when they resume work, then the system restores the batch as an active ongoing workflow and the operator can continue from a meaningful recent review context stored or recoverable from server-backed state.
3. Given the product is used in long-running operational sessions, when context preservation behavior is exercised repeatedly, then it remains stable and predictable and does not conflict with the authoritative server-side workflow state.
4. Given the current frontend gap analysis calls out incomplete URL-driven state and entity-aware shell context, when Epic 3 review screens are implemented, then filters, selected row, correction focus, and batch identity are represented in stable URL or persisted view state and refreshes, deep links, and back navigation preserve the intended review context.

## Tasks / Subtasks

- [x] Define review context state shape (AC: 1, 2, 3, 4)
  - [x] Include batch ID, active filters, sort order, selected row, focused issue/correction, and last viewed timestamp.
  - [x] Decide what belongs in URL query params versus persisted server-backed/user-scoped state.
- [x] Add URL-driven state to triage workspace (AC: 1, 4)
  - [x] Keep filters, sort, selected row, and search represented in stable URL params where practical.
  - [x] Preserve state when linking from grid to row detail and back.
  - [x] Ensure deep links work after refresh.
- [x] Persist resumable context where needed (AC: 2, 3)
  - [x] Add a minimal Neon-backed or server API path for recent batch/review context if URL state alone is not enough.
  - [x] Keep persisted context subordinate to authoritative row/readiness state.
- [x] Integrate context with row correction/revalidation surfaces (AC: 1, 3, 4)
  - [x] Preserve correction focus after failed revalidation.
  - [x] Preserve selected row after successful revalidation unless the row no longer matches current filters, in which case show clear feedback.
- [x] Add focused tests (AC: 1, 2, 3, 4)
  - [x] Filters/sort survive row-detail navigation.
  - [x] Selected row survives refresh/deep link.
  - [x] Unknown/stale context degrades safely.
  - [x] Server state remains authoritative after row changes.

## Dev Notes

- The frontend gap analysis specifically calls out missing URL-driven table state, entity selection persistence, and entity-aware shell context. This story closes that Epic 3 loop.
- Avoid putting large row data into query params. Store identifiers and view state only.
- Do not let persisted UI context override changed row readiness state after correction/revalidation.

### Technical Requirements

- URL params should be stable, readable, and resilient to unknown values.
- Persisted review context must be tenant/user scoped if stored server-side.
- Back navigation should return to the same batch and review state where possible.
- Refresh/deep link must not trigger mock fallback or hidden demo data.
- Keep state management simple; do not add a global state library unless existing patterns cannot support the workflow.

### Architecture Compliance

- Preserve user context during review workflows so operators can move between batch and row detail without losing work state. [Source: `_bmad-output/planning-artifacts/epics.md#NFR5`]
- Use route-based screens and query-driven server state. [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Backend remains source of truth for workflow state; UI context must not overwrite authoritative row state. [Source: `_bmad-output/planning-artifacts/architecture.md#Process Patterns`]

### UX Requirements

- Preserve batch context across navigation by retaining filters, sort state, scroll position, selected subset, and row focus. [Source: `_bmad-output/planning-artifacts/epics.md#UX Design Requirements`]
- Opening row detail should not feel like leaving the batch unless deep investigation requires a route change. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Interaction Patterns`]

### Previous Story Intelligence

- Stories 3.2 and 3.3 introduce the triage grid and row detail. Stories 3.6 and 3.7 introduce correction/revalidation state. This story ties those flows together through stable context preservation.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/src/routes/pages/TriageWorkspace.tsx`
  - `apps/web/src/routes/pages/RowInspector.tsx`
  - `apps/web/src/app/layouts/AppShellLayout.tsx`
  - `apps/web/src/lib/api-client/batches.ts`
  - `apps/web/server/bulk-sku-api.ts` if server persistence is needed
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Run `npm run test:web`.
- Run `npm run lint:web`.
- Run `npm run build:web`.
- Add navigation/state tests using `MemoryRouter` and route query params.

### Scope Boundaries

- In scope: Epic 3 review context preservation and resume behavior.
- Out of scope: saved view management, cross-batch analytics, support investigation histories.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.8`]
- Frontend state gaps: [Source: `listing-workbench/docs/frontend-gap-analysis.md#Medium Gaps`]
- UX context preservation: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Journey Patterns`]

## Dev Agent Record

### Agent Model Used

SOLO (proprietary)

### Debug Log References

### Completion Notes List

- Added URL-driven triage context (q/readiness/issues/sort/row) and ensured navigation between triage and row detail preserves context.
- Added resumable server-backed review context keyed by org+user+batch, with localStorage fallback in test mode, restoring context on return visits.
- Added safe degradation for hidden selections and confirmed server state remains authoritative for readiness while UI context persists.
- Added focused navigation + resume tests; validated with `npm run test:web`, `npm run lint:web`, and `npm run build:web`.

### File List

- apps/web/src/routes/pages/TriageWorkspace.tsx
- apps/web/src/lib/api-client/batches.ts
- apps/web/src/test/triage-workspace.test.tsx
- apps/web/server/bulk-sku-api.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/3-8-preserve-batch-context-and-resume-work-across-sessions.md

## Change Log

- 2026-05-04: Added URL + persisted review context to preserve triage state across navigation and sessions.
