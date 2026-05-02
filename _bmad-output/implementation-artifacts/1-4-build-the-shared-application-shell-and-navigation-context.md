# Story 1.4: Build the Shared Application Shell and Navigation Context

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a signed-in user,
I want a stable shell with correct navigation and context-preserving app structure,
so that I can move through the product consistently as deeper features are added.

## Acceptance Criteria

1. Authenticated users with an active organization see a desktop-first shell with organization context and primary navigation for batches, defaults, support, and admin.
2. Shared navigation is driven by real route structure and active context rather than embedded demo entity IDs or prototype-only assumptions.
3. The shell exposes stable provider boundaries for auth, active organization, and server-state wiring so later stories can plug into it without reworking the foundation.

## Tasks / Subtasks

- [x] Stabilize the shell layout as the canonical app frame (AC: 1)
  - [x] Make the canonical shell route/layout the shared frame for protected product screens.
  - [x] Preserve the generated visual direction and desktop-first density.
  - [x] Ensure org context is surfaced in header/sidebar locations consistently.

- [x] Remove shell-level demo assumptions from navigation (AC: 2)
  - [x] Replace hardcoded batch/row demo navigation links in shared sidebar behavior.
  - [x] Keep navigation focused on real route areas, not preselected entity instances.
  - [x] Preserve room for later context-aware deep links without binding the shell to fake IDs.

- [x] Create stable provider and app-context boundaries (AC: 3)
  - [x] Separate shell providers from feature/page content.
  - [x] Expose shared boundaries for auth context, active organization, and TanStack Query.
  - [x] Ensure later feature stories can mount into the shell without moving app root logic again.

- [x] Normalize route-area structure and breadcrumbs/context (AC: 1, 2, 3)
  - [x] Organize route groups around batches, defaults, support, admin, and utility areas.
  - [x] Replace placeholder shell breadcrumb/search context strings where they currently imply fake product state.
  - [x] Preserve UX consistency for navigation hierarchy and action emphasis.

- [x] Validate shell behavior (AC: 1, 2, 3)
  - [x] Signed-in user with active org
  - [x] route transitions across major areas
  - [x] shell rendering without hardcoded entity state

## Dev Notes

- This story is about the shared shell and navigation context, not feature data loading.
- Do not wire real batch list, row detail, or support data yet.
- Do not implement deep role-specific policy gating beyond what is needed to keep the shell coherent.

### Previous Story Intelligence

- Story `1.1` removed prototype corruption and aligned structure; Story `1.2` added auth entry; Story `1.3` introduced active org context. This story should unify those foundations into a stable product shell, not reopen their scopes. [Source: previous Epic 1 story files]
- The frontend review identified hardcoded demo route links and fake shell context as a major structural issue. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]

### Technical Requirements

