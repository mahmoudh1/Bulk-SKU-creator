# Story 3.6: Correct Rows In-Workflow and Revalidate Them

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want to correct row issues and revalidate them inside the same workflow,
so that I can move blocked rows toward readiness without losing context.

## Acceptance Criteria

1. Given a row contains fixable issues, when the operator edits supported fields in the row workflow, then those changes are persisted through the application and the row remains traceable to its original source identity and current revision context in Neon.
2. Given the operator requests revalidation after a correction, when the revalidation completes, then the row's readiness result and issue set are refreshed and the operator can immediately see whether the correction resolved the problem.
3. Given a correction does not fully resolve the row, when revalidation finishes, then the remaining blockers or warnings are shown clearly and the workflow continues from the same context rather than resetting the operator's progress.
4. Given an edited row references a corrected image ID, when revalidation runs, then the system resolves the corrected ID against the organization's persisted image assets and blocks the row if the image asset is missing, forbidden, or not readable from R2.

## Tasks / Subtasks

- [ ] Add row correction mutation model (AC: 1)
  - [ ] Support a scoped set of editable fields from current persisted row data: title/name, brand, identifier/exemption, required attributes, product type where already supported, and image ID references.
  - [ ] Persist corrections with row revision, source row identity, actor/user ID where available, and timestamp.
  - [ ] Do not mutate original source identity fields.
- [ ] Implement revalidation after correction (AC: 2, 3, 4)
  - [ ] Add API endpoint/mutation for row correction and revalidation.
  - [ ] Re-run deterministic readiness/validation rules from Stories 3.1-3.5 on the corrected row revision.
  - [ ] Return row outcome, remaining issues, new revision, and updated readiness state.
- [ ] Wire row detail correction UI (AC: 1, 2, 3)
  - [ ] Add editable controls only for supported fields.
  - [ ] Show mutation pending, success, and failure states.
  - [ ] Preserve current batch/row route context after mutation.
- [ ] Resolve corrected image IDs through server state (AC: 4)
  - [ ] Check corrected image IDs against organization-scoped `image_assets`.
  - [ ] Treat missing, forbidden, or unreadable R2 assets as row blockers.
- [ ] Add focused tests (AC: 1, 2, 3, 4)
  - [ ] Correction creates a new revision and preserves source row identity.
  - [ ] Revalidation clears resolved blockers.
  - [ ] Remaining blockers remain visible.
  - [ ] Bad image ID remains blocked.

## Dev Notes

- Epic 2 already has intake-level correction/reprocess for image IDs. This story is row readiness correction after intake handoff. Reuse concepts where helpful but keep intake attempts distinct from readiness row revisions.
- Avoid broad spreadsheet editing. The operator edits supported row fields in the workflow; original source identity must remain traceable.
- Current RowInspector buttons are inert prototype controls. This story makes the relevant controls real.

### Technical Requirements

- Neon must persist row corrections and revised readiness results.
- Revalidation must be deterministic for a given corrected row revision.
- Mutations must be tenant-scoped by organization ID and batch ID.
- Do not allow edits to break row identity: keep `batchId`, `rowId`, `sourceRowNumber`, `sourceRowKey`, and previous revision trace.
- Use explicit API errors for unsupported fields, missing row, stale revision, and image asset failures.

### Architecture Compliance

- Row lifecycle state management and revision boundaries are core architecture requirements. [Source: `_bmad-output/planning-artifacts/architecture.md#Key Design Decisions`]
- Retry/reprocessing behavior must not lose unaffected row state. [Source: `_bmad-output/planning-artifacts/architecture.md#Reliability`]
- Backend remains source of truth for lifecycle/readiness state. [Source: `_bmad-output/planning-artifacts/architecture.md#Process Patterns`]

### UX Requirements

- Support inline row-level corrections where practical, with field-level validation messages and row-level blocker summaries. [Source: `_bmad-output/planning-artifacts/epics.md#UX Design Requirements`]
- Revalidation feedback must be immediate and explicit. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Journey Patterns`]

### Previous Story Intelligence

- Stories 3.1-3.5 establish readiness state, row detail, validation, duplicate risk, and forced-match blockers. This story should reuse those rule outputs rather than creating separate issue models.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/server/bulk-sku-api.ts`
  - `apps/web/src/lib/api-client/batches.ts`
  - `apps/web/src/routes/pages/RowInspector.tsx`
  - `apps/web/src/routes/pages/TriageWorkspace.tsx`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Run `npm run test:web`.
- Run `npm run lint:web`.
- Run `npm run build:web`.
- Add mutation tests for correction and revalidation.

### Scope Boundaries

- In scope: row field correction, row revision, revalidation, refreshed readiness/issues.
- Out of scope: bulk correction, saved views, AI content approval, submission retry.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.6`]
- Current row inspector prototype controls: [Source: `apps/web/src/routes/pages/RowInspector.tsx`]
- Existing intake correction concepts: [Source: `apps/web/src/lib/api-client/batches.ts`]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List

