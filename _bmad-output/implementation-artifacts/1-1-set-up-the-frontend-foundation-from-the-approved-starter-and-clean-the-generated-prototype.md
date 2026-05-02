# Story 1.1: Set Up the Frontend Foundation from the Approved Starter and Clean the Generated Prototype

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the frontend initialized from the approved starter and the generated prototype cleaned into that structure,
so that subsequent feature stories can be implemented on a stable and maintainable base.

## Acceptance Criteria

1. The frontend codebase is established on the approved Vite + React + TypeScript starter foundation, and the generated `listing-workbench` prototype is adopted into that foundation instead of remaining an unstructured standalone artifact.
2. Visible mojibake and text-encoding corruption are removed from user-facing screens, and hardcoded demo batch and row IDs are removed from shared navigation and route assumptions.
3. The frontend is reorganized to an architecture-aligned structure for routes, features, shared UI, and API/query integration points, while preserving the generated screens as the visual baseline.
4. The project reaches a clean enough lint and type baseline for subsequent implementation work, without introducing new structure or dependency shortcuts that conflict with the approved architecture.

## Tasks / Subtasks

- [x] Bootstrap the approved frontend foundation (AC: 1)
  - [x] Create the workspace-aligned frontend target from the approved Vite + React + TypeScript starter rather than continuing with `listing-workbench` as the final app root.
  - [x] Add only the minimum root/workspace scaffolding needed to support the frontend target now.
  - [x] Treat `listing-workbench` as a migration source artifact until the new target builds successfully.

- [x] Migrate the generated prototype into the target app structure (AC: 1, 3)
  - [x] Move or adapt the current route-based screens, shared shell, and shared UI primitives into the architecture-aligned frontend location.
  - [x] Preserve the generated visual direction and screen inventory while removing prototype-only shortcuts.
  - [x] Keep future integration seams explicit: routes, features, shared UI, hooks, query layer, and API client layer.

- [x] Remove visible prototype corruption and hardcoded shell shortcuts (AC: 2)
  - [x] Fix mojibake in user-visible strings across shared shell and representative screens.
  - [x] Remove hardcoded demo entity navigation from shared shell and page entry points.
  - [x] Preserve route coverage, but do not implement protected-route behavior or workspace logic yet.

- [x] Establish the story-safe architecture baseline (AC: 3, 4)
  - [x] Normalize file/folder structure around route, feature, component, and shared library boundaries.
  - [x] Replace the most dangerous type and lint issues blocking disciplined follow-on work.
  - [x] Keep mock data isolated as a temporary prototype artifact, but do not build new behavior on top of it.

- [x] Validate the foundation handoff (AC: 4)
  - [x] Ensure the target frontend builds successfully after migration.
  - [x] Ensure lint reaches a usable baseline for follow-on stories.
  - [x] Document any intentionally deferred cleanup that belongs to later stories rather than silently expanding scope here.

## Dev Notes

- This story is a foundation and migration story, not an auth story and not an API integration story.
- Do not implement Clerk sign-in behavior, protected routes, organization selection logic, or real query/mutation wiring here. Those belong primarily to Stories `1.2`, `1.3`, and `1.4`.
- Do not redesign the UI. Preserve the generated visual baseline and triage-console direction while cleaning structure and removing prototype shortcuts.
- Do not overbuild the monorepo. Create only the root/workspace/frontend scaffolding needed for the frontend target to become the canonical app location.

### Technical Requirements