- UX requires a persistent organization-aware shell with primary navigation by workflow area. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#UX Pattern Analysis & Inspiration`, `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`]
- Architecture expects route-based screens, small local UI state, shared providers, and TanStack Query-backed server-state seams. [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- The shell must remain frontend-only and not absorb backend orchestration logic. [Source: `_bmad-output/planning-artifacts/architecture.md#Architectural Boundaries`]

### Architecture Compliance

- Shared shell should align to:
  - `app/providers`
  - `app/layouts`
  - `app/guards`
  - route-area modules
  [Source: `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`]
- Query provider remains global, but business truth remains server-owned. This story should expose the right seams, not fake real data with new mock state. [Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`]

### Library / Framework Requirements

- React Router declarative routing remains acceptable for the current frontend baseline; use layout composition and shared route wrappers rather than page-specific hacks. [Source: `listing-workbench/src/App.tsx`, `https://reactrouter.com/start/declarative/installation`]
- TanStack Query provider is already present in the prototype root. Preserve and normalize it as a shell-level provider boundary for later stories. [Source: `listing-workbench/src/App.tsx`, `https://tanstack.com/query/latest/docs/framework/react/installation`]

### File Structure Requirements

- High-probability update targets:
  - canonical shell/layout modules
  - canonical router/root route file
  - sidebar/navigation modules
  - shared provider composition modules
- Prototype references to inspect:
  - `listing-workbench/src/components/AppShell.tsx`
  - `listing-workbench/src/components/AppSidebar.tsx`
  - `listing-workbench/src/App.tsx`

### Testing Requirements

- Add shell-focused smoke coverage for:
  - signed-in shell render
  - route-area navigation render
  - absence of hardcoded entity paths in shared nav
- Keep tests at shell/navigation level, not feature-data level.

### Current State Analysis

- `listing-workbench/src/components/AppSidebar.tsx` currently hardcodes review links to one demo batch and one demo row, which is incompatible with the target shell model. [Source: `listing-workbench/src/components/AppSidebar.tsx`]
- `listing-workbench/src/components/AppShell.tsx` includes prototype breadcrumb/search placeholders and mojibake; the shell concept is useful, but the current state is not canonical. [Source: `listing-workbench/src/components/AppShell.tsx`]
- The prototype already has strong visual shell patterns, so this story should preserve them while replacing fake navigation assumptions. [Source: `listing-workbench/docs/frontend-implementation-status.md#Visual and UX Coverage`]

### Scope Boundaries

- In scope:
  - shared shell
  - route-area navigation
  - shell provider composition
  - organization-aware shell context display
- Out of scope:
  - real feature data loading
  - saved-view persistence
  - role-complete access matrix

### Implementation Guidance

- Prefer route-area shells over one-off shell wrappers embedded into each page.
- Remove hardcoded deep links from the shared nav; if a screen needs entity context later, let feature routes provide it.
- Keep utility/demo screens from hijacking the main product shell hierarchy unless they are intentionally retained.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.4`]
- Previous story files: [Source: `_bmad-output/implementation-artifacts/1-1-set-up-the-frontend-foundation-from-the-approved-starter-and-clean-the-generated-prototype.md`, `_bmad-output/implementation-artifacts/1-2-implement-authentication-and-protected-app-entry.md`, `_bmad-output/implementation-artifacts/1-3-implement-organization-workspace-selection-and-active-context.md`]
- Architecture frontend + structure: [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`, `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`]
- UX shell/navigation expectations: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#UX Pattern Analysis & Inspiration`, `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- Prototype shell files: [Source: `listing-workbench/src/components/AppShell.tsx`, `listing-workbench/src/components/AppSidebar.tsx`, `listing-workbench/src/App.tsx`]
- Frontend review docs: [Source: `listing-workbench/docs/frontend-gap-analysis.md`, `listing-workbench/docs/frontend-implementation-status.md`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- No git repository detected at repo root during story generation.
- Multiple TSX pages contained redundant shell wrappers and breadcrumb demo strings; refactor introduced JSX nesting issues that were resolved during test runs.

### Completion Notes List

- Centralized the canonical protected-shell layout as a route-level wrapper and removed per-page shell wrappers.
- Added route-driven breadcrumbs via a single layout resolver, eliminating demo breadcrumb strings that implied fake product state.
- Kept shared navigation focused on route areas (batches/settings/support/admin) and verified shared nav remains free of entity deep links.
- Verified: `npm run test:web`, `npm run lint:web`.

### File List

- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/web/src/app/layouts/AppShellLayout.tsx
- apps/web/src/app/routes/route-config.tsx
- apps/web/src/routes/pages/AdminGovernance.tsx
- apps/web/src/routes/pages/AIReview.tsx
- apps/web/src/routes/pages/BatchesList.tsx
- apps/web/src/routes/pages/CreateBatch.tsx
- apps/web/src/routes/pages/Dashboard.tsx
- apps/web/src/routes/pages/FailureRecovery.tsx
- apps/web/src/routes/pages/ImagePlan.tsx
- apps/web/src/routes/pages/IntakeMapping.tsx
- apps/web/src/routes/pages/RowInspector.tsx
- apps/web/src/routes/pages/SavedViews.tsx
- apps/web/src/routes/pages/SellerDefaults.tsx
- apps/web/src/routes/pages/StatesShowcase.tsx
- apps/web/src/routes/pages/SubmissionMonitor.tsx
- apps/web/src/routes/pages/SubmissionScope.tsx
- apps/web/src/routes/pages/SupportInvestigation.tsx
- apps/web/src/routes/pages/TriageWorkspace.tsx
- apps/web/src/test/shell-navigation.test.tsx

### Change Log

- 2026-05-02: Introduced route-level shell layout with breadcrumb resolver, refactored pages to render inside the shared shell, and added shell navigation smoke tests.
