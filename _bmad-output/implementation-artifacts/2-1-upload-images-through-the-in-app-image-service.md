# Story 2.1: Upload Images Through the In-App Image Service

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a catalog operator,
I want to upload product images one by one into the platform and receive stable image IDs,
so that I can reference those images in my spreadsheet before creating a batch.

## Acceptance Criteria

1. Given a signed-in operator with access to the image service, when they upload a supported product image, then the system stores the asset through the platform-owned image service and returns a stable internal `image_id` that can be used in later workflows.
2. Given the image service is part of the same SaaS application, when an image upload succeeds, then the asset is associated with the active organization context and the resulting `image_id` is retrievable by the platform during batch intake.
3. Given an upload fails or the file is invalid, when the operator submits the file, then the UI shows a clear error state and no unusable or partial `image_id` is issued.

## Tasks / Subtasks

- [x] Add an organization-scoped image upload surface (AC: 1, 2)
  - [x] Add or extend the image-assets route/feature area for single-image upload.
  - [x] Accept only supported image file types and display filename, size, and validation state before upload.
  - [x] Return and display a stable internal `image_id` for successful uploads.
- [x] Define the frontend API contract for image asset creation (AC: 1, 2, 3)
  - [x] Add API-client functions and DTOs under the current frontend structure.
  - [x] Model success, pending, validation failure, and server failure states without relying on external image URLs.
  - [x] Keep the contract ready for a future Express API implementation.
- [x] Preserve tenant boundaries in the UI contract (AC: 2)
  - [x] Ensure upload requests include the active organization context from the existing Clerk/organization boundary.
  - [x] Do not expose direct storage provider details or Amazon-facing concerns in the frontend.
- [x] Implement clear failure handling (AC: 3)
  - [x] Show user-meaningful validation and upload errors.
  - [x] Prevent rendering or copying an `image_id` when upload did not complete successfully.
  - [x] Keep partial uploads recoverable through retry or removal.
- [x] Add focused tests (AC: 1, 2, 3)
  - [x] Cover success, invalid file, failed upload, and organization context behavior.
  - [x] Add accessibility checks for keyboard upload flow and status messaging.

## Dev Notes

- This story starts Epic 2 and should create the image asset foundation used by spreadsheet intake. The MVP image contract is internal upload plus internal `image_id`; external image URL ingestion remains out of scope. [Source: `_bmad-output/planning-artifacts/prd.md#Image Safety Rules`]
- The current app is a Vite React frontend only. There is no implemented `apps/api`, `apps/worker`, Prisma package, or object storage provider in the workspace yet, so backend work should be represented through typed frontend contracts/mocks unless the implementation story explicitly expands the stack. [Source: local repo inspection; `_bmad-output/planning-artifacts/architecture.md#Gap Analysis Results`]

### Previous Story Intelligence

- Epic 1 established protected app entry, active organization context, shared shell navigation, and smoke coverage. Build inside those patterns rather than introducing a separate auth or shell path. [Source: `_bmad-output/implementation-artifacts/1-2-implement-authentication-and-protected-app-entry.md`, `_bmad-output/implementation-artifacts/1-3-implement-organization-workspace-selection-and-active-context.md`, `_bmad-output/implementation-artifacts/1-4-build-the-shared-application-shell-and-navigation-context.md`]
- Story 1.5 added route smoke tests and lint guardrails. New feature work should include focused tests and keep `npm run test:web` / `npm run lint:web` clean. [Source: `_bmad-output/implementation-artifacts/1-5-establish-frontend-quality-guardrails-and-smoke-coverage.md`]

### Technical Requirements

- `image_id` must be stable, internally generated, and organization-scoped. Never derive the business identifier from a temporary browser object URL or public filename.
- The frontend may show local previews before upload, but stored asset references must come from the platform-owned image service contract.
- Treat image binary storage as an API/backend responsibility. The frontend should call application API functions only; it must not couple to object storage credentials, direct upload internals, Amazon APIs, database calls, or queue concerns. [Source: `_bmad-output/planning-artifacts/architecture.md#Architectural Boundaries`]
- Errors should use stable machine-readable codes plus user-meaningful copy so later intake stories can distinguish invalid file, upload failure, authorization failure, and unsupported media type.

### Frontend Prototype Gap Guardrails

- The prototype documentation identifies file upload and intake processing as visually present but functionally missing. This story must implement real file selection, validation state, upload/mutation state, and error handling rather than leaving static preview rows in place. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`, `listing-workbench/docs/frontend-implementation-status.md#Create Batch`]
- Do not add more static mock-only behavior as the final implementation. If a backend endpoint is not available, create typed API-client seams and realistic mocks that make the future API contract explicit. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Critical Gaps`]
- Watch for existing mojibake/encoding corruption in touched UI copy and clean it when editing affected strings. [Source: `listing-workbench/docs/frontend-gap-analysis.md#Major Gaps`]