- The approved frontend foundation is Vite + React + TypeScript, not Next.js and not a framework swap. [Source: `_bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation`]
- The product architecture expects a split SaaS stack with a frontend that talks only to the application API. This story should prepare that frontend boundary, not violate it. [Source: `_bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions`]
- The current prototype already uses Vite, React, TypeScript, React Router, Tailwind, shadcn-style UI, and TanStack Query provider wiring. Preserve those strengths while migrating structure. [Source: `listing-workbench/docs/frontend-implementation-status.md#What Is Implemented`]
- The current prototype is not production-ready and must be treated as a migration source artifact. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Executive Summary`]

### Architecture Compliance

- Frontend target structure should align to the architecture direction:
  - app shell / providers / guards
  - route-based screens
  - feature/domain-first modules
  - shared `components/ui`
  - `lib/api-client`
  - `lib/query`
  - minimal local UI state, server state reserved for TanStack Query later
  [Source: `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`]
- Frontend must not directly absorb database, queue, Amazon SP-API, or backend orchestration responsibilities. [Source: `_bmad-output/planning-artifacts/architecture.md#Architectural Boundaries`]
- Preserve naming conventions already approved:
  - `PascalCase` components
  - `camelCase` code and JSON
  - feature/domain-first foldering
  [Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`]

### Library / Framework Requirements

- Use the approved Vite starter path for the canonical frontend foundation. Vite docs currently show `npm create vite@latest`, support the `react-ts` template, allow `.` as the target directory, and explicitly support monorepo setups. [Source: `https://vite.dev/guide/`]
- The current local prototype uses:
  - `vite ^5.4.19`
  - `react ^18.3.1`
  - `react-router-dom ^6.30.1`
  - `@tanstack/react-query ^5.83.0`
  [Source: `listing-workbench/package.json`]
- Do not opportunistically perform a React Router major-version migration in Story `1.1`. The prototype is already wired to `react-router-dom`, and route/auth semantics are handled in later stories. If the starter introduces a version reconciliation decision, document it rather than silently broadening scope. [Source: `listing-workbench/package.json`, `listing-workbench/src/App.tsx`]
- TanStack Query v5 is already present locally, and official docs continue to support React 18+ with `@tanstack/react-query`; keep the provider seam intact for later data-layer stories. [Source: `listing-workbench/package.json`, `https://tanstack.com/query/latest/docs/framework/react/installation`]
- Clerk Organizations is the approved tenancy model for later stories. For this story, prepare shell/provider boundaries that can host Clerk cleanly, but do not implement the auth flow yet. Official Clerk docs recommend exposing `OrganizationSwitcher` in shared navigation and using `useOrganization()` / `useOrganizationList()` for active-org context. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`, `https://clerk.com/docs/react/guides/organizations/getting-started`]

### File Structure Requirements

- Current prototype files that must be read before modification because they are likely update targets:
  - `listing-workbench/src/App.tsx`
  - `listing-workbench/src/components/AppSidebar.tsx`
  - `listing-workbench/src/components/AppShell.tsx`
  - `listing-workbench/src/pages/WorkspaceSelect.tsx`
  - `listing-workbench/src/data/mock.ts`
  - `listing-workbench/eslint.config.js`
  - `listing-workbench/tailwind.config.ts`
- Current source inventory is route-heavy under `src/pages` with shared primitives under `src/components/ui`. That is acceptable as a source artifact, but not the final structure for ongoing implementation. [Source: `listing-workbench/src` file inventory]
- Root repo currently contains no monorepo app structure yet; only `listing-workbench`, `_bmad`, `_bmad-output`, and empty `docs/`. Story `1.1` is responsible for establishing the canonical frontend location. [Source: repo root listing]

### Testing Requirements

- At minimum for this story:
  - build must pass for the canonical frontend target
  - lint must improve to a usable baseline
  - existing placeholder-only test setup must remain runnable if migrated
- Do not consume Story `1.5` by implementing the full quality-guardrail suite here. Limit testing in this story to foundation safety and migration verification. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.5`]

### Current State Analysis

- `listing-workbench/src/App.tsx` currently redirects `/` to `/dashboard` and exposes all product routes publicly. That is acceptable only as current prototype state and should not be preserved as the canonical SaaS entry behavior. Story `1.1` should keep route coverage but not yet solve auth logic. [Source: `listing-workbench/src/App.tsx`]
- `listing-workbench/src/components/AppSidebar.tsx` hardcodes review links to `b_2041` and `r_88123` and includes visible mojibake in the shell subtitle. Those shortcuts must be removed here. [Source: `listing-workbench/src/components/AppSidebar.tsx`]
- `listing-workbench/src/pages/WorkspaceSelect.tsx` links every workspace to `/dashboard` and includes visible mojibake separators. The visual screen can be preserved, but organization behavior remains for Story `1.3`. [Source: `listing-workbench/src/pages/WorkspaceSelect.tsx`]
- `listing-workbench/src/data/mock.ts` is currently the app's behavioral backbone. It should remain a temporary source artifact only; new structural work should avoid deepening dependence on it. [Source: `listing-workbench/src/data/mock.ts`, `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]
- `listing-workbench/tailwind.config.ts` still uses `require("tailwindcss-animate")`, which was previously identified as part of the lint/type hygiene problem set. [Source: `listing-workbench/tailwind.config.ts`, `listing-workbench/docs/frontend-implementation-status.md#Quality Check Results`]

### Scope Boundaries

- In scope:
  - canonical frontend target creation from approved starter
  - migration of existing generated screens into canonical target
  - structure cleanup
  - mojibake cleanup
  - removal of hardcoded shared-shell demo links
  - usable lint/type baseline
- Out of scope:
  - Clerk auth implementation
  - organization persistence logic
  - protected-route enforcement
  - API client implementation
  - real query hooks and mutations
  - replacing mock data with live backend behavior
  - full testing strategy rollout

### Implementation Guidance

- Preferred implementation path:
  1. Create the canonical frontend target from the approved Vite React TS starter in the final app location.
  2. Move shared styles, primitives, and route screens from `listing-workbench` into that target.
  3. Reshape file layout to match the approved route/feature/shared structure.
  4. Remove shell-level prototype corruption and hardcoded navigation assumptions.
  5. Reconcile config, aliases, Tailwind, test setup, and lint so the migrated target builds cleanly.
- Keep `listing-workbench` available as a migration reference until the new target is verified.
- If a migration requires temporary compatibility shims, document them in the completion notes rather than hiding them.

