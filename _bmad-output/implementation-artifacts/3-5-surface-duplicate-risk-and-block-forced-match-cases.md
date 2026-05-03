# Story 3.5: Surface Duplicate Risk and Block Forced-Match Cases

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want duplicate risk surfaced and forced-match cases blocked from the default path,
so that the system never silently changes listing mode.

## Acceptance Criteria

1. Given a row shows potential duplicate or catalog conflict signals, when readiness processing completes, then the operator sees a duplicate-risk warning in the review workflow and the row is not automatically switched into an existing-ASIN or offer flow.
2. Given pre-submission or catalog behavior indicates Amazon would force a match to an existing ASIN, when the system detects that condition, then the row is blocked from default automated submission and the blocked reason explicitly references forced-match protection.
3. Given duplicate risk is informational but forced-match is disqualifying for the default workflow, when both conditions are considered, then the system distinguishes warning-grade duplicate signals from hard-stop forced-match outcomes and preserves the new-product-only policy boundary.
4. Given duplicate or forced-match signals are produced, when the row is later inspected by operations or support users, then the persisted readiness evidence includes the signal source, severity, and decision outcome and the UI can explain the outcome without re-querying a mock catalog response.

## Tasks / Subtasks

- [ ] Add duplicate/forced-match signal model (AC: 1, 2, 3, 4)
  - [ ] Define signal types, severity, signal source, matched identifier/title hints, decision outcome, and remediation hint.
  - [ ] Persist signals with row revision and organization/batch scoping.
- [ ] Implement deterministic MVP signal detection (AC: 1, 2, 3)
  - [ ] Support duplicate-risk warnings from local persisted row evidence, e.g. same GTIN/SKU/title within current org/batch where available.
  - [ ] Support forced-match hard stop from an explicit testable field/signal in persisted row data rather than live Amazon calls.
  - [ ] Keep warning-grade duplicate risk separate from blocking forced-match outcomes.
- [ ] Surface outcomes in grid and row detail (AC: 1, 2, 3, 4)
  - [ ] Show duplicate risk as warning.
  - [ ] Show forced-match as blocker/new-product-only policy protection.
  - [ ] Do not route rows into existing-ASIN/offer workflows.
- [ ] Add focused tests (AC: 1, 2, 3, 4)
  - [ ] Duplicate risk produces warning without changing listing mode.
  - [ ] Forced-match produces blocker and submission-ineligible readiness state.
  - [ ] Persisted signal evidence is displayed without mock catalog fallback.

## Dev Notes

- MVP product policy is new-product-only. Forced-match detection must block default automated submission rather than silently changing listing mode.
- This story should not require Amazon SP-API integration. Model the signals and UI/persistence path now; later submission stories can replace or augment signal sources.
- Keep the language precise: duplicate risk can be informational; forced match is a hard stop for the default path.

### Technical Requirements

- Persist signal source and decision outcome so support/admin views can explain the result later.
- Avoid mock catalog responses in UI. If test data simulates forced match, it must be stored in the same persisted row/readiness evidence shape the UI consumes.
- Use explicit issue codes such as `DUPLICATE_RISK_WARNING` and `FORCED_MATCH_BLOCKED` or equivalent consistent names.
- Forced-match blockers must affect readiness eligibility; duplicate warnings alone should not necessarily block readiness.

### Architecture Compliance

- Product-type resolution, identifier handling, duplicate risk, and forced-match detection need auditable decision paths. [Source: `_bmad-output/planning-artifacts/architecture.md#Key Design Decisions`]
- Retry/submission behavior must not create silent duplicate submission behavior. [Source: `_bmad-output/planning-artifacts/architecture.md#Process Patterns`]
- New-product-only policy must be preserved through readiness and submission. [Source: `_bmad-output/planning-artifacts/epics.md#FR53`]

### UX Requirements

- Duplicate risk and forced-match blockers must be visible in row detail and grid summaries with text labels and next-action guidance.
- Do not overload generic "blocked" messaging; explicitly name forced-match protection.

### Previous Story Intelligence

- Story 3.4 establishes validation rule output. This story can reuse the same issue/evidence display model but must keep duplicate/forced-match as distinct rule categories.

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
- Add tests proving duplicate warnings and forced-match blockers are different.

### Scope Boundaries

- In scope: persisted signal model, deterministic MVP detection, UI explanation.
- Out of scope: live Amazon catalog matching, offer listing workflow, submission execution.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.5`]
- New-product policy: [Source: `_bmad-output/planning-artifacts/epics.md#FR53`]
- Architecture duplicate/forced-match requirements: [Source: `_bmad-output/planning-artifacts/architecture.md#Key Design Decisions`]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List

