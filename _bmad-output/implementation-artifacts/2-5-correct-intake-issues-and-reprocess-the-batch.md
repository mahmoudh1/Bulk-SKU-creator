# Story 2.5: Correct Intake Issues and Reprocess the Batch

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want to correct mapping or image-reference issues and reprocess the batch,
so that I can recover intake problems without recreating the entire workload from scratch.

## Acceptance Criteria

1. Given a batch contains fixable intake issues, when the operator updates the relevant mapping or reference inputs and requests reprocessing, then the system starts a new intake processing attempt for the existing batch and preserves traceability to the original uploaded batch and row identities.
2. Given the operator reprocesses a batch after corrections, when processing completes, then corrected rows reflect the updated interpretation and resolved references and unaffected rows are not lost or duplicated by the reprocessing flow.
3. Given reprocessing fails for specific rows, when the new intake attempt finishes, then the operator can see which rows still have issues and the batch remains recoverable for further correction rather than becoming unusable.

## Tasks / Subtasks

- [x] Add correction inputs for fixable intake issues (AC: 1)
  - [x] Allow correction of field mappings and image ID references surfaced by Story 2.4.
  - [x] Preserve original source values alongside corrected values for traceability.
  - [x] Distinguish fixable issues from non-fixable/system failures.
- [x] Add reprocess action and attempt state (AC: 1, 2)
  - [x] Start a new intake processing attempt for the existing batch.
  - [x] Show queued/processing/completed/failed states for the attempt.
  - [x] Keep unaffected rows stable and prevent duplicate row creation in the model.
- [x] Display post-reprocess outcomes (AC: 2, 3)
  - [x] Show corrected rows, remaining issue rows, and unchanged rows clearly.
  - [x] Keep the batch recoverable after partial failures.
  - [x] Provide next correction action for remaining issues.
- [x] Add tests for correction/reprocess behavior (AC: 1, 2, 3)
  - [x] Cover reprocessing existing batch, preserving row identity, unaffected row stability, and row-level failure display.

## Dev Notes

- This story is about recovery from intake problems, not validation or submission retries. Keep the attempt vocabulary focused on intake processing. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.5`]
- Current `IntakeMapping.tsx` has an "Edit all" affordance but no correction state or reprocess attempt model. This story should turn that affordance into a defined recovery path. [Source: `apps/web/src/routes/pages/IntakeMapping.tsx`]

### Technical Requirements

- Reprocessing must preserve the original batch and source row identities. Corrections should create a new row revision or processing revision/attempt boundary rather than overwriting history without trace. [Source: `_bmad-output/planning-artifacts/prd.md#Retry Idempotency & Versioning`]
- Row-level failures should be isolated. One row's unresolved image or invalid mapping must not invalidate unrelated rows. [Source: `_bmad-output/planning-artifacts/prd.md#Reliability`]
- Use explicit processing attempt fields such as `attemptId`, `attemptNumber`, `startedAt`, `completedAt`, `status`, `correlationId`, and row-level issue summaries where useful.
- Retry/reprocess work should be idempotent. Official BullMQ guidance emphasizes designing jobs so retries do not change the final state incorrectly; carry that expectation into the future worker contract. [Source: https://docs.bullmq.io/patterns/idempotent-jobs]

### Frontend Prototype Gap Guardrails

- The status docs identify real editing, revalidation, mutation state, and persistence as missing. This story must implement correction and reprocess flows as real mutation-state behavior or typed API seams, not inert buttons. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`, `listing-workbench/docs/frontend-implementation-status.md#Core Workflow Behavior`]
- Failure recovery is documented as mock-only. Shared recovery components are acceptable, but do not rely on the existing failure screens as if they already provide real failed-row data or retry execution. [Source: `listing-workbench/docs/frontend-implementation-status.md#Failure Recovery`]
- Avoid hardcoded demo batch or row IDs in correction/reprocess links and actions. Use route params plus returned contract IDs. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]
- Clean touched mojibake/encoding-corrupted UI strings while wiring correction/reprocess UI. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]

### Architecture Compliance

