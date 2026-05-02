# Story 1.3: Implement Organization Workspace Selection and Active Context

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user who belongs to one or more organizations,
I want to select and persist my active workspace,
so that the application consistently uses the correct organization context.

## Acceptance Criteria

1. Authenticated users can select an active workspace when multiple organizations are available, and the chosen workspace is preserved for subsequent navigation.
2. The active organization context is shown in the UI and made available to the application shell and route boundaries.
3. Users with only one valid organization can resolve into an active workspace without unnecessary friction while still using the same underlying context model.

## Tasks / Subtasks

- [x] Implement active-organization context wiring on top of Clerk auth (AC: 1, 2)
  - [x] Use Clerk Organizations hooks/components to access active organization and memberships.
  - [x] Introduce an app-level organization context seam that later stories can consume.
  - [x] Keep org context separate from backend data loading for now.

- [x] Replace prototype workspace-selection behavior with real org selection (AC: 1, 3)
  - [x] Remove the current fake workspace cards that all route to `/dashboard`.
  - [x] Make workspace selection derive from actual authenticated organization membership state.
  - [x] Support the single-org path without maintaining a fake intermediate screen where not needed.

- [x] Surface active organization in the shared shell (AC: 2)
  - [x] Make the shell header/sidebar show the current workspace context.
  - [x] Prepare shared shell seams for later organization-aware navigation and data loading.
  - [x] Ensure no hardcoded organization display strings remain as authoritative workspace state.

- [x] Persist and restore active workspace context safely (AC: 1, 3)
  - [x] Ensure refresh/navigation does not drop the selected active organization unexpectedly.
  - [x] Keep route/session behavior predictable when the active organization changes.
  - [x] Preserve compatibility with later protected-route and role-aware stories.

- [x] Validate organization-entry flows (AC: 1, 2, 3)
  - [x] Multi-organization user flow
  - [x] Single-organization user flow
  - [x] No-active-organization or unresolved-state flow

## Dev Notes

- This story assumes Story `1.2` established Clerk auth and protected entry.
- Do not implement role-gated support/admin content here; that belongs later.
- Do not implement real backend organization-scoped queries yet; this story is about frontend active-context correctness and shell behavior.

### Previous Story Intelligence

- Story `1.1` preserved the Workspace Select screen visually but explicitly deferred real organization behavior to this story. [Source: `_bmad-output/implementation-artifacts/1-1-set-up-the-frontend-foundation-from-the-approved-starter-and-clean-the-generated-prototype.md#Current State Analysis`]
- Story `1.2` should have established Clerk and protected app entry. Build on that provider/session layer rather than inventing parallel org state. [Source: `_bmad-output/implementation-artifacts/1-2-implement-authentication-and-protected-app-entry.md#Technical Requirements`]

### Technical Requirements

- Architecture explicitly chose Clerk Organizations for the SaaS workspace model. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]
- UX requires a persistent workspace shell with clear organization context and a workspace-entry flow that does not throw users directly into ambiguous product state. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Executive Summary`, `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- Frontend review identified missing active organization state, missing organization-scoped routing, and a visual-only workspace selector as critical gaps. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]

### Architecture Compliance

