# Story 2.2: Create a Batch from a Spreadsheet That References Image IDs

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want to create a new batch and upload a spreadsheet that contains image IDs,
so that I can start a bulk listing workload using pre-registered assets.

## Acceptance Criteria

1. Given an operator has prepared a spreadsheet with product rows and `image_id` references, when they create a batch and upload the sheet, then the system creates a batch record, persists the uploaded source file, and associates the batch with the active organization and initiating user.
2. Given the spreadsheet is missing required structural elements or cannot be parsed, when upload processing begins, then the system rejects the intake with a user-meaningful error and does not create a misleading successful batch state.
3. Given a valid spreadsheet is uploaded, when the intake starts, then the operator receives visible upload and processing feedback within the required responsiveness target and the batch moves into the intake processing flow rather than stopping at raw file storage.

## Tasks / Subtasks

- [x] Update the create-batch workflow for spreadsheet-first batch creation (AC: 1)
  - [x] Capture batch name, marketplace, spreadsheet file, and initiating user/organization context.
  - [x] Require spreadsheet rows to reference previously issued internal `image_id` values, not external URLs or filename-only matching.
  - [x] Represent the source file as persisted batch intake metadata in the frontend contract.
- [x] Add parse/structure validation states (AC: 2)
  - [x] Detect missing required structural elements in mocked/contract validation.
  - [x] Surface user-meaningful errors without creating a false success state.
  - [x] Keep unsupported or unparseable files recoverable by replacement.
- [x] Start the intake processing flow after valid upload (AC: 3)
  - [x] Show explicit upload and processing progress rather than a single generic loading state.
  - [x] Navigate to the mapping/intake review route only after accepted intake state.
  - [x] Preserve batch ID and source-file identity across the handoff.
- [x] Add batch API-client and mock data contracts (AC: 1, 2, 3)
  - [x] Define create-batch request/response DTOs with `organizationId`, `createdBy`, `sourceFile`, and intake status fields.
  - [x] Use clear states such as `DRAFT`, `UPLOADING`, `INTAKE_QUEUED`, `INTAKE_PROCESSING`, `INTAKE_FAILED`.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover valid spreadsheet creation, invalid structure rejection, and visible processing feedback.

## Dev Notes

- Story 2.2 depends on Story 2.1's internal image asset contract. Do not go back to filename-only image matching as the canonical model; spreadsheets reference `image_id` values issued by the platform. [Source: `_bmad-output/implementation-artifacts/2-1-upload-images-through-the-in-app-image-service.md`]
- Current `CreateBatch.tsx` still describes uploading spreadsheets and product images together and says filenames must reference SKU/row ID. This story should move that copy and flow toward pre-registered image IDs. [Source: `apps/web/src/routes/pages/CreateBatch.tsx`]

### Technical Requirements

- Batch records must be organization-scoped and linked to the initiating user. The frontend should rely on existing protected route and organization boundary behavior rather than duplicating auth logic.
- Source row identity starts here. The intake contract should preserve a source file ID/name, row number or source row key, and later row IDs for downstream traceability. [Source: `_bmad-output/planning-artifacts/prd.md#Ingestion & Batch Setup`]
- Valid upload should enter accepted/pending processing semantics; do not present normalization as completed synchronously unless the contract says it is complete. [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`]
- NFR1 requires visible batch-ingestion feedback within 10 seconds of valid upload starting. The UI should show accepted/queued/processing quickly even if deeper parsing is async. [Source: `_bmad-output/planning-artifacts/prd.md#Performance`]

### Frontend Prototype Gap Guardrails

- The current create-batch experience is documented as mock-only: no upload logic, drag/drop handling, validation, save draft, or analysis-start mutation. This story must close that gap for spreadsheet batch creation instead of preserving static file previews as product behavior. [Source: `listing-workbench/docs/frontend-implementation-status.md#Create Batch`]
- The gap analysis calls out missing API client, query hooks, request/response handling, mutation flows, and backend error handling. Add explicit API-client and mutation seams for batch creation even if the backend remains mocked locally. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]
- Avoid hardcoded demo batch IDs in the completed flow. Successful creation should use the returned batch ID for navigation. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]
- Clean touched mojibake/encoding-corrupted UI strings while updating `CreateBatch.tsx`. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]

