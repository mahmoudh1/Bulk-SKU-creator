# Story 2.3: Resolve Spreadsheet Image IDs into Server-Side Asset Previews

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want the system to resolve image IDs from my uploaded spreadsheet into real previews and asset references,
so that I can confirm the batch is linked to the correct product images before deeper processing continues.

## Acceptance Criteria

1. Given a batch spreadsheet contains one or more `image_id` references, when intake resolution runs, then the backend looks up those IDs against platform-managed assets and attaches resolved asset metadata and preview-ready references to the relevant rows.
2. Given an `image_id` does not exist, is inaccessible to the active organization, or cannot be resolved, when the system processes that row, then the row is marked with an intake issue that is visible to the operator and the batch remains recoverable without silently dropping the image reference.
3. Given resolved image assets are available, when the operator opens intake review, then they can see image previews or equivalent visual confirmation per referenced asset and those previews are served through platform-controlled access rather than external URLs.

## Tasks / Subtasks

- [x] Add resolved image asset metadata to row intake models (AC: 1)
  - [x] Include `imageId`, preview reference, filename/label, resolution/status, and organization ownership indicators where appropriate.
  - [x] Attach resolved assets to source row identity without losing original spreadsheet references.
- [x] Model unresolved/inaccessible image IDs as row-level intake issues (AC: 2)
  - [x] Distinguish not found, not in organization, unsupported/corrupt asset, and transient resolution failure.
  - [x] Preserve the original `image_id` string for correction and support traceability.
  - [x] Do not drop or silently rewrite invalid references.
- [x] Update intake review UI with preview confirmation (AC: 3)
  - [x] Show per-row or sample-row visual confirmation for resolved assets.
  - [x] Use platform-controlled preview references from the API contract, not external spreadsheet URLs.
  - [x] Provide accessible labels for image previews and error states.
- [x] Add test coverage (AC: 1, 2, 3)
  - [x] Cover resolved assets, unresolved assets, inaccessible organization assets, and preview rendering.

## Dev Notes

- This story connects Story 2.1 image assets and Story 2.2 spreadsheet intake. It should not implement full image compliance analysis; it only confirms that spreadsheet `image_id` values resolve to platform-managed assets. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.3`]
- Current mock rows only expose `imagesCount`; they do not preserve asset IDs, preview references, or row-level intake issues. Expect to extend `apps/web/src/lib/mocks/prototype-data.ts` or create a more specific intake data model. [Source: `apps/web/src/lib/mocks/prototype-data.ts`]

### Technical Requirements

- Asset access must be organization-scoped. An existing `image_id` from another organization must behave as inaccessible, not valid. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]
- Preserve row identity and original image reference text so later correction/reprocessing can explain what changed. [Source: `_bmad-output/planning-artifacts/prd.md#Retry Idempotency & Versioning`]
- Use structured row-level issue codes, for example `IMAGE_ID_NOT_FOUND`, `IMAGE_ID_FORBIDDEN`, `IMAGE_ASSET_UNREADABLE`, `IMAGE_RESOLUTION_PENDING`.
- Preview URLs/references must be platform-controlled and short-lived or access-controlled in the eventual API. The frontend should treat them as display references, not canonical IDs.

### Frontend Prototype Gap Guardrails

- The frontend status docs identify the app as mock-data driven with no API/query layer. Asset preview resolution must not be implemented as local filename matching or static `imagesCount`; model server-resolved asset metadata through typed contracts. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`, `listing-workbench/docs/frontend-implementation-status.md#Data and API Layer`]
- The intake mapping screen is currently mock-only and missing detected mapping state, persistence, and preprocessing handoff. This story should move it toward query-backed resolution state and row-level issue display. [Source: `listing-workbench/docs/frontend-implementation-status.md#Intake Mapping`]
- Avoid hardcoded demo entities when linking previews or rows; use the active route `batchId` and row/image IDs from data contracts. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]
- Clean touched mojibake/encoding-corrupted UI strings in intake/image copy. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]

