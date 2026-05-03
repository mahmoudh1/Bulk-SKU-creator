# Story 2.4: Review Normalized Rows and Field-to-Model Mapping

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want to review how spreadsheet fields and image references were interpreted,
so that I can confirm the system understood the source data before processing continues.

## Acceptance Criteria

1. Given a batch has completed initial parsing and asset resolution, when the operator opens the intake review screen, then they can inspect normalized row output, detected field mappings, and linked image references, and each row preserves a stable identity tied to the uploaded source row.
2. Given the system inferred mappings or normalized fields from raw spreadsheet content, when the operator reviews the batch, then the intake UI shows enough information to understand how the source data was interpreted and does not force the operator to continue blindly into later workflow stages.
3. Given the operator identifies mapping or interpretation issues, when they inspect the intake review state, then the problematic fields or references are surfaced clearly and the operator has a defined path to correct them before reprocessing.

## Tasks / Subtasks

- [x] Expand the intake mapping screen into a normalized-row review checkpoint (AC: 1, 2)
  - [x] Show detected source column to internal field mapping.
  - [x] Show sample normalized values and row-level interpretation confidence or status.
  - [x] Include linked image references/previews from Story 2.3.
- [x] Preserve source row identity in the UI and data model (AC: 1)
  - [x] Display or retain source row number/key, internal row ID, SKU, and original spreadsheet reference.
  - [x] Ensure normalized rows can be traced back to original uploaded rows.
- [x] Surface mapping and interpretation issues with correction paths (AC: 2, 3)
  - [x] Flag unmapped required fields, low-confidence mappings, invalid transformations, and unresolved image references.
  - [x] Add edit/review affordances that lead into Story 2.5 reprocessing work without pretending corrections are complete in this story.
- [x] Add tests for review behavior (AC: 1, 2, 3)
  - [x] Cover normalized output visibility, source row identity, field mapping issues, and correction path affordance.

## Dev Notes

- Current `IntakeMapping.tsx` already has a static detected mappings table and row preview. This story should formalize it around source identity, normalized output, and image reference review rather than replacing it wholesale. [Source: `apps/web/src/routes/pages/IntakeMapping.tsx`]
- The user should not be forced into readiness evaluation until intake interpretation is legible. This is the final human checkpoint before deeper processing continues. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.4`]

### Technical Requirements

- Normalized rows must preserve source row identity. Required trace fields include enough information to connect source spreadsheet row, internal row ID, batch ID, row revision or intake attempt, and image references. [Source: `_bmad-output/planning-artifacts/prd.md#Technical Constraints`]
- Mapping results should distinguish source fields, internal model fields, confidence/status, sample values, and issue codes.
- Keep lifecycle vocabulary consistent. This story is still intake/normalization; do not jump rows into validation/enrichment/submission states.
- Use explicit issue categories such as unmapped field, low-confidence mapping, invalid normalized value, unresolved image reference, and missing required source structure.

### Frontend Prototype Gap Guardrails

- The documented prototype has static intake UI but no detected mapping persistence, preprocessing handoff, query hooks, or mutation/error lifecycle. This story must convert the review checkpoint into real stateful behavior or explicit typed API seams. [Source: `listing-workbench/docs/frontend-implementation-status.md#Intake Mapping`, `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]
- The gap analysis flags incomplete state management, including missing preserved filter state, URL-driven table state, entity selection persistence, and mutation/loading/error modeling. Mapping review should preserve batch context and avoid local-only state that disappears on navigation. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Medium Gaps`]
- Do not add another static table as the final implementation. Static sample data may exist only as test/mock fixture data behind the API-client seam. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]
- Clean touched mojibake/encoding-corrupted UI strings in mapping and row preview copy. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]

### Architecture Compliance

