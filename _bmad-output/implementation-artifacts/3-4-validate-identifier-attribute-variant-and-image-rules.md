# Story 3.4: Validate Identifier, Attribute, Variant, and Image Rules

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want rows checked against submission-critical rules,
so that bad data is blocked before later workflow stages.

## Acceptance Criteria

1. Given a row is undergoing readiness validation, when validation rules run, then the system checks identifier or exemption requirements, required attributes, variant structure, and image compliance and records validation results in a row-explainable Neon-backed form with rule codes, severity, and remediation hints.
2. Given a required GTIN-style identifier is missing and no exemption path exists, when validation completes, then the row is blocked in the correct readiness state and the issue is shown as submission-critical.
3. Given a row fails variant or image validation, when the result is shown to the operator, then the row detail identifies the failed rule area clearly and the batch workspace distinguishes it from non-blocking warnings.
4. Given an image compliance rule evaluates a row, when image evidence is required, then the system evaluates the image assets referenced by the persisted `image_id` values and uses server-side R2 asset metadata or preview access rather than trusting client-supplied filenames.

## Tasks / Subtasks

- [ ] Add deterministic validation rule model (AC: 1)
  - [ ] Define rule codes, severity levels, issue categories, remediation hints, and blocking behavior.
  - [ ] Persist validation outputs with row ID, batch ID, organization ID, row revision, and schema/rule version.
- [ ] Implement core validation rules (AC: 1, 2, 3, 4)
  - [ ] Identifier or exemption required.
  - [ ] Required attribute presence for the current MVP internal listing shape.
  - [ ] Basic variant structure placeholders that can block or warn without requiring Amazon integration.
  - [ ] Image evidence checks against persisted image asset references and preview readability/metadata where practical.
- [ ] Connect validation output to readiness state (AC: 1, 2, 3)
  - [ ] Block submission-critical failures into the correct readiness state.
  - [ ] Keep warnings separate from blockers.
  - [ ] Preserve not-enough-data outcomes when required facts are missing but user correction can resolve them.
- [ ] Surface validation results in existing Epic 3 views (AC: 2, 3)
  - [ ] Ensure Story 3.2 grid can show validation counts/status.
  - [ ] Ensure Story 3.3 row detail can show rule area, reason, and remediation hint.
- [ ] Add focused tests (AC: 1, 2, 3, 4)
  - [ ] Missing identifier blocks.
  - [ ] Missing required attribute blocks or needs input as defined.
  - [ ] Variant/image rule failures remain distinguishable.
  - [ ] R2 image evidence is referenced through server asset metadata/preview paths.

## Dev Notes

- Do not attempt full Amazon schema validation in this story. Build deterministic MVP rules sufficient to gate row readiness and produce explainable row-level results.
- Existing intake rows currently normalize title and brand and hold original/resolved image IDs. Validation may need to infer required fields from these normalized fields until later epics add richer catalog data.
- Image validation must build on `image_assets` and persisted intake `resolvedAssets`, not filenames from client-side CSVs.

### Technical Requirements

- Validation results must be persisted in Neon or in the persisted review/readiness JSON with enough structure to query and explain them.
- Rule output should include: `ruleCode`, `category`, `severity`, `field`, `message`, `remediationHint`, `blocking`, and evidence refs.
- Keep validation deterministic and idempotent for unchanged row revision/input.
- Do not collapse validation failures into generic service errors.

### Architecture Compliance

- Schema-sensitive validation and schema-version traceability are architecture requirements. [Source: `_bmad-output/planning-artifacts/architecture.md#Core Architectural Requirements`]
- Never collapse validation blockers into generic 500-style application errors. [Source: `_bmad-output/planning-artifacts/architecture.md#Error Semantics`]
- Row-level validation responses must expose status, blocking reasons, warnings, and next-action guidance. [Source: `_bmad-output/planning-artifacts/architecture.md#API Patterns`]

### UX Requirements

- Batch and row views must distinguish warnings from submission-blocking issues in text and visual treatment. [Source: `_bmad-output/planning-artifacts/epics.md#FR15`]
- Row detail must show the failed rule area clearly and provide the next useful action.

### Previous Story Intelligence

- Stories 3.1-3.3 establish readiness state, triage grid, and row detail. This story enriches their persisted issue/evidence model with concrete validation rules.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/server/bulk-sku-api.ts`
  - `apps/web/src/lib/api-client/batches.ts`
  - `apps/web/src/routes/pages/TriageWorkspace.tsx`
  - `apps/web/src/routes/pages/RowInspector.tsx`
  - focused tests under `apps/web/src/test`

### Testing Requirements

- Run `npm run test:web`.
- Run `npm run lint:web`.
- Run `npm run build:web`.
- Add validation-focused tests that verify persisted rule outputs and visible UI distinctions.

### Scope Boundaries

- In scope: MVP deterministic validation rules and persisted explainable outputs.
- Out of scope: live Amazon catalog/schema API calls, submission payload construction, AI enrichment.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.4`]
- PRD validation requirements: [Source: `_bmad-output/planning-artifacts/epics.md#FR10`]
- Architecture validation semantics: [Source: `_bmad-output/planning-artifacts/architecture.md#Process Patterns`]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List