- Active organization state must become part of shared app context and shell state, not scattered local page state. [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Preserve the approved shell/provider/guard boundaries and prepare later organization-scoped query keys such as `['batches', organizationId]` without implementing the full backend integration yet. [Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`]

### Library / Framework Requirements

- Clerk Organizations docs recommend:
  - `OrganizationSwitcher`
  - `useOrganization()`
  - `useOrganizationList()`
  for active-org access and membership display. [Source: `https://clerk.com/docs/react/guides/organizations/getting-started`]
- Clerk route/org protection guidance also uses active organization presence plus auth/role checks; that pattern should shape the future shell, even if this story stops short of full authorization. [Source: `https://clerk.com/docs/guides/organizations/control-access/check-access`]

### File Structure Requirements

- High-probability update targets:
  - canonical workspace selection route/page
  - canonical app shell/header/sidebar
  - app providers/context modules
  - protected-route entry logic introduced in Story `1.2`
- Prototype references to inspect:
  - `listing-workbench/src/pages/WorkspaceSelect.tsx`
  - `listing-workbench/src/components/AppShell.tsx`
  - `listing-workbench/src/components/AppSidebar.tsx`

### Testing Requirements

- Add flow coverage for:
  - multi-org user chooses active workspace
  - single-org user resolves automatically or with minimal friction
  - shell reflects active org context after selection
- Keep tests scoped to org-entry behavior, not backend data-loading.

### Current State Analysis

- `listing-workbench/src/pages/WorkspaceSelect.tsx` currently renders mock org cards and routes all of them to `/dashboard`, discarding real organization identity entirely. [Source: `listing-workbench/src/pages/WorkspaceSelect.tsx`]
- `listing-workbench/src/components/AppShell.tsx` currently hardcodes `"Hearth & Loom Trading · Operations"` in breadcrumbs/header fallback, which is not a real active-org implementation. [Source: `listing-workbench/src/components/AppShell.tsx`]
- Current prototype shell and sidebar treat workspace identity as hardcoded display text, not session-backed state. [Source: `listing-workbench/src/components/AppSidebar.tsx`, `listing-workbench/src/components/AppShell.tsx`]

### Scope Boundaries

- In scope:
  - active org selection
  - shell-level active org display
  - session-consistent org context behavior
- Out of scope:
  - role-specific admin/support gating
  - backend org data fetches
  - live organization management beyond selection/switching

### Implementation Guidance

- If Clerk can guarantee an active organization once enabled, use that as the canonical source of truth and avoid creating a second local org-selection state machine.
- Prefer an organization-aware app provider or route loader seam that later stories can reuse.
- Preserve the visual strengths of the current Workspace Select screen, but remove fake org data as the source of truth.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.3`]
- Previous story files: [Source: `_bmad-output/implementation-artifacts/1-1-set-up-the-frontend-foundation-from-the-approved-starter-and-clean-the-generated-prototype.md`, `_bmad-output/implementation-artifacts/1-2-implement-authentication-and-protected-app-entry.md`]
- Architecture auth/tenancy: [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]
- UX shell/workspace expectations: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Executive Summary`, `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- Prototype workspace and shell files: [Source: `listing-workbench/src/pages/WorkspaceSelect.tsx`, `listing-workbench/src/components/AppShell.tsx`, `listing-workbench/src/components/AppSidebar.tsx`]
- Frontend review docs: [Source: `listing-workbench/docs/frontend-gap-analysis.md`, `listing-workbench/docs/frontend-implementation-status.md`]
- Clerk Organizations docs: [Source: `https://clerk.com/docs/react/guides/organizations/getting-started`, `https://clerk.com/docs/guides/organizations/control-access/check-access`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- No git repository detected at repo root during story generation.
- Local test environment required fixing executable flags for node_modules binaries and running npm install to restore missing optional dependencies (rollup native).

### Completion Notes List

- Implemented app-level org context seam backed by Clerk Organizations hooks and consumed by shell + route boundary.
- Replaced workspace selector mock data with real organization membership-driven selection that sets active org and returns to intended route.
- Added OrganizationBoundary to enforce an active org for org-scoped routes (auto-select single org, redirect multi-org to selector, handle no-org state).
- Updated shell header/sidebar to render active workspace and removed hardcoded workspace identity in shell defaults.
- Added tests for workspace selection + routing guard behavior.
- Verified: `npm run test:web`, `npm run lint:web`.

### File List

- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/web/src/app/organizations/OrganizationProvider.tsx
- apps/web/src/app/providers/AppProviders.tsx
- apps/web/src/app/routes/OrganizationBoundary.tsx
- apps/web/src/app/routes/route-config.tsx
- apps/web/src/components/shell/AppShell.tsx
- apps/web/src/components/shell/AppSidebar.tsx
- apps/web/src/routes/pages/Dashboard.tsx
- apps/web/src/routes/pages/WorkspaceSelect.tsx
- apps/web/src/test/app-routing.test.tsx
- apps/web/src/test/workspace-selection.test.tsx

### Change Log

- 2026-05-02: Implemented Clerk Organizations-backed workspace context + selection flow and added routing guard + tests.
