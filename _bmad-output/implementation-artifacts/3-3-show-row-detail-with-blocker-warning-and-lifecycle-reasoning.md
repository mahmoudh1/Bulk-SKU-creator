# Story 3.3: Show Row Detail with Blocker, Warning, and Lifecycle Reasoning

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want to open a row and inspect its blockers, warnings, evidence, and lifecycle state,
so that I can understand exactly why it is or is not ready.

## Acceptance Criteria

1. Given the operator selects a row from the batch workspace, when the row detail inspector opens, then it shows the row summary, lifecycle state, readiness state, blockers, warnings, and supporting evidence and these sections are separated clearly for review using the approved diagnostic-console UX pattern.
2. Given a row has one or more issues, when the operator reviews the detail view, then each issue includes a reason and the next useful action and the operator does not need to infer the correction path from vague messaging.
3. Given a row includes source, normalized, readiness, and image evidence, when the operator opens row detail, then the inspector distinguishes source facts, normalized fields, validation results, R2-backed image evidence, and lifecycle history and each section is sourced from persisted server data rather than mock row fixtures.
4. Given the operator closes or leaves the row detail view, when they return to the batch workspace, then the broader batch context is preserved and the row inspection does not feel like a disconnected screen jump.

## Tasks / Subtasks

- [x] Replace mock row inspector data with server-backed row detail (AC: 1, 3)
  - [x] Update `apps/web/src/routes/pages/RowInspector.tsx` to fetch row detail by route `batchId`, `rowId`, and active organization.
  - [x] Remove `@/data/mock`, `prototypeBatchId`, and `prototypeRowId` fallback behavior from this route.
  - [x] Show explicit loading, not-found, and service-error states.
- [x] Add or extend row detail API-client contract (AC: 1, 2, 3)
  - [x] Return source identity, normalized fields, readiness state, lifecycle history, issue list, evidence, and image preview refs.
  - [x] Include issue severity, rule code, human-readable reason, and next action.
  - [x] Keep API DTO names consistent with Story 3.1/3.2 readiness contracts.
- [x] Render diagnostic sections (AC: 1, 2, 3)
  - [x] Source facts and normalized fields.
  - [x] Validation blockers and warnings.
  - [x] R2-backed image evidence using `/api/image-assets/:imageId/preview`.
  - [x] Lifecycle history and row revision context.
- [x] Preserve return context (AC: 4)
  - [x] Link back to `/batches/:id/review` with current query/search context when available.
  - [x] Preserve actual batch and row IDs in navigation.
- [x] Add focused tests (AC: 1, 2, 3, 4)
  - [x] Cover row detail rendering from API data.
  - [x] Cover issue reason and next action visibility.
  - [x] Cover R2 preview refs.
  - [x] Cover no mock fallback for unknown row IDs.

## Dev Notes

- Current `RowInspector.tsx` is fully prototype-driven. This story is the point where the full row inspector becomes a server-backed diagnostic surface.
- Story 3.2 may already provide selected-row preview data; reuse shared DTOs/helpers instead of creating a second row model.
- Keep AI and submission sections clearly labeled as future or unavailable if data is not yet produced by Epic 4/5. Do not fabricate AI or submission history.

### Technical Requirements

- Neon is authoritative for lifecycle, readiness, issue, and revision data.
- R2 remains authoritative for image bytes; row detail should only use server preview endpoints.
- If a row has no image evidence, show a clear empty/evidence-missing state rather than placeholder image boxes.
- Use actual route params. Do not default to any prototype batch or row.

### Architecture Compliance

- Row lifecycle state and transition history must be retrievable and explainable. [Source: `_bmad-output/planning-artifacts/epics.md#FR38`]
- Backend is the source of truth for lifecycle state, readiness state, and audit history. [Source: `_bmad-output/planning-artifacts/architecture.md#Process Patterns`]
- Use route-based row detail screens and query-driven server state. [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]

### UX Requirements

- Row detail should function like a diagnostic console, not a generic edit form. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Journey Patterns`]
- Separate source facts, inferred content, warnings, blockers, editable fields, and next actions. [Source: `_bmad-output/planning-artifacts/epics.md#UX Design Requirements`]
- Use progressive disclosure for dense validation reasoning; do not bury the highest-priority blocker.

### Previous Story Intelligence

- Story 3.1 creates readiness/lifecycle state.
- Story 3.2 creates the batch workspace and selected-row context. This story should align its DTOs and navigation with those outputs.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/src/routes/pages/RowInspector.tsx`
  - `apps/web/src/lib/api-client/batches.ts`
  - `apps/web/server/bulk-sku-api.ts`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Run `npm run test:web`.
- Run `npm run lint:web`.
- Run `npm run build:web`.
- Add route-level tests for `/batches/:id/rows/:rowId`.

### Scope Boundaries

- In scope: server-backed row detail, evidence/reasoning sections, lifecycle display, return context.
- Out of scope: editing/revalidation mutations, AI approval, submission outcome trace.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.3`]
- Current prototype route: [Source: `apps/web/src/routes/pages/RowInspector.tsx`]
- UX row detail guidance: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Row Detail Inspector`]

## Dev Agent Record

### Agent Model Used

SOLO (proprietary)

### Debug Log References

### Completion Notes List

- Added server + client row detail contract with issue severity/reasons/next-actions, R2 preview refs, normalized fields, and lifecycle history.
- Refactored `RowInspector.tsx` into a server-backed diagnostic console (explicit loading/error states, empty evidence states, no prototype fallbacks).
- Preserved return context from triage to row inspector via route state and fallback query propagation.
- Added focused route tests and validated with `npm run test:web`, `npm run lint:web`, and `npm run build:web`.

### File List

- apps/web/server/bulk-sku-api.ts
- apps/web/src/lib/api-client/batches.ts
- apps/web/src/routes/pages/RowInspector.tsx
- apps/web/src/routes/pages/TriageWorkspace.tsx
- apps/web/src/test/row-inspector.test.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/3-3-show-row-detail-with-blocker-warning-and-lifecycle-reasoning.md

## Change Log

- 2026-05-03: Implemented server-backed row inspector with issue reasoning, lifecycle context, evidence sections, and tests.
