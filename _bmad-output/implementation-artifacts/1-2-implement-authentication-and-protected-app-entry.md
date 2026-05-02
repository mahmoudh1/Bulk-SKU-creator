# Story 1.2: Implement Authentication and Protected App Entry

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to authenticate into the product and be blocked from protected screens until I do,
so that only authorized users can access the application.

## Acceptance Criteria

1. Unauthenticated visitors who try to access protected product routes are redirected into the authentication entry flow and do not see protected content first.
2. Successful sign-in is implemented through Clerk on the frontend foundation created in Story `1.1`, and session context is globally available to the app shell.
3. The application no longer defaults anonymous users directly into `/dashboard` or equivalent protected screens.

## Tasks / Subtasks

- [x] Install and initialize Clerk in the canonical frontend app (AC: 2)
  - [x] Add the Clerk React SDK and required environment variable handling.
  - [x] Wrap the app entry with `<ClerkProvider>` in the canonical frontend root.
  - [x] Fail fast if the publishable key is missing in local development.

- [x] Replace the prototype auth mock flow with a real protected entry flow (AC: 1, 3)
  - [x] Remove the public `/ -> /dashboard` redirect behavior.
  - [x] Define public entry routes versus protected app routes.
  - [x] Ensure unauthenticated users are routed to auth entry instead of protected pages.

- [x] Wire Clerk-driven sign-in UI into the existing auth experience (AC: 2)
  - [x] Adapt the current Auth screen or replace it with Clerk-compatible sign-in entry without redesigning the product shell.
  - [x] Preserve the current visual intent while making the route real.
  - [x] Ensure post-auth navigation flows into workspace selection / app entry rather than directly into arbitrary pages.

- [x] Establish protected-route behavior for the canonical shell (AC: 1, 2)
  - [x] Add a route guard pattern or equivalent protected-layout approach.
  - [x] Ensure protected areas cannot render before auth state resolves.
  - [x] Keep auth-only behavior separate from organization-selection behavior, which belongs to Story `1.3`.

- [x] Validate auth entry behavior (AC: 1, 2, 3)
  - [x] Confirm signed-out access to protected routes redirects correctly.
  - [x] Confirm successful sign-in results in usable authenticated shell context.
  - [x] Confirm no anonymous path lands directly on dashboard-like screens.

## Dev Notes

- This story is about authentication and protected app entry only.
- Do not implement organization-selection persistence here; that belongs to Story `1.3`.
- Do not implement API integration here; use auth context and protected-shell boundaries only.
- Preserve the current generated auth screen's tone and layout direction where practical, but real auth behavior takes priority over the prototype's fake CTA links.

### Previous Story Intelligence

- Story `1.1` established the canonical frontend target and explicitly treated `listing-workbench` as a migration source artifact, not the long-term app root. Implement auth in the canonical frontend location created there, not back in the old prototype structure. [Source: `_bmad-output/implementation-artifacts/1-1-set-up-the-frontend-foundation-from-the-approved-starter-and-clean-the-generated-prototype.md#Implementation Guidance`]
- Story `1.1` intentionally deferred Clerk auth, protected routes, and organization logic to this story and `1.3`. Do not re-open the broader migration scope here. [Source: `_bmad-output/implementation-artifacts/1-1-set-up-the-frontend-foundation-from-the-approved-starter-and-clean-the-generated-prototype.md#Scope Boundaries`]

### Technical Requirements

