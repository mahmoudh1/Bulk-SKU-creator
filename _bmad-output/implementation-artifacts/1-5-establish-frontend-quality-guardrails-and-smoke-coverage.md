# Story 1.5: Establish Frontend Quality Guardrails and Smoke Coverage

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a development team,
I want baseline frontend quality checks and smoke coverage,
so that later feature work does not compound instability in the product shell.

## Acceptance Criteria

1. The frontend includes meaningful smoke coverage for the auth entry flow, workspace flow, and shared shell rendering, and those checks can run locally and in CI.
2. The development baseline enforces lint as part of normal quality checks and covers obvious regressions in protected-route and shell behavior.
3. Easy route-level performance wins such as code splitting are applied where practical without destabilizing the shell.

## Tasks / Subtasks

- [ ] Replace placeholder-only tests with meaningful smoke coverage (AC: 1)
  - [ ] Add route-render or integration-style coverage for auth entry.
  - [ ] Add flow coverage for workspace selection / active org handoff.
  - [ ] Add shell-render coverage for signed-in protected app state.

- [ ] Make lint and baseline quality checks part of the working contract (AC: 2)
  - [ ] Ensure lint is clean or intentionally scoped for the canonical frontend target.
  - [ ] Document or wire the expected local quality commands.
  - [ ] Cover obvious regressions around protected routes and shell rendering.

- [ ] Add practical accessibility and UI-safety checks where they fit the smoke layer (AC: 1, 2)
  - [ ] Verify focus-safe shell/auth/workspace render paths.
  - [ ] Ensure no regressions reintroduce purely visual-only protected behavior.
  - [ ] Keep checks lightweight enough for routine use.

- [ ] Apply easy route-level performance wins (AC: 3)
  - [ ] Introduce code splitting or lazy route loading where it is low risk and clearly beneficial.
  - [ ] Avoid destabilizing provider composition or route guards.
  - [ ] Document any larger performance work that should stay deferred.

- [ ] Validate the quality baseline (AC: 1, 2, 3)
  - [ ] Tests run locally
  - [ ] lint runs locally
  - [ ] canonical shell still builds and renders

## Dev Notes

- This story is about baseline quality guardrails, not deep feature test suites.
- Do not expand into full end-to-end workflow automation for later batch/triage/submission features.
- Keep the checks focused on the foundational UX surfaces created in Epic 1.

### Previous Story Intelligence

- Story `1.1` intentionally limited quality work to migration safety and deferred the broader baseline to this story. [Source: `_bmad-output/implementation-artifacts/1-1-set-up-the-frontend-foundation-from-the-approved-starter-and-clean-the-generated-prototype.md#Testing Requirements`]
- Story `1.2` and `1.3` establish real auth and workspace flows; those are the flows this story should smoke-test rather than mock. [Source: Epic 1 story files]
- Story `1.4` establishes the canonical shell and navigation context; this story should treat that shell as the foundation under test. [Source: `_bmad-output/implementation-artifacts/1-4-build-the-shared-application-shell-and-navigation-context.md`]

### Technical Requirements

- Frontend review found only a placeholder example test, plus unresolved lint failures and oversized single-bundle output. This story is the place to convert those findings into a real baseline. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Medium Gaps`, `listing-workbench/docs/frontend-implementation-status.md#Quality Check Results`]
- UX accessibility baseline requires keyboard-reachable core flows, text-based status communication, readable contrast, and stable shell interactions. Even if this story does not implement all accessibility work, it should guard the highest-risk foundational surfaces. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`]

### Architecture Compliance

- Testing should align to the architecture split:
  - frontend shell and route tests here
  - backend/API/worker testing later in their own stories
  [Source: `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`]
- Keep quality checks compatible with the canonical frontend target and avoid re-centering work on the old `listing-workbench` artifact.

### Library / Framework Requirements

- Existing local test stack already includes `vitest`, Testing Library, and `jsdom`; use the current stack unless Story `1.1` changed it for the canonical frontend target. [Source: `listing-workbench/package.json`]
- Current example test file is only a placeholder and should not remain the only meaningful signal. [Source: `listing-workbench/src/test/example.test.ts`, `listing-workbench/docs/frontend-implementation-status.md#Tests`]
- TanStack Query and React Router shell flows should be tested in the canonical render path, but do not attempt to cover all feature-query behavior here. [Source: architecture + local prototype root]

### File Structure Requirements

- High-probability update targets:
  - canonical test setup
  - canonical route/shell smoke tests
  - lint/config scripts if needed
  - route modules if lazy loading is added
- Prototype references to inspect:
  - `listing-workbench/src/test/example.test.ts`
  - `listing-workbench/src/test/setup.ts`
  - `listing-workbench/eslint.config.js`
  - canonical shell/auth/workspace modules created in earlier Epic 1 stories

### Testing Requirements

- Minimum desired coverage for this story:
  - signed-out to auth entry
  - signed-in shell render
  - workspace entry/render path
  - shell route smoke
- If code splitting is added, ensure test imports and route render behavior still work predictably.

### Current State Analysis

- The current prototype has `npm test` passing only because of a placeholder example test. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Verification Summary`]
- The current prototype has `npm run lint` failing due to explicit `any`, empty object type issues, and config problems. [Source: `listing-workbench/docs/frontend-implementation-status.md#Quality Check Results`]
- Production build currently emits a large bundle warning around `503 kB`; this story should take only easy low-risk route-splitting wins, not attempt a full performance refactor. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Verification Summary`]

### Scope Boundaries

- In scope:
  - smoke/integration-level frontend tests for Epic 1 foundations
  - lint as a stable baseline
  - low-risk route-level code splitting
- Out of scope:
  - full feature-suite coverage for later epics
  - backend integration tests
  - exhaustive accessibility audits across the entire product

### Implementation Guidance

- Favor a few high-signal shell/auth/workspace tests over many shallow snapshot tests.
- If code splitting is introduced, apply it where route boundaries are already obvious.
- Avoid adding brittle tests that lock the implementation to transient generated markup details.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.5`]
- Previous story files: [Source: `_bmad-output/implementation-artifacts/1-1-set-up-the-frontend-foundation-from-the-approved-starter-and-clean-the-generated-prototype.md`, `_bmad-output/implementation-artifacts/1-2-implement-authentication-and-protected-app-entry.md`, `_bmad-output/implementation-artifacts/1-3-implement-organization-workspace-selection-and-active-context.md`, `_bmad-output/implementation-artifacts/1-4-build-the-shared-application-shell-and-navigation-context.md`]
- UX accessibility/testing expectations: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`]
- Frontend review docs: [Source: `listing-workbench/docs/frontend-gap-analysis.md`, `listing-workbench/docs/frontend-implementation-status.md`]
- Local test/config files: [Source: `listing-workbench/package.json`, `listing-workbench/src/test/setup.ts`, `listing-workbench/src/test/example.test.ts`, `listing-workbench/eslint.config.js`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- No git repository detected at repo root during story generation.

### Completion Notes List

- To be filled by dev agent during implementation

### File List

- To be filled by dev agent during implementation
