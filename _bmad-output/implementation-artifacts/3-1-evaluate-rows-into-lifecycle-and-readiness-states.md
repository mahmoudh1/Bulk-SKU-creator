# Story 3.1: Evaluate Rows into Lifecycle and Readiness States

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want each row evaluated into explicit lifecycle and readiness states,
so that I can understand where the batch stands before submission work begins.

## Acceptance Criteria

1. Given a batch has completed intake and is ready for evaluation, when readiness processing runs, then each row is assigned a lifecycle stage and a readiness state and the states use the approved vocabulary consistently across the Neon record, API DTOs, and UI.
2. Given a row is evaluated, when the readiness result is persisted, then the system stores enough decision context to explain the row's current state and later screens retrieve that state from Neon without recomputing it in the UI.
3. Given readiness logic runs more than once for the same row revision and inputs, when the evaluation completes, then the system produces deterministic outcomes for the same conditions and does not create inconsistent status behavior across repeated views.
4. Given an intake row has resolved R2-backed image assets, when readiness evaluation records image evidence, then the readiness result references the server-controlled image asset IDs and preview endpoints and does not store external image URLs or browser-local blob references as authoritative evidence.

## Tasks / Subtasks

- [x] Add persisted readiness evaluation data to the local API schema (AC: 1, 2, 4)
  - [x] Extend `apps/web/server/bulk-sku-api.ts` schema setup with the minimum Neon-backed fields/tables needed for row readiness results, row lifecycle events, and validation evidence.
  - [x] Keep tenant scoping on `organization_id` and batch scoping on `batch_id`.
  - [x] Preserve existing `batch_intake_reviews.review` JSON compatibility so Epic 2 intake still works.
- [x] Define readiness/lifecycle DTOs in the batch API client (AC: 1, 2)
  - [x] Add explicit readiness states: `READY`, `READY_WITH_AUGMENTATION`, `NEEDS_INPUT`, `NOT_ENOUGH_DATA`, `BLOCKED_FOR_REVIEW`.
  - [x] Add explicit lifecycle stages for the Epic 3 boundary, at minimum intake-ready, readiness-evaluated, needs-correction, and ready-for-submission-prep.
  - [x] Include row revision, issue summaries, evidence references, and updated timestamps in DTOs.
- [x] Implement readiness evaluation endpoint(s) (AC: 1, 2, 3, 4)
  - [x] Add an API endpoint to evaluate a batch's existing intake rows into readiness rows/results.
  - [x] Add an API endpoint or query path to fetch evaluated readiness data by batch and organization.
  - [x] Ensure repeated evaluation for the same unchanged intake row produces stable row IDs, lifecycle stage, readiness state, and issue output.
- [x] Use R2-backed image evidence from Epic 2 (AC: 4)
  - [x] Reference existing `resolvedAssets.previewRef` and `imageId` values from intake rows.
  - [x] Do not trust browser-local image data as readiness evidence outside test fallback mode.
- [x] Add focused tests (AC: 1, 2, 3, 4)
  - [x] Cover deterministic evaluation for a clean row and a row with unresolved intake/image issues.
  - [x] Cover persisted fetch after evaluation.
  - [x] Cover R2 image evidence references in the readiness result.

## Dev Notes

- Epic 3 starts after Epic 2. The current API persists image metadata in `image_assets`, source/intake reviews in `batch_intake_reviews`, and stores image bytes in Cloudflare R2. Build on that rather than introducing a separate mock data path. [Source: `apps/web/server/bulk-sku-api.ts`]
- Current client DTOs live in `apps/web/src/lib/api-client/batches.ts`. They still expose intake concepts and a test-only localStorage fallback. Add readiness DTOs alongside the existing intake DTOs; do not remove intake behavior needed by Stories 2.1-2.6.
- Triage UI currently reads `rows` and `batches` from `@/data/mock`. Story 3.1 should create the server/client contract that later stories will consume, not fully replace the triage UI yet. [Source: `apps/web/src/routes/pages/TriageWorkspace.tsx`]

### Technical Requirements

- Neon is the authoritative store for readiness state, lifecycle events, validation issue summaries, and row revision context.
- Cloudflare R2 remains the source for image bytes. Readiness results should reference image asset IDs and preview endpoints, not direct R2 secrets or public URLs.
- Browser localStorage may remain only as Vitest fallback in existing API-client functions. Production/dev runtime should call `/api/...`.
- Keep row identity stable: source row number, source row key, batch ID, organization ID, row ID, and row revision must stay traceable from intake to readiness.
- Do not implement Amazon submission, AI enrichment, or full product-type catalog lookups in this story. Use deterministic local readiness rules sufficient to create persisted state and exercise the Epic 3 workflow.

### Architecture Compliance

- Backend remains the source of truth for lifecycle state, readiness state, and audit history. [Source: `_bmad-output/planning-artifacts/architecture.md#Process Patterns`]
- Row-level validation responses must expose status, blocking reasons, warnings, and next-action guidance predictably. [Source: `_bmad-output/planning-artifacts/architecture.md#API Patterns`]
- Use explicit enums/string literals consistently across API, workers, and UI. [Source: `_bmad-output/planning-artifacts/architecture.md#Data and API Conventions`]

### Frontend Prototype Gap Guardrails

- Do not drive readiness from `src/data/mock.ts` in production/dev runtime. The gap analysis identifies mock-driven behavior as a critical gap. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]
- Do not use hardcoded demo batch IDs or prototype route defaults as authoritative readiness inputs. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]

### File Structure Requirements

- High-probability files to update:
  - `apps/web/server/bulk-sku-api.ts`
  - `apps/web/src/lib/api-client/batches.ts`
  - `apps/web/src/lib/api-client/index.ts`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Run `npm run test:web`.
- Run `npm run lint:web`.
- Run `npm run build:web`.
- Add tests for API-client behavior and/or route behavior without requiring live secrets in Vitest; keep external Neon/R2 checks in `npm run check:services`.

### Scope Boundaries

- In scope: persisted readiness results, lifecycle/readiness DTOs, deterministic evaluation, R2 evidence references.
- Out of scope: full triage grid replacement, row detail inspector replacement, correction UI, duplicate/forced-match integration with Amazon.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.1`]
- PRD readiness requirements: [Source: `_bmad-output/planning-artifacts/epics.md#Functional Requirements`]
- Architecture lifecycle requirements: [Source: `_bmad-output/planning-artifacts/architecture.md#Process Patterns`]
- Current API implementation: [Source: `apps/web/server/bulk-sku-api.ts`]

## Dev Agent Record

### Agent Model Used

SOLO (proprietary)

### Debug Log References

### Completion Notes List

- Added persisted readiness evaluation schema, lifecycle tracking, and validation evidence tables in the local API server.
- Added readiness evaluation and fetch endpoints with deterministic upserts keyed on row revision.
- Added readiness/lifecycle DTOs and client functions with Vitest-only localStorage fallback.
- Added focused readiness evaluation tests (deterministic behavior, persisted fetch, and image preview evidence).
- Validated with `npm run test:web`, `npm run lint:web`, and `npm run build:web`.

### File List

- apps/web/server/bulk-sku-api.ts
- apps/web/src/lib/api-client/batches.ts
- apps/web/src/test/readiness-evaluation.test.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/3-1-evaluate-rows-into-lifecycle-and-readiness-states.md

## Change Log

- 2026-05-03: Implemented persisted readiness evaluation contract (schema + endpoints + client DTOs + tests).