### Architecture Compliance

- Resolution is a backend/API responsibility; frontend work should model and display server truth. Do not let frontend "resolve" assets from local filename rules.
- Use batch-scoped and row-scoped API-client functions such as `getBatchIntakeReview(batchId)` or `getBatchRows(batchId, filters)`.
- Keep query keys stable and batch scoped, for example `['batchIntake', batchId]` or `['batchRows', batchId, filters]`. [Source: `_bmad-output/planning-artifacts/architecture.md#State Management Patterns`; TanStack Query docs: https://tanstack.com/query/latest/docs/react/guides/query-keys]

### UX Requirements

- Intake review should let the operator visually confirm asset linkage before deeper processing. This belongs in the mapping/intake checkpoint, not later submission image-plan review. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Batch Intake to Readiness Triage`]
- Errors should be visible at row level and summarized at batch level. The user should know whether the batch can continue, needs correction, or is partially recoverable.
- Previews need accessible alt text or labels that include product row/SKU and image ID where available.

### Previous Story Intelligence

- Story 2.1 defines image asset upload and stable `image_id` issuance.
- Story 2.2 defines spreadsheet intake and batch creation. This story should reuse those contracts and extend them with resolution results rather than creating a second batch model.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/src/routes/pages/IntakeMapping.tsx`
  - `apps/web/src/lib/mocks/prototype-data.ts`
  - `apps/web/src/lib/api-client/batches.ts`
  - `apps/web/src/lib/api-client/image-assets.ts`
  - new or updated `apps/web/src/features/batches/*`
  - new or updated `apps/web/src/features/image-assets/*`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Test that resolved `image_id` rows show preview-ready metadata.
- Test unresolved and inaccessible image IDs remain visible as recoverable intake issues.
- Test no external URL ingestion path is introduced.
- Run `npm run test:web` and `npm run lint:web`.

### Scope Boundaries

- In scope: intake asset-resolution model, preview display, row-level intake issues, organization-scoped access behavior in contracts/mocks.
- Out of scope: real object storage implementation, generated image work, Amazon image compliance validation, final listing image plan approval.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.3`]
- Internal image contract: [Source: `_bmad-output/planning-artifacts/prd.md#Image Safety Rules`]
- Architecture boundaries/security: [Source: `_bmad-output/planning-artifacts/architecture.md#Architectural Boundaries`, `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]
- Existing intake page: [Source: `apps/web/src/routes/pages/IntakeMapping.tsx`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Added failing intake image resolution tests first; failures confirmed the existing intake mapping page was static and no typed intake image resolution API contract existed.
- Implemented typed batch intake review DTOs and mock server-resolved image metadata/issues in `apps/web/src/lib/api-client/batches.ts`.
- Replaced the static intake mapping route with a query-backed review component that displays platform-controlled previews and row-level image resolution issues.
- Verification commands passed: `npm run test:web -- intake-image-resolution.test.tsx`, `npm run test:web`, `npm run lint:web`, `npm run build:web`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added server-truth intake image resolution contracts with resolved asset metadata, original spreadsheet `image_id` preservation, organization ownership fields, and structured image intake issue codes.
- Added the intake image resolution review UI with accessible asset previews, recoverable issue states, batch summary counts, and platform-controlled preview references.
- Covered resolved, missing, forbidden, and external URL prevention behavior in focused React tests, then verified the full web test, lint, and build suites.

### File List

- apps/web/src/features/batches/IntakeImageResolutionReview.tsx
- apps/web/src/lib/api-client/batches.ts
- apps/web/src/routes/pages/IntakeMapping.tsx
- apps/web/src/test/intake-image-resolution.test.tsx
- apps/web/tsconfig.app.tsbuildinfo
- _bmad-output/implementation-artifacts/2-3-resolve-spreadsheet-image-ids-into-server-side-asset-previews.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-03: Implemented Story 2.3 intake image ID resolution review, including API contracts, row-level issues, preview UI, focused tests, and validation.
