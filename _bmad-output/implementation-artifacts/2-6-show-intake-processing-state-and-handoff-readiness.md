# Story 2.6: Show Intake Processing State and Handoff Readiness

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want clear intake progress and handoff status after upload and mapping,
so that I know when the batch is ready to move into readiness evaluation.

## Acceptance Criteria

1. Given a batch is undergoing intake processing, when the operator views the batch, then the UI shows explicit async state such as queued, processing, needs correction, or ready for next stage and does not collapse these states into a vague generic loading indicator.
2. Given the intake process has completed successfully, when the operator returns to the batch workspace, then the batch is shown as ready for readiness evaluation and the system preserves batch context for the next workflow step.
3. Given intake completed with recoverable issues, when the operator reviews the outcome, then the UI highlights what blocks handoff and shows the next useful correction action rather than forcing trial-and-error.

## Tasks / Subtasks

- [x] Add canonical intake processing states to batch/intake models (AC: 1)
  - [x] Represent queued, processing, needs correction, ready for readiness evaluation, failed, and retrying/reprocessing states.
  - [x] Keep intake state distinct from later readiness, validation, enrichment, submission, and failure states.
- [x] Show batch-level handoff readiness (AC: 1, 2)
  - [x] Add summary/status UI on the batch workspace or intake mapping page.
  - [x] Provide a clear action to continue to readiness evaluation only when intake is ready.
  - [x] Preserve route/batch context through the handoff.
- [x] Show blocked handoff and next correction action (AC: 3)
  - [x] Summarize blockers by issue type and affected row count.
  - [x] Link directly to the correction/reprocess flow from Story 2.5.
  - [x] Keep partially recoverable states legible.
- [x] Add tests for state and handoff behavior (AC: 1, 2, 3)
  - [x] Cover queued/processing/needs-correction/ready states, enabled/disabled handoff actions, and preserved batch context.

## Dev Notes

- This story closes Epic 2 by making intake state and readiness-evaluation handoff explicit. It should not implement Epic 3 readiness classification itself; it only establishes that intake is ready for that next stage. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.6`]
- Current routes already support `/batches/:id/mapping` and `/batches/:id/review`. Use those existing route concepts, but make the state transition honest and visible. [Source: `apps/web/src/app/routes/route-config.tsx`]

### Technical Requirements

- Intake state should be server-truth oriented and pollable/query-refreshable. Do not use local-only timers as the canonical processing result.
- Keep status names explicit and consistent across UI, mocks, and API-client DTOs. Suggested intake states: `INTAKE_QUEUED`, `INTAKE_PROCESSING`, `INTAKE_NEEDS_CORRECTION`, `INTAKE_READY`, `INTAKE_FAILED`, `INTAKE_REPROCESSING`.
- Handoff to readiness evaluation should require no unresolved intake blockers. Recoverable issues should point back to correction/reprocess, not allow blind continuation.
- Preserve batch context when moving between intake review, correction, and readiness evaluation. [Source: `_bmad-output/planning-artifacts/prd.md#Performance`, `_bmad-output/planning-artifacts/ux-design-specification.md#Journey Patterns`]

### Frontend Prototype Gap Guardrails

- The prototype is documented as visually complete but behaviorally low, with no real request lifecycle management or server-backed loading states. Intake handoff status must be query/API-backed or represented through explicit typed seams, not a generic loading indicator or local-only demo state. [Source: `listing-workbench/docs/frontend-implementation-status.md#Data and API Layer`, `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]
- Hardcoded demo routes and IDs are a known high-severity issue. Handoff from mapping to review must preserve the actual batch ID and should not rely on `prototypeBatchId` as final behavior. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]
- The docs call out missing URL-driven state and entity-aware shell context. Intake readiness should preserve batch context across navigation and refresh. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Medium Gaps`, `listing-workbench/docs/frontend-implementation-status.md#State and Context`]
- Clean touched mojibake/encoding-corrupted UI strings in status and handoff copy. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]

### Architecture Compliance