### Architecture Compliance

- Follow current frontend structure: route pages in `apps/web/src/routes/pages`, domain UI under `apps/web/src/features/image-assets` if created, reusable primitives under `apps/web/src/components/ui`, API integration under `apps/web/src/lib/api-client`.
- Use React Router for route-level navigation, TanStack Query for server-state style mutations/cache, and existing Clerk organization context for tenant-scoped behavior. [Source: `apps/web/package.json`, `apps/web/src/app/routes/route-config.tsx`]
- Keep query keys stable and domain-scoped, for example `['imageAssets', organizationId]`, matching the architecture's query-key guidance. [Source: `_bmad-output/planning-artifacts/architecture.md#State Management Patterns`; TanStack Query docs: https://tanstack.com/query/latest/docs/react/guides/query-keys]

### UX Requirements

- The upload UI should feel like the beginning of analysis, not a passive file picker. Show clear states for empty, validating, uploading, uploaded, failed, and retryable failure. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Batch Intake to Readiness Triage`]
- Statuses must be text-readable and not color-only. Preserve keyboard access and visible focus states for upload, retry, remove, and copy-ID actions. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Accessibility Strategy`]
- Use the existing dense operational visual style. Avoid adding a marketing-style or decorative image gallery.

### File Structure Requirements

- High-probability files to update:
  - `apps/web/src/app/routes/paths.ts`
  - `apps/web/src/app/routes/route-config.tsx`
  - `apps/web/src/routes/pages/CreateBatch.tsx`
  - `apps/web/src/routes/pages/ImagePlan.tsx` or a new image-assets page if appropriate
  - `apps/web/src/lib/mocks/prototype-data.ts`
  - new `apps/web/src/features/image-assets/*`
  - new `apps/web/src/lib/api-client/image-assets.ts`
  - focused tests under `apps/web/src/test`
- Preserve existing shell and route behavior from Epic 1.

### Testing Requirements

- Add tests for successful image upload state and displayed `image_id`.
- Add tests that invalid files and failed uploads do not issue an `image_id`.
- Add organization-boundary behavior where feasible using existing test helpers/mocks.
- Run `npm run test:web` and `npm run lint:web`.

### Scope Boundaries

- In scope: frontend upload workflow, stable `image_id` contract, mock/API-client shape, organization-scoped UI behavior, validation/error states.
- Out of scope: final object storage provider selection, real binary persistence infrastructure, Amazon image compliance validation, generated image transformations, external URL ingestion.

### References

- Story definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.1`]
- PRD ingestion/image contract: [Source: `_bmad-output/planning-artifacts/prd.md#Ingestion & Batch Setup`, `_bmad-output/planning-artifacts/prd.md#Image Safety Rules`]
- Architecture boundaries: [Source: `_bmad-output/planning-artifacts/architecture.md#Architectural Boundaries`]
- UX upload and async-state guidance: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Batch Intake to Readiness Triage`, `_bmad-output/planning-artifacts/ux-design-specification.md#Empty Loading and Processing States`]

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- 2026-05-03: Added failing image-assets upload tests before implementation; initial failure confirmed missing API contract and route.
- 2026-05-03: `npm run build:web` exposed Clerk `useOrganizationList` type drift; updated `OrganizationProvider` to use `userMemberships` while preserving existing test mock compatibility.
- 2026-05-03: Verified with `npm run test:web`, `npm run lint:web`, and `npm run build:web`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added `/image-assets` inside the protected organization shell with a single-image upload workflow.
- Added a typed frontend image-assets API contract with stable internal `image_id`, organization ID, file metadata, supported media types, and machine-readable error codes.
- Added validation, upload, success, failure, retry, remove, and copy-ID UI states without exposing storage-provider or Amazon implementation details.
- Wired upload requests to the active organization context from the Clerk organization boundary.
- Linked the Create Batch image section to the image-assets workflow and added a sidebar entry for the new route.
- Added focused route/feature tests for success, invalid files, failed uploads, organization context, and accessible status messaging.

### File List

- `apps/web/src/app/organizations/OrganizationProvider.tsx`
- `apps/web/src/app/routes/paths.ts`
- `apps/web/src/app/routes/route-config.tsx`
- `apps/web/src/components/shell/AppSidebar.tsx`
- `apps/web/src/features/image-assets/ImageAssetUpload.tsx`
- `apps/web/src/lib/api-client/image-assets.ts`
- `apps/web/src/lib/api-client/index.ts`
- `apps/web/src/routes/pages/CreateBatch.tsx`
- `apps/web/src/routes/pages/ImageAssets.tsx`
- `apps/web/src/test/image-assets-upload.test.tsx`
- `apps/web/tsconfig.app.tsbuildinfo`
- `_bmad-output/implementation-artifacts/2-1-upload-images-through-the-in-app-image-service.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-03: Implemented organization-scoped in-app image upload foundation for Story 2.1.
