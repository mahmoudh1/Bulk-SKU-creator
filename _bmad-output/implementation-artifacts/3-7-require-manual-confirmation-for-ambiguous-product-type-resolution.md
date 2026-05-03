# Story 3.7: Require Manual Confirmation for Ambiguous Product Type Resolution

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want ambiguous product-type decisions surfaced for manual confirmation,
so that the system does not proceed on low-confidence classification.

## Acceptance Criteria

1. Given automatic product-type resolution is ambiguous or below confidence threshold, when readiness processing completes, then the row is marked for manual product-type confirmation and the system does not silently continue with a low-confidence product type.
2. Given the operator reviews a row requiring manual product-type confirmation, when they open the row detail workflow, then they can see the ambiguity and the available confirmation path and the decision is recorded for later traceability with the row revision and confirming user.
3. Given the operator confirms a product type, when revalidation runs afterward, then downstream validation uses the confirmed product type and the row can progress only if the rest of the readiness checks pass.
4. Given product-type confirmation options are shown, when the operator chooses or changes a product type, then the UI shows the validation impact before or immediately after revalidation and does not allow an ambiguous product type to appear ready for submission.

## Tasks / Subtasks

- [ ] Add product-type ambiguity state to readiness model (AC: 1)
  - [ ] Store candidate product types, confidence values, threshold, selected/confirmed value, and confirmation-required flag.
  - [ ] Mark low-confidence product type as `NEEDS_INPUT` or equivalent non-ready state.
- [ ] Surface confirmation path in row detail (AC: 2, 4)
  - [ ] Show ambiguity reason and candidates.
  - [ ] Provide confirmation controls in the diagnostic action rail or row detail section.
  - [ ] Do not show ambiguous rows as ready for submission.
- [ ] Persist confirmation and revalidate (AC: 2, 3, 4)
  - [ ] Add mutation to confirm product type with row revision and actor.
  - [ ] Re-run readiness validation after confirmation.
  - [ ] Store confirmation event in lifecycle/history.
- [ ] Add focused tests (AC: 1, 2, 3, 4)
  - [ ] Low confidence requires confirmation.
  - [ ] Confirmation persists with row revision/user.
  - [ ] Revalidation uses confirmed type.
  - [ ] Ambiguous row is not considered ready.

## Dev Notes

- Product-type confirmation is readiness workflow behavior, not AI enrichment approval. Keep it separate from Epic 4 AI content review.
- If no real product-type resolver exists yet, implement deterministic local candidates from current row data sufficient to represent ambiguity and confirmation.
- Confirmation should update readiness state through the same revalidation path from Story 3.6 where practical.

### Technical Requirements

- Persist confirmation with organization ID, batch ID, row ID, row revision, confirmed product type, actor, and timestamp.
- Keep confidence and candidate information explainable in row detail.
- Do not allow product-type confirmation to bypass other blockers.
- Avoid hardcoded prototype product types unless they are clearly test fixtures.

### Architecture Compliance

- Manual product-type confirmation is required when automation is ambiguous. [Source: `_bmad-output/planning-artifacts/epics.md#FR39`]
- Product-type resolution needs auditable decision paths. [Source: `_bmad-output/planning-artifacts/architecture.md#Key Design Decisions`]
- Schema version and product-type version should remain traceable for validation/submission. [Source: `_bmad-output/planning-artifacts/epics.md#NFR21`]

### UX Requirements

- Show ambiguity and confirmation path clearly in row detail.
- Display status and validation impact in text, not color alone.
- Use one primary action in the confirmation surface.

### Previous Story Intelligence

- Story 3.6 provides correction/revalidation patterns. Reuse those mutation and state refresh conventions.
- Story 3.4 validation should use confirmed product type after this story.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/server/bulk-sku-api.ts`
  - `apps/web/src/lib/api-client/batches.ts`
  - `apps/web/src/routes/pages/RowInspector.tsx`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Run `npm run test:web`.
- Run `npm run lint:web`.
- Run `npm run build:web`.
- Add tests around ambiguous, confirmed, and still-blocked outcomes.

### Scope Boundaries

- In scope: ambiguity state, confirmation UI, persisted confirmation event, revalidation.
- Out of scope: full Amazon product-type schema browser, AI enrichment generation, submission payload construction.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.7`]
- Product-type confirmation requirement: [Source: `_bmad-output/planning-artifacts/epics.md#FR39`]
- UX decision workspace guidance: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Row Detail Inspector`]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List