- Long-running reprocessing should return accepted/pending semantics and be completed asynchronously in the future API/worker architecture. [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`]
- Future worker implementation should use single-responsibility job names and payloads with tenant context, batch/row identity, revision identity, and correlation metadata. [Source: `_bmad-output/planning-artifacts/architecture.md#Communication Patterns`]
- Frontend should show server truth from query/mutation state and invalidate batch/intake queries after reprocess completion.

### UX Requirements

- Users should never have to recreate an entire workload for fixable intake issues. The UI should make recovery feel controlled and traceable.
- Processing states must distinguish queued, processing, waiting, retrying, failed, and completed instead of using a generic loading state. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Empty Loading and Processing States`]
- After reprocessing, summarize what changed and what still blocks handoff.

### Previous Story Intelligence

- Story 2.4 defines how mapping/image-reference issues are surfaced. This story owns the correction and reprocessing action path for those issues.
- Story 2.3 unresolved image references must remain visible after failed reprocessing and must not be silently dropped.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/src/routes/pages/IntakeMapping.tsx`
  - `apps/web/src/routes/pages/FailureRecovery.tsx` only if shared recovery components are appropriate
  - `apps/web/src/lib/mocks/prototype-data.ts`
  - `apps/web/src/lib/api-client/batches.ts`
  - new or updated `apps/web/src/features/batches/*`
  - new or updated `apps/web/src/features/rows/*`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Test correcting a mapping issue starts a new intake attempt for the same batch.
- Test corrected rows update without duplicating unaffected rows.
- Test partial reprocess failure displays remaining row-level issues and keeps correction available.
- Run `npm run test:web` and `npm run lint:web`.

### Scope Boundaries

- In scope: correction UI/contract, intake reprocess attempts, partial failure display, traceability fields.
- Out of scope: submission retry behavior, Amazon integration, full backend worker implementation unless already established by prior work.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.5`]
- Revision/retry requirements: [Source: `_bmad-output/planning-artifacts/prd.md#Retry Idempotency & Versioning`]
- Architecture async/job patterns: [Source: `_bmad-output/planning-artifacts/architecture.md#Communication Patterns`, `_bmad-output/planning-artifacts/architecture.md#Process Patterns`]
- BullMQ idempotent jobs guidance: https://docs.bullmq.io/patterns/idempotent-jobs

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Added failing correction/reprocess tests first; failures confirmed no correction inputs, reprocess mutation, attempt metadata, or post-reprocess outcomes existed.
- Added typed correction and intake reprocess attempt contracts in `apps/web/src/lib/api-client/batches.ts`, including attempt ID/number/status/correlation ID and row-level outcome summaries.
- Wired the intake review screen to submit row-scoped corrections through a React Query mutation, invalidate batch intake data, and display attempt outcomes while preserving same-batch/source-row traceability.
- Fixed a TypeScript React Query mutation generic inference issue caught by `npm run build:web`.
- Verification commands passed: `npm run test:web -- intake-reprocess.test.tsx`, `npm run test:web -- intake-normalized-review.test.tsx intake-image-resolution.test.tsx`, `npm run test:web`, `npm run lint:web`, `npm run build:web`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added correction inputs for selected fixable image-reference and low-confidence mapping issues while preserving original values beside corrected values.
- Added a same-batch intake reprocess mutation contract that returns a new attempt boundary with attempt number, status, timestamps, correlation ID, and row outcomes.
- Added post-reprocess outcome display for corrected, unchanged, and still-failing rows; partial failures remain recoverable through row-level correction links.
- Added focused tests covering existing-batch reprocessing, row identity preservation, unaffected row stability, no duplicate rows, and row-level failure recovery.

### File List

- apps/web/src/features/batches/IntakeImageResolutionReview.tsx
- apps/web/src/lib/api-client/batches.ts
- apps/web/src/test/intake-reprocess.test.tsx
- apps/web/tsconfig.app.tsbuildinfo
- _bmad-output/implementation-artifacts/2-5-correct-intake-issues-and-reprocess-the-batch.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-03: Implemented Story 2.5 intake correction and reprocess flow with typed attempt contracts, UI mutation state, row outcomes, partial failure recovery, and tests.