- Long-running intake operations should use accepted/pending semantics and status polling or query refresh. Realtime transport is intentionally flexible, so do not hard-code a websocket requirement. [Source: `_bmad-output/planning-artifacts/architecture.md#Gap Analysis Results`]
- Use TanStack Query for server-state polling/invalidation where practical. Query keys should remain batch scoped. [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`; TanStack Query docs: https://tanstack.com/query/latest/docs/react/guides/query-keys]
- React Router paths should continue coupling batch IDs to route state. React Router v6 route docs support dynamic path segments like the existing `/batches/:id/...` routes. [Source: https://reactrouter.com/docs/en/en/v6/route/route]

### UX Requirements

- Never collapse async states into "Loading..." for workflow-critical operations. UX guidance explicitly distinguishes queued, processing, waiting on external service, and retrying. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Empty Loading and Processing States`]
- Use a batch status summary bar style for handoff readiness: counts, scope, and processing indicators should be immediately scannable. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Batch Status Summary Bar`]
- When blocked, show what blocks handoff and the next useful correction action.

### Previous Story Intelligence

- Story 2.5 owns correction and reprocessing. This story should summarize those states and route users back to that flow when handoff is blocked.
- Stories 2.2-2.4 establish source file, row identity, field mapping, normalized rows, and resolved image references. Handoff readiness must account for all of them.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/src/routes/pages/IntakeMapping.tsx`
  - `apps/web/src/routes/pages/TriageWorkspace.tsx`
  - `apps/web/src/routes/pages/BatchesList.tsx`
  - `apps/web/src/components/StatusChip.tsx`
  - `apps/web/src/lib/mocks/prototype-data.ts`
  - `apps/web/src/lib/api-client/batches.ts`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Test each intake state has explicit visible text and is not represented only by color/spinner.
- Test ready state enables handoff to the next workflow while needs-correction blocks it.
- Test route context preserves `batchId` across mapping/review navigation.
- Run `npm run test:web` and `npm run lint:web`.

### Scope Boundaries

- In scope: intake status model, visible processing/handoff UI, correction routing, readiness-handoff affordance.
- Out of scope: Epic 3 readiness classification, validation engine, row lifecycle beyond intake-ready handoff.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.6`]
- PRD async/performance requirements: [Source: `_bmad-output/planning-artifacts/prd.md#Performance`]
- Architecture async/query patterns: [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`, `_bmad-output/planning-artifacts/architecture.md#Process Patterns`]
- UX processing-state guidance: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Empty Loading and Processing States`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- `npm run test:web -- intake-handoff-readiness.test.tsx` initially failed because the mapping page had no `Intake handoff status` region; this confirmed the red state for Story 2.6.
- Added canonical intake status and handoff DTO fields in the batch API client mock, including ready, queued, processing, reprocessing, failed, and needs-correction responses.
- Added the mapping-page handoff status region with blocker summaries, correction routing, and gated readiness handoff.
- Fixed a TypeScript inference error in the failed-state blocker fallback by returning `BatchIntakeReviewDto["handoff"]` explicitly.
- Validation passed: `npm run test:web -- intake-handoff-readiness.test.tsx`, `npm run test:web`, `npm run lint:web`, `npm run build:web`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Intake state is now explicit in the typed batch review contract and remains separate from later readiness/review workflow states.
- The intake mapping workspace now shows batch-level handoff status, blocker counts by issue type, and a correction action that preserves `batchId` and row context.
- Readiness handoff is enabled only for `INTAKE_READY` and routes to `/batches/:id/review`; blocked states stay on the intake mapping workflow.
- Focused coverage was added for queued, processing, reprocessing, failed, needs-correction, and ready handoff behavior.

### File List

- apps/web/src/features/batches/IntakeImageResolutionReview.tsx
- apps/web/src/lib/api-client/batches.ts
- apps/web/src/test/intake-handoff-readiness.test.tsx
- apps/web/tsconfig.app.tsbuildinfo
- _bmad-output/implementation-artifacts/2-6-show-intake-processing-state-and-handoff-readiness.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-03: Implemented intake handoff readiness states, blocker summary/correction routing, readiness handoff gating, and focused handoff tests.