- Backend remains source of truth for normalized output. The frontend displays and edits proposed mapping state through application API contracts.
- Use domain-specific modules (`features/batches`, `features/rows`, `features/image-assets`) instead of a generic utilities dump. [Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`]
- Keep existing React Router batch route conventions. Current mapping route is `/batches/:id/mapping`. [Source: `apps/web/src/app/routes/route-config.tsx`]

### UX Requirements

- The intake review screen must answer: what was interpreted, what is blocked, and what should I do next. [Source: `_bmad-output/planning-artifacts/prd.md#Implementation Considerations`]
- Batch review should be a table-first triage surface with summaries, filters, and row-level diagnostics. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy`]
- Use semantic tables for row-heavy content and screen-readable status labels. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Accessibility Strategy`]

### Previous Story Intelligence

- Story 2.2 creates the batch/source-file intake contract.
- Story 2.3 adds resolved image references and intake image issues. This story must display those alongside field mapping and normalized row output.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/src/routes/pages/IntakeMapping.tsx`
  - `apps/web/src/lib/mocks/prototype-data.ts`
  - `apps/web/src/components/StatusChip.tsx` if intake-specific statuses need shared display
  - new or updated `apps/web/src/features/batches/*`
  - new or updated `apps/web/src/features/rows/*`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Test source field to model field mapping table.
- Test source row identity is present in normalized row preview.
- Test issue rows are accessible and expose next action/correction affordance.
- Run `npm run test:web` and `npm run lint:web`.

### Scope Boundaries

- In scope: review/inspection UI, normalized row contracts, source identity display, issue surfacing, correction path affordance.
- Out of scope: actual reprocessing after corrections, full validation/readiness classification, submission preview.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.4`]
- PRD row identity and mapping review: [Source: `_bmad-output/planning-artifacts/prd.md#Ingestion & Batch Setup`]
- UX batch grid/intake flow: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Batch Intake to Readiness Triage`, `_bmad-output/planning-artifacts/ux-design-specification.md#Batch Review Grid`]
- Existing intake page: [Source: `apps/web/src/routes/pages/IntakeMapping.tsx`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Added failing normalized intake review tests first; failures confirmed the current mapping screen only handled image resolution and lacked mapping/normalized-row review semantics.
- Extended the typed batch intake review contract with field mappings, normalized fields, source row identity, interpretation statuses, and issue codes.
- Updated the intake review UI to keep Story 2.3 image previews while adding detected mappings, normalized output, issue summaries, and Story 2.5 correction-path affordances.
- Tightened the existing image-resolution test to scope SKU row lookup to the normalized row review table after the new mapping table introduced SKU sample rows.
- Verification commands passed: `npm run test:web -- intake-normalized-review.test.tsx`, `npm run test:web -- intake-image-resolution.test.tsx`, `npm run test:web`, `npm run lint:web`, `npm run build:web`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added a backend-shaped normalized intake review DTO that preserves batch ID, source row number/key, internal row ID, intake attempt, row revision, SKU, original `image_id` references, normalized fields, and linked image assets.
- Expanded the intake mapping screen into a table-first checkpoint showing detected source-to-model mappings, confidence/status, sample raw and normalized values, normalized row output, and image references together.
- Surfaced low-confidence mapping and unresolved image reference issues with accessible row-level diagnostics plus a correction-path link for Story 2.5 without implementing correction/reprocessing.
- Added focused React tests for mapping visibility, source row identity, normalized output, issue surfacing, and correction affordances; preserved Story 2.3 image resolution coverage.

### File List

- apps/web/src/features/batches/IntakeImageResolutionReview.tsx
- apps/web/src/lib/api-client/batches.ts
- apps/web/src/test/intake-image-resolution.test.tsx
- apps/web/src/test/intake-normalized-review.test.tsx
- apps/web/tsconfig.app.tsbuildinfo
- _bmad-output/implementation-artifacts/2-4-review-normalized-rows-and-field-to-model-mapping.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-03: Implemented Story 2.4 normalized row and field-mapping review checkpoint with source identity, issue surfacing, correction affordances, and tests.