### Architecture Compliance

- Use route `appPaths.createBatch` for creation and `appPaths.batchMapping(batchId)` for the next intake checkpoint.
- Frontend should call an application API-client layer, not storage/database/worker code directly. The future backend owns persistence and queueing.
- Keep JSON/TypeScript contract fields camelCase, while any future database layer can use snake_case. [Source: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`]
- Use TanStack Query mutation patterns for create/upload state where practical. Official guidance keeps cache identity based on query keys; use stable batch-scoped keys for later invalidation. [Source: https://tanstack.com/query/latest/docs/react/guides/query-keys]

### UX Requirements

- Create batch should show that upload begins analysis. The first post-upload state should answer what is happening, whether intake is blocked, and what the next useful action is. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Batch Intake to Readiness Triage`]
- Avoid vague "success" when parsing is pending or failed. Distinguish upload accepted, parse failed, intake queued, and intake processing.
- Desktop is the primary workflow target; keep controls dense and scannable, with mobile remaining non-broken for status viewing. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Strategy`]

### File Structure Requirements

- High-probability files to update:
  - `apps/web/src/routes/pages/CreateBatch.tsx`
  - `apps/web/src/app/routes/paths.ts`
  - `apps/web/src/lib/mocks/prototype-data.ts`
  - new or updated `apps/web/src/lib/api-client/batches.ts`
  - new or updated `apps/web/src/features/batches/*`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Test valid batch creation flow and route handoff to mapping.
- Test invalid spreadsheet structure shows a recoverable error and does not navigate to a success state.
- Test visible processing state text is accessible via `role="status"` or equivalent semantic pattern.
- Run `npm run test:web` and `npm run lint:web`.

### Scope Boundaries

- In scope: create-batch UI/contract, spreadsheet intake states, organization/user association in frontend models, parse-error states.
- Out of scope: real spreadsheet parsing engine, backend persistence, worker queue implementation, image ID resolution details handled in Story 2.3.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.2`]
- PRD ingestion requirements: [Source: `_bmad-output/planning-artifacts/prd.md#Ingestion & Batch Setup`]
- Architecture async/API guidance: [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`]
- Existing page: [Source: `apps/web/src/routes/pages/CreateBatch.tsx`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- 2026-05-03: Added failing create-batch intake tests before implementation; initial failure confirmed missing batch API contract.
- 2026-05-03: Added browser-compatible file text reading fallback for spreadsheet header validation in Vitest/jsdom.
- 2026-05-03: Verified with `npm run test:web`, `npm run lint:web`, and `npm run build:web`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Replaced the static Create Batch prototype with a spreadsheet-first intake workflow that requires image IDs from the image service.
- Added a typed batch API-client contract with organization ID, initiating user ID, source-file metadata, batch ID, and intake status fields.
- Added recoverable validation for unsupported spreadsheet files and missing required CSV columns, including `image_id`.
- Added upload accepted, queued, and processing status feedback before handing off to the batch mapping route with the returned batch ID.
- Removed hardcoded demo batch navigation from the completed create-batch path.
- Added focused tests for valid intake creation, invalid structure rejection, unsupported file recovery, and route handoff.

### File List

- `apps/web/src/features/batches/CreateBatchIntake.tsx`
- `apps/web/src/lib/api-client/batches.ts`
- `apps/web/src/lib/api-client/index.ts`
- `apps/web/src/routes/pages/CreateBatch.tsx`
- `apps/web/src/test/create-batch-intake.test.tsx`
- `apps/web/tsconfig.app.tsbuildinfo`
- `_bmad-output/implementation-artifacts/2-2-create-a-batch-from-a-spreadsheet-that-references-image-ids.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-03: Implemented spreadsheet-first batch creation and intake handoff for Story 2.2.