- Architecture explicitly chose Clerk for authentication and Clerk Organizations for SaaS tenancy. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]
- The frontend must remain a Vite + React + TypeScript app and communicate only with the application backend. Auth wiring must not create direct backend/service leakage into the UI. [Source: `_bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions`]
- Current prototype state is unsafe:
  - `src/App.tsx` redirects `/` to `/dashboard`
  - all product routes are public
  - Auth page is visual only
  [Source: `listing-workbench/src/App.tsx`, `listing-workbench/src/pages/Auth.tsx`, `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]

### Architecture Compliance

- Preserve the app/provider/guard structure approved in architecture:
  - app providers at app root
  - protected route boundaries
  - route-based screen model
  - later org context layered on top
  [Source: `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`]
- Backend authorization remains required later, but this frontend story must still enforce route-level session behavior for usability and shell safety. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]

### Library / Framework Requirements

- Clerk React quickstart currently documents Vite + React setup, `@clerk/react` installation, and wrapping the entry point with `<ClerkProvider>`. [Source: `https://clerk.com/docs/react/getting-started/quickstart`]
- Clerk Organizations docs recommend exposing organization switching in shared navigation later and using `useOrganization()` / `useOrganizationList()` for active-org context. This story should prepare for that without implementing the full org flow yet. [Source: `https://clerk.com/docs/react/guides/organizations/getting-started`]
- Current app uses React Router declarative routing around `BrowserRouter`. Keep route protection compatible with that structure unless Story `1.1` intentionally changed the canonical setup. [Source: `listing-workbench/src/App.tsx`, `https://reactrouter.com/start/declarative/installation`]

### File Structure Requirements

- High-probability update targets:
  - canonical `main.tsx`
  - canonical `App.tsx` or app router root
  - canonical auth page / auth route
  - guard or protected-layout modules introduced by Story `1.1`
- Prototype references to inspect for migration intent:
  - `listing-workbench/src/pages/Auth.tsx`
  - `listing-workbench/src/App.tsx`
  - `listing-workbench/src/main.tsx`

### Testing Requirements

- Add at least route-level auth smoke coverage for:
  - anonymous access to protected route
  - authenticated entry behavior
  - root-path redirect behavior
- Do not consume Story `1.5` by building the full frontend-quality suite here; keep tests scoped to auth-entry behavior.

### Current State Analysis

- `listing-workbench/src/pages/Auth.tsx` contains prototype email/password and SSO buttons, but they are not real auth flows. The `/workspace` link is fake and must be replaced with real authenticated navigation. [Source: `listing-workbench/src/pages/Auth.tsx`]
- `listing-workbench/src/main.tsx` currently renders only `<App />`; this is where Clerk root provider wiring will likely be introduced in the canonical target. [Source: `listing-workbench/src/main.tsx`]
- Frontend review explicitly identified missing Clerk integration, missing protected routes, and missing session-aware redirects as critical gaps. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]

### Scope Boundaries

- In scope:
  - Clerk install and provider initialization
  - public vs protected route separation
  - authenticated entry behavior
  - replacement of prototype-only auth CTA behavior
- Out of scope:
  - active organization selection and persistence
  - role-specific protected content by org role
  - API client wiring
  - support/admin authorization details beyond route-safe boundaries

### Implementation Guidance

- Prefer a protected-layout or guard-based route grouping rather than sprinkling auth checks across every page.
- Keep the auth route visually aligned with the generated screen, but use Clerk-native primitives or controlled wrappers instead of a fake `<Link to="/workspace">Continue</Link>`.
- Ensure the root path has one obvious behavior for signed-out users and a separate one for signed-in users.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.2`]
- Previous story context: [Source: `_bmad-output/implementation-artifacts/1-1-set-up-the-frontend-foundation-from-the-approved-starter-and-clean-the-generated-prototype.md`]
- Architecture auth decision: [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]
- Prototype auth/current routing: [Source: `listing-workbench/src/pages/Auth.tsx`, `listing-workbench/src/App.tsx`, `listing-workbench/src/main.tsx`]
- Gap/status docs: [Source: `listing-workbench/docs/frontend-gap-analysis.md`, `listing-workbench/docs/frontend-implementation-status.md`]
- Clerk React quickstart: [Source: `https://clerk.com/docs/react/getting-started/quickstart`]
- React Router installation baseline: [Source: `https://reactrouter.com/start/declarative/installation`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- No git repository detected at repo root during story generation.
- 2026-05-01: Added failing route smoke tests showing signed-out `/` and `/dashboard` access still rendered protected app screens before implementation.
- 2026-05-01: Verified implementation with `npm run test:web`, `npm run lint:web`, and `npm run build:web`.

### Completion Notes List

- Installed `@clerk/clerk-react` in the canonical `apps/web` workspace and added Clerk provider initialization through the app provider root.
- Added fail-fast publishable-key handling with a test-mode placeholder and an `.env.example` entry for local setup.
- Replaced the mock auth form with Clerk `SignIn` while preserving the existing split auth screen direction and routing successful auth to workspace selection.
- Added a protected route boundary around all product routes so signed-out users reach `/auth` and protected content waits for Clerk auth state before rendering.
- Added route-level auth smoke tests for signed-out root access, signed-out protected-route access, signed-in root entry, and signed-in protected-route rendering.

### File List

- `apps/web/.env.example`
- `apps/web/package.json`
- `apps/web/src/app/providers/AppProviders.tsx`
- `apps/web/src/app/providers/clerk.ts`
- `apps/web/src/app/routes/ProtectedRoute.tsx`
- `apps/web/src/app/routes/route-config.tsx`
- `apps/web/src/routes/pages/Auth.tsx`
- `apps/web/src/test/app-routing.test.tsx`
- `package-lock.json`

### Change Log

- 2026-05-01: Implemented Clerk authentication and protected app entry for Story 1.2.