### Project Structure Notes

- Planned architecture expects a monorepo-style structure centered on `apps/web`. The current prototype is a standalone Vite app in `listing-workbench`, so there is an intentional structural mismatch to resolve. [Source: `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`]
- Because no backend apps or shared packages exist yet, this story should scaffold only what the frontend foundation needs now. Avoid speculative backend package creation beyond directory or config placeholders needed for workspace stability.
- No `project-context.md` file was found, and no git repository was detected at the repo root during story analysis. Do not rely on git history or local project-context facts for implementation guidance.

### References

- Story definition and acceptance criteria: [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.1`]
- Frontend starter and monorepo-capable Vite setup: [Source: `https://vite.dev/guide/`]
- Architecture starter and stack decisions: [Source: `_bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation`]
- Architecture boundaries and structure: [Source: `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`]
- Architecture patterns and naming rules: [Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`]
- UX shell and workspace expectations: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- UX design-system and shell direction: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation`, `_bmad-output/planning-artifacts/ux-design-specification.md#User Journey Flows`]
- Prototype gap analysis: [Source: `listing-workbench/docs/frontend-gap-analysis.md`]
- Prototype implementation status: [Source: `listing-workbench/docs/frontend-implementation-status.md`]
- Current package/runtime versions: [Source: `listing-workbench/package.json`]
- Current route shell and prototype shortcuts: [Source: `listing-workbench/src/App.tsx`, `listing-workbench/src/components/AppSidebar.tsx`, `listing-workbench/src/pages/WorkspaceSelect.tsx`, `listing-workbench/src/data/mock.ts`]
- Clerk organization shell guidance: [Source: `https://clerk.com/docs/react/guides/organizations/getting-started`]
- React Router Vite declarative installation baseline: [Source: `https://reactrouter.com/start/declarative/installation`]
- TanStack Query React installation and React 18+ compatibility: [Source: `https://tanstack.com/query/latest/docs/framework/react/installation`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- No git repository detected at repo root during story generation.
- No previous story file existed because this is the first implementation story.

### Completion Notes List

- Created the canonical frontend target in `apps/web` from the approved Vite React TypeScript starter and added minimal root workspace scaffolding in `package.json`.
- Migrated the generated prototype into `apps/web/src` with explicit `app`, `routes`, `components/ui`, `lib/query`, `lib/api-client`, and mock seam structure while keeping `listing-workbench` as the source artifact.
- Reconciled the generated starter back to the approved prototype-compatible stack baseline (`react` 18, `react-router-dom` 6, Vite 5, TanStack Query 5) instead of silently broadening scope into a framework-version migration.
- Removed visible shell/workspace mojibake and replaced hardcoded shared-shell and page-entry demo route assumptions with explicit route helpers and centralized prototype defaults.
- Added routing safety tests and verified `npm run lint:web`, `npm run test:web`, and `npm run build:web` all pass from the root workspace.
- Deferred deeper prototype-content cleanup and route-level code splitting to later stories; the current baseline keeps the generated screen inventory intact for follow-on feature work.

### File List

- package.json
- package-lock.json
- apps/web/components.json
- apps/web/eslint.config.js
- apps/web/index.html
- apps/web/package.json
- apps/web/postcss.config.js
- apps/web/tailwind.config.ts
- apps/web/tsconfig.app.json
- apps/web/tsconfig.json
- apps/web/tsconfig.node.json
- apps/web/vite.config.ts
- apps/web/vitest.config.ts
- apps/web/public/favicon.ico
- apps/web/public/placeholder.svg
- apps/web/public/robots.txt
- apps/web/src/index.css
- apps/web/src/main.tsx
- apps/web/src/vite-env.d.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/providers/AppProviders.tsx
- apps/web/src/app/routes/paths.ts
- apps/web/src/app/routes/route-config.tsx
- apps/web/src/components/AppShell.tsx
- apps/web/src/components/AppSidebar.tsx
- apps/web/src/components/NavLink.tsx
- apps/web/src/components/StatusChip.tsx
- apps/web/src/components/shell/AppShell.tsx
- apps/web/src/components/shell/AppSidebar.tsx
- apps/web/src/components/ui/*
- apps/web/src/data/mock.ts
- apps/web/src/hooks/use-mobile.tsx
- apps/web/src/hooks/use-toast.ts
- apps/web/src/lib/utils.ts
- apps/web/src/lib/api-client/index.ts
- apps/web/src/lib/mocks/prototype-data.ts
- apps/web/src/lib/mocks/route-defaults.ts
- apps/web/src/lib/query/queryClient.ts
- apps/web/src/routes/pages/*
- apps/web/src/test/app-routing.test.tsx
- apps/web/src/test/example.test.ts
- apps/web/src/test/setup.ts

### Change Log

- 2026-04-26: Created the canonical `apps/web` frontend foundation, migrated the prototype into the approved structure, cleaned shell/navigation shortcuts, and validated lint, tests, and production build.
