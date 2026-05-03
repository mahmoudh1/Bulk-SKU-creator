---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
inputDocuments:
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/_bmad-output/planning-artifacts/prd.md"
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/_bmad-output/planning-artifacts/architecture.md"
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/_bmad-output/planning-artifacts/ux-design-specification.md"
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/listing-workbench/docs/frontend-gap-analysis.md"
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/listing-workbench/docs/frontend-implementation-status.md"
---

# Bulk-SKU-Creator - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Bulk-SKU-Creator, decomposing the requirements from the PRD, UX Design, Architecture, and current frontend review findings into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Catalog operators can create a new batch by uploading a spreadsheet of product rows.
FR2: Catalog operators can upload product images and associate them with product rows through stable image identifiers.
FR3: The system can preserve source row identity throughout ingestion, review, submission, and troubleshooting.
FR4: Catalog operators can review detected spreadsheet fields and mapped product data before processing continues.
FR5: The system can normalize uploaded product data into a consistent internal listing structure.
FR6: Catalog operators can reprocess a batch after correcting source data or image associations.
FR7: The system can evaluate each row for listing readiness before submission.
FR8: The system can classify each row as `READY`, `READY_WITH_AUGMENTATION`, `NEEDS_INPUT`, or `NOT_ENOUGH_DATA`.
FR9: Catalog operators can see the specific reason a row received its current readiness status.
FR10: The system can validate whether each row has a valid product identifier or a documented exemption path.
FR11: The system can validate required listing attributes before a row is eligible for submission.
FR12: The system can validate variant grouping structure, relationship type, and variation theme rules.
FR13: The system can validate uploaded images against listing compliance requirements.
FR14: The system can flag potential duplicate catalog conflicts without changing the listing path.
FR15: Catalog operators can review warnings separately from submission-blocking issues.
FR16: The system can detect when Amazon catalog behavior or pre-submission checks would force matching to an existing ASIN and block default automated submission.
FR17: The system can enrich non-critical listing content for eligible rows.
FR18: The system can prevent AI enrichment from inventing unsupported factual product attributes.
FR19: Catalog operators can review AI-generated or AI-augmented content before submission.
FR20: The system can identify when seller input is required instead of attempting automated completion.
FR21: The system can apply stronger review or escalation logic when enrichment confidence is insufficient.
FR22: The system can generate listing content outputs aligned to marketplace-specific listing needs.
FR23: The system can persist AI confidence results for classification and enrichment decisions.
FR24: The system can use configurable cost and confidence rules to decide whether to skip, accept, escalate, or block AI-assisted processing.
FR25: The system can assess uploaded images for quality and suitability for listing use.
FR26: The system can determine whether uploaded images support compliant main-image creation.
FR27: The system can generate or enhance images only when the source material supports truthful output.
FR28: Catalog operators can review the image plan for each row before submission.
FR29: The system can prevent misleading or non-compliant generated image outputs from entering the submission flow.
FR30: The system can block image generation when product identity or packaging truth cannot be established from source evidence.
FR31: Catalog operators can review a row-level preview of listing data before submission.
FR32: Catalog operators can filter and sort rows by readiness status, warnings, blockers, and submission state.
FR33: Catalog operators can inspect missing fields and required corrections for blocked or incomplete rows.
FR34: Catalog operators can update or supply missing row data through the application workflow.
FR35: Catalog operators can choose which eligible rows to include in a submission batch.
FR36: The system can preserve batch context while users move between batch overview and row-level detail.
FR37: Catalog operators can resume work on previously created batches.
FR38: The system can display the current lifecycle stage and transition history for each row.
FR39: The system can require manual product-type confirmation when automated product-type resolution is ambiguous.
FR40: The system can build submission-ready listing payloads for eligible rows.
FR41: The system can submit new-product listing batches to Amazon through the approved submission path.
FR42: The system can prevent rows that violate core submission rules from being submitted.
FR43: Catalog operators can monitor submission progress and outcomes at both batch and row level.
FR44: The system can capture and display submission errors returned by Amazon.
FR45: Catalog operators can identify which rows succeeded, failed, or require follow-up after submission.
FR46: Catalog operators can resubmit corrected rows after issues are resolved.
FR47: The system can retry failed rows independently of unaffected rows in the same batch.
FR48: The system can preserve idempotent submission intent for repeated processing or resubmission attempts.
FR49: The system can store the schema or product-type version used when a payload was constructed and submitted.
FR50: Operations administrators can define seller-level defaults used during listing preparation.
FR51: Operations administrators can manage default fulfillment, condition, and quantity behaviors.
FR52: Operations administrators can review operational outcomes across batches to identify recurring issues.
FR53: The system can enforce the rule that MVP listing creation follows the new-product-only path.
FR54: The system can record meaningful audit history for operational decisions and configuration changes.
FR55: Operations administrators can configure confidence thresholds and cost guardrails that influence enrichment and image-processing decisions.
FR56: Support users can inspect the lifecycle of a row from source ingestion through final submission outcome.
FR57: Support users can see which data came from source files, defaults, AI augmentation, validation, and submission packaging.
FR58: The system can explain why a row was blocked, downgraded, warned, or rejected.
FR59: Support users can identify remediation actions needed to move a row forward.
FR60: The system can preserve traceable row histories for recurring issue analysis and support workflows.
FR61: The system can expose stable internal identifiers for batches, rows, row revisions, and submission outcomes.
FR62: The system can support future internal import, export, or reporting workflows without breaking row traceability.
FR63: The system can maintain marketplace-aware data structures that support future marketplace expansion.

### NonFunctional Requirements

NFR1: The system shall provide visible batch-ingestion feedback within 10 seconds of a valid spreadsheet and image upload starting.
NFR2: The system shall display row-level readiness summaries for a processed batch without requiring users to reload the workspace.
NFR3: The system shall support filtering, sorting, and opening row-level detail views with interaction latency that remains operationally usable for large internal batches.
NFR4: The system shall present long-running operations such as validation, image processing, and submission monitoring with explicit progress or status feedback.
NFR5: The system shall preserve user context during review workflows so operators can move between batch and row detail without losing work state.
NFR6: The system shall restrict access to authorized internal users only.
NFR7: The system shall enforce role-appropriate access for operators, administrators, and support users.
NFR8: The system shall protect data in transit and at rest for uploaded files, product data, generated assets, and submission records.
NFR9: The system shall maintain audit visibility for configuration changes, submission actions, and material workflow decisions.
NFR10: The system shall prevent unauthorized users from viewing or modifying batch data, seller defaults, or row-level submission records.
NFR11: The system shall preserve batch, row, and submission state across asynchronous processing steps.
NFR12: The system shall fail rows safely by surfacing blockers and warnings rather than silently degrading data quality.
NFR13: The system shall preserve traceable row histories so support users can investigate failures after processing or submission completes.
NFR14: The system shall prevent invalid or blocked rows from being included in final submission payloads.
NFR15: The system shall recover gracefully from partial batch failures by isolating row-level issues where possible instead of invalidating the entire batch.
NFR16: The system shall preserve idempotent behavior for repeated submission attempts against the same row revision and submission intent.
NFR17: The system shall integrate reliably with Amazon submission and status interfaces required for new-product listing workflows.
NFR18: The system shall preserve stable mappings between source rows, internal row identifiers, uploaded images, and downstream submission outcomes.
NFR19: The system shall tolerate delayed or failed external responses by surfacing integration state clearly to internal users.
NFR20: The system shall maintain marketplace-aware data handling so future marketplace expansion does not require redesign of the core processing model.
NFR21: The system shall preserve schema-version traceability for validation and submission outcomes.
NFR22: The system shall support keyboard-accessible navigation for core operational workflows including batch review, row inspection, and action execution.
NFR23: The system shall present statuses, warnings, blockers, and validation results in text form rather than color alone.
NFR24: The system shall maintain readable form structure, labeling, and contrast for dense internal workflow screens.
NFR25: The system shall support growth in batch volume, row count, and internal user adoption without requiring a redesign of the core workflow model.
NFR26: The system shall allow processing capacity to expand independently of the operator-facing review interface.
NFR27: The system shall maintain operationally usable behavior as listing volume increases across additional marketplaces in future releases.

### Additional Requirements

- Initialize the product as a split-stack SaaS platform with a Vite + React + TypeScript frontend, Express API, BullMQ worker tier, Neon Postgres, Prisma, and Redis.
- Treat the frontend, API, and worker as separate ownership boundaries; frontend must only communicate with the application API.
- Implement Clerk authentication with Clerk Organizations for workspace-aware SaaS tenancy and backend-enforced organization scoping.
- Use REST JSON APIs with OpenAPI discipline and structured machine-readable error payloads.
- Persist tenant-scoped relational records for organizations, batches, rows, row revisions, submission attempts, AI decisions, audit events, and schema references.
- Use internal `image_id` references only; external image URL ingestion is out of scope.
- Support asynchronous job orchestration for normalization, validation, product-type resolution, AI enrichment, image processing, submission dispatch, and submission-status sync.
- Preserve row lifecycle vocabulary, readiness vocabulary, revision boundaries, audit trails, and schema-version traceability exactly across backend and frontend surfaces.
- Frontend server state must be query-driven; local frontend state should be limited to presentation concerns like filters, selection, drawer state, and modal state.
- Adopt the architecture naming and structure conventions: tenant-aware records, Prisma `PascalCase` models mapped to `snake_case` tables, `camelCase` JSON payloads, and stable route/resource IDs.
- Enforce backend-only ownership of Amazon SP-API, AI providers, queue infrastructure, storage integrations, and credential handling.
- Choose an object storage provider before stories that implement image upload persistence or generated asset storage.
- Lock an OpenAPI workflow approach before stories that depend on generated clients or contract automation.
- Decide whether status updates stay polling-based in MVP or add push-style transport before deeper submission-monitoring stories.
- The existing `listing-workbench` frontend should be treated as a prototype foundation, not a complete implementation.
- Frontend remediation must include fixing mojibake and text-encoding corruption before integration work continues.
- Frontend remediation must remove hardcoded demo routes and demo entity IDs from navigation and page flows.
- Frontend remediation must replace `src/data/mock.ts`-driven behavior with a real API client layer, query hooks, and mutation flows.
- Frontend remediation must add protected routing, organization-aware shell context, and role-sensitive access behavior.
- Frontend remediation must reorganize generated screens toward the planned route/feature/component structure to reduce implementation drift.
- Frontend remediation must resolve current lint failures and improve type hygiene before large-scale story execution.
- Frontend quality work must add meaningful automated frontend coverage beyond the current placeholder test and should address route-level code splitting as the app matures.

### UX Design Requirements

UX-DR1: Implement a desktop-first SaaS workspace shell with clear active-organization context and primary navigation for batches, defaults, support, and admin.
UX-DR2: Implement an auth and workspace-entry flow that orients users before they reach the application shell, rather than dropping users directly into the dashboard.
UX-DR3: Implement the triage-console design direction as the primary product shell, with a table-first workspace and a persistent diagnostic side panel or split view.
UX-DR4: Implement a batch status summary bar that shows readiness counts, processing indicators, and selected-scope information, with interactive filtering by status.
UX-DR5: Implement a high-density batch review grid with sticky header behavior, status-first scanning, sortable columns, and row selection that preserves batch context.
UX-DR6: Implement a row detail inspector that separates source facts, inferred content, warnings, blockers, editable fields, and next actions in a structured review workspace.
UX-DR7: Implement blocker explanation cards that show blocker title, reason, supporting evidence, severity, and the next valid action.
UX-DR8: Implement an AI confidence panel that explicitly distinguishes source truth, AI suggestion, confidence level, and user review decision state.
UX-DR9: Implement a submission scope summary that clearly communicates included rows, excluded rows, warnings, and submission destination before confirmation.
UX-DR10: Implement a submission outcome timeline that shows queued, processing, retrying, failed, partial-success, and success states with timestamps and row-level drill-down.
UX-DR11: Implement a priority guidance banner or equivalent triage aid above the table to direct users toward the highest-leverage blocked or incomplete work first.
UX-DR12: Preserve batch context across navigation by retaining filters, sort state, scroll position, selected subset, and row focus when users move between batch and row detail.
UX-DR13: Support the blocked-row recovery loop inside the same workspace, including edit, revalidate, defer, and seller-follow-up actions with immediate state feedback.
UX-DR14: Frame batch intake as analysis rather than file transfer by supporting spreadsheet upload, image upload, mapping review, and post-upload readiness interpretation.
UX-DR15: Implement progressive disclosure for validation reasoning, AI details, audit traces, and submission diagnostics so dense workflows remain scannable.
UX-DR16: Keep fact, inference, warning, blocker, and informational states visually and verbally distinct across all screens.
UX-DR17: Standardize status vocabulary and semantic color usage for `READY`, `READY_WITH_AUGMENTATION`, `NEEDS_INPUT`, `NOT_ENOUGH_DATA`, submission states, and trace states.
UX-DR18: Implement explicit loading, empty, error, and async processing states, including clear distinction between queued, processing, waiting on external service, and retrying.
UX-DR19: Implement search, filter, and saved-view patterns as first-class workflow tools, with common filters exposed by default.
UX-DR20: Support inline row-level corrections where practical, with field-level validation messages and row-level blocker summaries when progress is blocked.
UX-DR21: Implement support and admin diagnostic views that expose chronological trace data, lifecycle transitions, and meaningful operational events without excessive noise.
UX-DR22: Build the frontend on a themeable token system using Tailwind and shadcn-style primitives, plus workflow-specific components for triage, diagnostics, and submissions.
UX-DR23: Establish and apply design tokens for color roles, typography scale, spacing scale, radius, elevation, and data-density rules before broad UI drift occurs.
UX-DR24: Keep the visual system restrained and operational: neutral foundation, deep ink-blue primary accent, and semantic colors reserved for workflow meaning rather than decoration.
UX-DR25: Implement responsive behavior that preserves desktop power, compresses secondary panes on tablet, and limits mobile to review-oriented flows rather than full authoring parity.
UX-DR26: Meet WCAG 2.2 AA expectations for keyboard navigation, visible focus states, semantic tables, readable contrast, screen-reader-readable status labels, and non-color-only status communication.
UX-DR27: Ensure AI-suggested, user-provided, and source-provided content are always labeled distinctly in forms, inspectors, and review views.
UX-DR28: Use a consistent action hierarchy across the product, with one primary action per major surface and explicit confirmation for destructive or high-consequence actions.

### FR Coverage Map

FR1: Epic 2 - Batch intake and spreadsheet upload
FR2: Epic 2 - Image upload and image-to-row association
FR3: Epic 2 - Source row identity preservation through intake
FR4: Epic 2 - Mapping review before processing
FR5: Epic 2 - Normalization into internal listing structure
FR6: Epic 2 - Batch reprocessing after corrections
FR7: Epic 3 - Row readiness evaluation
FR8: Epic 3 - Readiness status classification
FR9: Epic 3 - Status reasoning visibility
FR10: Epic 3 - Identifier and exemption validation
FR11: Epic 3 - Required attribute validation
FR12: Epic 3 - Variant structure validation
FR13: Epic 3 - Image compliance validation
FR14: Epic 3 - Duplicate conflict warning workflow
FR15: Epic 3 - Separation of warnings and blockers
FR16: Epic 3 - Forced-match detection and automated submission block
FR17: Epic 4 - Non-critical listing enrichment
FR18: Epic 4 - Truth constraints on AI enrichment
FR19: Epic 4 - Review of AI-generated or AI-augmented content
FR20: Epic 4 - Seller-input escalation instead of unsafe completion
FR21: Epic 4 - Low-confidence escalation workflow
FR22: Epic 4 - Marketplace-aligned listing content generation
FR23: Epic 4 - Persistence of AI confidence results
FR24: Epic 4 - Cost and confidence policy controls for AI
FR25: Epic 4 - Image quality and suitability assessment
FR26: Epic 4 - Main-image compliance support evaluation
FR27: Epic 4 - Truthful image enhancement/generation only
FR28: Epic 4 - Per-row image plan review
FR29: Epic 4 - Blocking misleading or non-compliant generated images
FR30: Epic 4 - Blocking image generation when truth cannot be established
FR31: Epic 3 - Row-level preview before submission
FR32: Epic 3 - Filtering and sorting by workflow state
FR33: Epic 3 - Inspection of missing fields and corrections
FR34: Epic 3 - In-app row data correction
FR35: Epic 5 - Selection of eligible rows for submission
FR36: Epic 3 - Preservation of batch context during row inspection
FR37: Epic 1 - Resume work from a stable SaaS shell
FR38: Epic 3 - Lifecycle stage and transition history display
FR39: Epic 3 - Manual product-type confirmation when automation is ambiguous
FR40: Epic 5 - Build submission-ready payloads
FR41: Epic 5 - Submit new-product listing batches to Amazon
FR42: Epic 5 - Prevent submission of invalid rows
FR43: Epic 5 - Batch and row-level submission monitoring
FR44: Epic 5 - Display of Amazon submission errors
FR45: Epic 5 - Identification of success, failure, and follow-up rows
FR46: Epic 5 - Resubmission after correction
FR47: Epic 5 - Independent retry of failed rows
FR48: Epic 5 - Idempotent submission intent preservation
FR49: Epic 5 - Schema/product-type version capture with submission payloads
FR50: Epic 6 - Seller default management
FR51: Epic 6 - Fulfillment, condition, and quantity default behaviors
FR52: Epic 6 - Operational outcome review across batches
FR53: Epic 6 - Enforcement of new-product-only workflow policy
FR54: Epic 6 - Audit history for operational and configuration decisions
FR55: Epic 4 - Configurable AI/image confidence and cost guardrails
FR56: Epic 7 - Support inspection of full row lifecycle
FR57: Epic 7 - Visibility into source, defaults, AI, validation, and submission data origins
FR58: Epic 7 - Explainability for blocked, warned, downgraded, or rejected rows
FR59: Epic 7 - Remediation guidance for support users
FR60: Epic 7 - Traceable row histories for recurring issue analysis
FR61: Epic 1 - Stable internal identifiers exposed through a real SaaS shell
FR62: Epic 7 - Future integration and reporting support without breaking traceability
FR63: Epic 6 - Marketplace-aware governance and future expansion support

## Epic List

### Epic 1: SaaS Workspace Access and Frontend Stabilization
Users can sign in, enter the correct organization workspace, navigate a stable application shell, and resume batch work from a cleaned integration-ready frontend.
**FRs covered:** FR37, FR61

### Epic 2: Batch Intake and Asset Mapping
Catalog operators can create a batch, upload spreadsheet and image assets, review mappings, and start processing with preserved row identity.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6

### Epic 3: Readiness Triage and Row Correction
Catalog operators can understand row readiness, investigate blockers, correct issues, manage lifecycle state, and move rows toward submission eligibility.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR31, FR32, FR33, FR34, FR36, FR38, FR39

### Epic 4: AI Enrichment and Truthful Image Preparation
Catalog operators can use constrained AI and image workflows to improve eligible rows without inventing facts or hiding uncertainty.
**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR55

### Epic 5: Submission Execution and Outcome Recovery
Catalog operators can choose eligible rows, submit them to Amazon, monitor outcomes, recover from failures, and retry safely.
**FRs covered:** FR35, FR40, FR41, FR42, FR43, FR44, FR45, FR46, FR47, FR48, FR49

### Epic 6: Administration, Defaults, and Operational Governance
Operations administrators can manage defaults, policies, and operational oversight for listing preparation and system guardrails.
**FRs covered:** FR50, FR51, FR52, FR53, FR54, FR63

### Epic 7: Support Traceability and Future Integration Readiness
Support users can investigate row histories, understand decision chains, identify remediation steps, and preserve stable integration-facing identifiers and traceability.
**FRs covered:** FR56, FR57, FR58, FR59, FR60, FR62

## Epic 1: SaaS Workspace Access and Frontend Stabilization

Users can sign in, enter the correct organization workspace, navigate a stable application shell, and resume batch work from a cleaned integration-ready frontend.

### Story 1.1: Set Up the Frontend Foundation from the Approved Starter and Clean the Generated Prototype

As a developer,
I want the frontend initialized from the approved starter and the generated prototype cleaned into that structure,
So that subsequent feature stories can be implemented on a stable and maintainable base.

**Acceptance Criteria:**

**Given** the architecture specifies the approved Vite + React + TypeScript starter as the frontend foundation
**When** Story 1.1 is completed
**Then** the frontend codebase is established on that approved starter foundation
**And** the generated prototype is adopted into that foundation rather than remaining an unstructured standalone artifact.

**Given** the current `listing-workbench` frontend contains mojibake text, hardcoded demo routes, and page-oriented generated files
**When** the frontend foundation cleanup is completed
**Then** visible text corruption is removed from user-facing screens
**And** hardcoded demo batch and row IDs are removed from shared navigation and route assumptions.

**Given** the architecture defines route, feature, component, and shared library boundaries
**When** the frontend is reorganized
**Then** the codebase reflects an architecture-aligned structure for routes, features, shared UI, and API/query integration points
**And** the generated screens remain functional inside that structure.

**Given** the current frontend has lint and type-hygiene issues
**When** this story is completed
**Then** the project reaches a clean enough lint and type baseline for subsequent implementation work
**And** no new structural shortcuts are introduced that conflict with the approved architecture.

### Story 1.2: Implement Authentication and Protected App Entry

As a user,
I want to authenticate into the product and be blocked from protected screens until I do,
So that only authorized users can access the application.

**Acceptance Criteria:**

**Given** an unauthenticated visitor opens the application
**When** they attempt to access a protected route
**Then** they are redirected to the authentication entry flow
**And** they do not see protected product content before authentication completes.

**Given** a user successfully authenticates through Clerk
**When** the authentication flow completes
**Then** the user is routed into the application entry flow rather than directly to an arbitrary protected page
**And** session state is available to the frontend shell for downstream authorization-aware behavior.

**Given** the application includes auth, workspace, and protected product areas
**When** route protection is implemented
**Then** public and protected routes are clearly separated
**And** the app no longer defaults anonymous users into `/dashboard` or equivalent protected screens.

### Story 1.3: Implement Organization Workspace Selection and Active Context

As a user who belongs to one or more organizations,
I want to select and persist my active workspace,
So that the application consistently uses the correct organization context.

**Acceptance Criteria:**

**Given** an authenticated user belongs to multiple organizations
**When** they enter the product after authentication
**Then** they can select an active workspace
**And** the chosen workspace is preserved for subsequent navigation.

**Given** a workspace is selected
**When** the user navigates through the application shell
**Then** the active organization context is shown in the UI
**And** route and data-loading boundaries are prepared to use organization-scoped identifiers.

**Given** a user signs in with only one valid organization
**When** the application resolves the active organization
**Then** the workspace flow can resolve automatically without unnecessary friction
**And** the resulting state still uses the same organization-context mechanism as the multi-org path.

### Story 1.4: Build the Shared Application Shell and Navigation Context

As a signed-in user,
I want a stable shell with correct navigation and context-preserving app structure,
So that I can move through the product consistently as deeper features are added.

**Acceptance Criteria:**

**Given** an authenticated user with an active organization enters the application
**When** the shell loads
**Then** the user sees a desktop-first application frame with organization context and primary navigation for batches, defaults, support, and admin
**And** the shell follows the approved UX direction rather than the prototype's demo shortcuts.

**Given** the current sidebar and route model contain hardcoded navigation assumptions
**When** the shared shell is completed
**Then** navigation is driven by real route structure and active context rather than embedded demo entity IDs
**And** the shell supports safe extension by later feature stories.

**Given** later stories will depend on shared providers and app-level context
**When** this story is completed
**Then** the shell exposes stable provider boundaries for auth, active organization, and server-state wiring
**And** the application can preserve route-level context without relying on mock-data globals.

### Story 1.5: Establish Frontend Quality Guardrails and Smoke Coverage

As a development team,
I want baseline frontend quality checks and smoke coverage,
So that later feature work does not compound instability in the product shell.

**Acceptance Criteria:**

**Given** the frontend previously had only placeholder tests and unstable quality signals
**When** this story is completed
**Then** the project includes meaningful smoke coverage for the auth entry flow, workspace flow, and shared shell rendering
**And** those checks can run in local development and CI.

**Given** the product depends on stable route behavior and accessible shell navigation
**When** quality guardrails are added
**Then** the baseline checks cover protected-route behavior and core shell rendering expectations
**And** obvious regressions in the SaaS entry flow are caught automatically.

**Given** the frontend prototype emitted quality debt such as lint failures and oversized undisciplined output
**When** this story is completed
**Then** lint is part of the enforced development baseline
**And** easy route-level performance wins such as initial code-splitting are applied where practical without destabilizing the shell.

## Epic 2: Batch Intake and Asset Mapping

Catalog operators can prepare image assets through an in-app image service, build spreadsheets that reference those assets by `image_id`, upload the sheet, and start processing with preserved row identity and resolved image previews.

### Story 2.1: Upload Images Through the In-App Image Service

As a catalog operator,
I want to upload product images one by one into the platform and receive stable image IDs,
So that I can reference those images in my spreadsheet before creating a batch.

**Acceptance Criteria:**

**Given** a signed-in operator with access to the image service
**When** they upload a supported product image
**Then** the system stores the asset through the platform-owned image service
**And** returns a stable internal `image_id` that can be used in later workflows.

**Given** the image service is part of the same SaaS application
**When** an image upload succeeds
**Then** the asset is associated with the active organization context
**And** the resulting `image_id` is retrievable by the platform during batch intake.

**Given** an upload fails or the file is invalid
**When** the operator submits the file
**Then** the UI shows a clear error state
**And** no unusable or partial `image_id` is issued.

### Story 2.2: Create a Batch from a Spreadsheet That References Image IDs

As a catalog operator,
I want to create a new batch and upload a spreadsheet that contains image IDs,
So that I can start a bulk listing workload using pre-registered assets.

**Acceptance Criteria:**

**Given** an operator has prepared a spreadsheet with product rows and `image_id` references
**When** they create a batch and upload the sheet
**Then** the system creates a batch record and persists the uploaded source file
**And** associates the batch with the active organization and initiating user.

**Given** the spreadsheet is missing required structural elements or cannot be parsed
**When** upload processing begins
**Then** the system rejects the intake with a user-meaningful error
**And** does not create a misleading successful batch state.

**Given** a valid spreadsheet is uploaded
**When** the intake starts
**Then** the operator receives visible upload and processing feedback within the required responsiveness target
**And** the batch moves into the intake processing flow rather than stopping at raw file storage.

### Story 2.3: Resolve Spreadsheet Image IDs into Server-Side Asset Previews

As a catalog operator,
I want the system to resolve image IDs from my uploaded spreadsheet into real previews and asset references,
So that I can confirm the batch is linked to the correct product images before deeper processing continues.

**Acceptance Criteria:**

**Given** a batch spreadsheet contains one or more `image_id` references
**When** intake resolution runs
**Then** the backend looks up those IDs against platform-managed assets
**And** attaches resolved asset metadata and preview-ready references to the relevant rows.

**Given** an `image_id` does not exist, is inaccessible to the active organization, or cannot be resolved
**When** the system processes that row
**Then** the row is marked with an intake issue that is visible to the operator
**And** the batch remains recoverable without silently dropping the image reference.

**Given** resolved image assets are available
**When** the operator opens intake review
**Then** they can see image previews or equivalent visual confirmation per referenced asset
**And** those previews are served through platform-controlled access rather than external URLs.

### Story 2.4: Review Normalized Rows and Field-to-Model Mapping

As a catalog operator,
I want to review how spreadsheet fields and image references were interpreted,
So that I can confirm the system understood the source data before processing continues.

**Acceptance Criteria:**

**Given** a batch has completed initial parsing and asset resolution
**When** the operator opens the intake review screen
**Then** they can inspect normalized row output, detected field mappings, and linked image references
**And** each row preserves a stable identity tied to the uploaded source row.

**Given** the system inferred mappings or normalized fields from raw spreadsheet content
**When** the operator reviews the batch
**Then** the intake UI shows enough information to understand how the source data was interpreted
**And** does not force the operator to continue blindly into later workflow stages.

**Given** the operator identifies mapping or interpretation issues
**When** they inspect the intake review state
**Then** the problematic fields or references are surfaced clearly
**And** the operator has a defined path to correct them before reprocessing.

### Story 2.5: Correct Intake Issues and Reprocess the Batch

As a catalog operator,
I want to correct mapping or image-reference issues and reprocess the batch,
So that I can recover intake problems without recreating the entire workload from scratch.

**Acceptance Criteria:**

**Given** a batch contains fixable intake issues
**When** the operator updates the relevant mapping or reference inputs and requests reprocessing
**Then** the system starts a new intake processing attempt for the existing batch
**And** preserves traceability to the original uploaded batch and row identities.

**Given** the operator reprocesses a batch after corrections
**When** processing completes
**Then** corrected rows reflect the updated interpretation and resolved references
**And** unaffected rows are not lost or duplicated by the reprocessing flow.

**Given** reprocessing fails for specific rows
**When** the new intake attempt finishes
**Then** the operator can see which rows still have issues
**And** the batch remains recoverable for further correction rather than becoming unusable.

### Story 2.6: Show Intake Processing State and Handoff Readiness

As a catalog operator,
I want clear intake progress and handoff status after upload and mapping,
So that I know when the batch is ready to move into readiness evaluation.

**Acceptance Criteria:**

**Given** a batch is undergoing intake processing
**When** the operator views the batch
**Then** the UI shows explicit async state such as queued, processing, needs correction, or ready for next stage
**And** does not collapse these states into a vague generic loading indicator.

**Given** the intake process has completed successfully
**When** the operator returns to the batch workspace
**Then** the batch is shown as ready for readiness evaluation
**And** the system preserves batch context for the next workflow step.

**Given** intake completed with recoverable issues
**When** the operator reviews the outcome
**Then** the UI highlights what blocks handoff
**And** shows the next useful correction action rather than forcing trial-and-error.

## Epic 3: Readiness Triage and Row Correction

Catalog operators can evaluate persisted intake rows, understand readiness, investigate blockers, correct issues, manage lifecycle state, and move rows toward submission eligibility. Epic 3 builds on the Epic 2 Neon-backed batch intake records and Cloudflare R2 image assets; the browser must not recompute authoritative readiness or rely on prototype row data.

### Story 3.1: Evaluate Rows into Lifecycle and Readiness States

As a catalog operator,
I want each row evaluated into explicit lifecycle and readiness states,
So that I can understand where the batch stands before submission work begins.

**Acceptance Criteria:**

**Given** a batch has completed intake and is ready for evaluation
**When** readiness processing runs
**Then** each row is assigned a lifecycle stage and a readiness state
**And** the states use the approved vocabulary consistently across the Neon record, API DTOs, and UI.

**Given** a row is evaluated
**When** the readiness result is persisted
**Then** the system stores enough decision context to explain the row's current state
**And** later screens retrieve that state from Neon without recomputing it in the UI.

**Given** readiness logic runs more than once for the same row revision and inputs
**When** the evaluation completes
**Then** the system produces deterministic outcomes for the same conditions
**And** does not create inconsistent status behavior across repeated views.

**Given** an intake row has resolved R2-backed image assets
**When** readiness evaluation records image evidence
**Then** the readiness result references the server-controlled image asset IDs and preview endpoints
**And** does not store external image URLs or browser-local blob references as authoritative evidence.

### Story 3.2: Build the Batch Triage Workspace and Status-First Review Grid

As a catalog operator,
I want a batch review workspace that surfaces readiness counts, filters, and row states,
So that I can triage the highest-priority work quickly.

**Acceptance Criteria:**

**Given** a batch contains evaluated rows
**When** the operator opens the batch review workspace
**Then** they see a status-first triage surface with summary counts, row states, and filtering tools
**And** the interface follows the approved table-first UX direction using server-backed batch data.

**Given** the operator needs to focus on a subset of rows
**When** they filter or sort the workspace
**Then** the grid responds with the relevant rows and stable status presentation
**And** warnings, blockers, and readiness states remain visually distinct in text and visual treatment.

**Given** a batch contains many rows
**When** the operator scans the workspace
**Then** the grid remains operationally usable for triage
**And** the highest-leverage blocked or incomplete work is easy to identify.

**Given** the current prototype previously used mock rows
**When** the triage workspace loads
**Then** it reads rows and counts through the API/query layer from Neon
**And** hardcoded demo batch or row IDs are not used as fallback data.

### Story 3.3: Show Row Detail with Blocker, Warning, and Lifecycle Reasoning

As a catalog operator,
I want to open a row and inspect its blockers, warnings, evidence, and lifecycle state,
So that I can understand exactly why it is or is not ready.

**Acceptance Criteria:**

**Given** the operator selects a row from the batch workspace
**When** the row detail inspector opens
**Then** it shows the row summary, lifecycle state, readiness state, blockers, warnings, and supporting evidence
**And** these sections are separated clearly for review using the approved diagnostic-console UX pattern.

**Given** a row has one or more issues
**When** the operator reviews the detail view
**Then** each issue includes a reason and the next useful action
**And** the operator does not need to infer the correction path from vague messaging.

**Given** a row includes source, normalized, readiness, and image evidence
**When** the operator opens row detail
**Then** the inspector distinguishes source facts, normalized fields, validation results, R2-backed image evidence, and lifecycle history
**And** each section is sourced from persisted server data rather than mock row fixtures.

**Given** the operator closes or leaves the row detail view
**When** they return to the batch workspace
**Then** the broader batch context is preserved
**And** the row inspection does not feel like a disconnected screen jump.

### Story 3.4: Validate Identifier, Attribute, Variant, and Image Rules

As a catalog operator,
I want rows checked against submission-critical rules,
So that bad data is blocked before later workflow stages.

**Acceptance Criteria:**

**Given** a row is undergoing readiness validation
**When** validation rules run
**Then** the system checks identifier or exemption requirements, required attributes, variant structure, and image compliance
**And** records validation results in a row-explainable Neon-backed form with rule codes, severity, and remediation hints.

**Given** a required GTIN-style identifier is missing and no exemption path exists
**When** validation completes
**Then** the row is blocked in the correct readiness state
**And** the issue is shown as submission-critical.

**Given** a row fails variant or image validation
**When** the result is shown to the operator
**Then** the row detail identifies the failed rule area clearly
**And** the batch workspace distinguishes it from non-blocking warnings.

**Given** an image compliance rule evaluates a row
**When** image evidence is required
**Then** the system evaluates the image assets referenced by the persisted `image_id` values
**And** uses server-side R2 asset metadata or preview access rather than trusting client-supplied filenames.

### Story 3.5: Surface Duplicate Risk and Block Forced-Match Cases

As a catalog operator,
I want duplicate risk surfaced and forced-match cases blocked from the default path,
So that the system never silently changes listing mode.

**Acceptance Criteria:**

**Given** a row shows potential duplicate or catalog conflict signals
**When** readiness processing completes
**Then** the operator sees a duplicate-risk warning in the review workflow
**And** the row is not automatically switched into an existing-ASIN or offer flow.

**Given** pre-submission or catalog behavior indicates Amazon would force a match to an existing ASIN
**When** the system detects that condition
**Then** the row is blocked from default automated submission
**And** the blocked reason explicitly references forced-match protection.

**Given** duplicate risk is informational but forced-match is disqualifying for the default workflow
**When** both conditions are considered
**Then** the system distinguishes warning-grade duplicate signals from hard-stop forced-match outcomes
**And** preserves the new-product-only policy boundary.

**Given** duplicate or forced-match signals are produced
**When** the row is later inspected by operations or support users
**Then** the persisted readiness evidence includes the signal source, severity, and decision outcome
**And** the UI can explain the outcome without re-querying a mock catalog response.

### Story 3.6: Correct Rows In-Workflow and Revalidate Them

As a catalog operator,
I want to correct row issues and revalidate them inside the same workflow,
So that I can move blocked rows toward readiness without losing context.

**Acceptance Criteria:**

**Given** a row contains fixable issues
**When** the operator edits supported fields in the row workflow
**Then** those changes are persisted through the application
**And** the row remains traceable to its original source identity and current revision context in Neon.

**Given** the operator requests revalidation after a correction
**When** the revalidation completes
**Then** the row's readiness result and issue set are refreshed
**And** the operator can immediately see whether the correction resolved the problem.

**Given** a correction does not fully resolve the row
**When** revalidation finishes
**Then** the remaining blockers or warnings are shown clearly
**And** the workflow continues from the same context rather than resetting the operator's progress.

**Given** an edited row references a corrected image ID
**When** revalidation runs
**Then** the system resolves the corrected ID against the organization's persisted image assets
**And** blocks the row if the image asset is missing, forbidden, or not readable from R2.

### Story 3.7: Require Manual Confirmation for Ambiguous Product Type Resolution

As a catalog operator,
I want ambiguous product-type decisions surfaced for manual confirmation,
So that the system does not proceed on low-confidence classification.

**Acceptance Criteria:**

**Given** automatic product-type resolution is ambiguous or below confidence threshold
**When** readiness processing completes
**Then** the row is marked for manual product-type confirmation
**And** the system does not silently continue with a low-confidence product type.

**Given** the operator reviews a row requiring manual product-type confirmation
**When** they open the row detail workflow
**Then** they can see the ambiguity and the available confirmation path
**And** the decision is recorded for later traceability with the row revision and confirming user.

**Given** the operator confirms a product type
**When** revalidation runs afterward
**Then** downstream validation uses the confirmed product type
**And** the row can progress only if the rest of the readiness checks pass.

**Given** product-type confirmation options are shown
**When** the operator chooses or changes a product type
**Then** the UI shows the validation impact before or immediately after revalidation
**And** does not allow an ambiguous product type to appear ready for submission.

### Story 3.8: Preserve Batch Context and Resume Work Across Sessions

As a catalog operator,
I want filters, selections, and row context preserved while I move through review,
So that triage work remains efficient across long sessions and return visits.

**Acceptance Criteria:**

**Given** the operator is reviewing a filtered or sorted batch
**When** they open and close row details or navigate within the review workflow
**Then** the batch context such as filters, sort order, selected subset, and row focus is preserved
**And** the operator can continue triage without re-establishing context manually.

**Given** the operator leaves a previously created batch and returns later
**When** they resume work
**Then** the system restores the batch as an active ongoing workflow
**And** the operator can continue from a meaningful recent review context stored or recoverable from server-backed state.

**Given** the product is used in long-running operational sessions
**When** context preservation behavior is exercised repeatedly
**Then** it remains stable and predictable
**And** does not conflict with the authoritative server-side workflow state.

**Given** the current frontend gap analysis calls out incomplete URL-driven state and entity-aware shell context
**When** Epic 3 review screens are implemented
**Then** filters, selected row, correction focus, and batch identity are represented in stable URL or persisted view state
**And** refreshes, deep links, and back navigation preserve the intended review context.

## Epic 4: AI Enrichment and Truthful Image Preparation

Catalog operators can use constrained AI and image workflows to improve eligible rows without inventing facts or hiding uncertainty.

### Story 4.1: Run Non-Critical AI Enrichment on Eligible Rows

As a catalog operator,
I want eligible rows enriched for non-critical listing content,
So that I can reduce manual writing effort without changing factual product truth.

**Acceptance Criteria:**

**Given** a row is eligible for non-critical AI enrichment
**When** enrichment processing runs
**Then** the system generates marketplace-aligned non-critical content suggestions
**And** does not overwrite or invent unsupported factual product attributes.

**Given** a row is not eligible for safe enrichment
**When** the enrichment step is considered
**Then** the system skips or blocks enrichment according to workflow rules
**And** does not produce misleading completed-looking output.

**Given** enrichment output is produced
**When** it is attached to the row
**Then** it remains distinguishable from source-provided truth
**And** is available for operator review before submission.

### Story 4.2: Persist AI Confidence, Cost, and Decision Outcomes

As a catalog operator,
I want AI results stored with confidence and decision metadata,
So that the workflow can explain why content was accepted, escalated, skipped, or blocked.

**Acceptance Criteria:**

**Given** an AI enrichment or classification step completes
**When** the result is persisted
**Then** the row stores the AI output, confidence result, and workflow decision outcome
**And** later screens can retrieve that information without recomputing it in the client.

**Given** cost-sensitive AI rules are active
**When** a row is processed
**Then** the system records whether the row used a lower-cost path, stronger-model escalation, or a skipped path
**And** the resulting decision is visible for audit and support interpretation.

**Given** AI results affect readiness or review state
**When** the operator or support user inspects the row
**Then** the persisted confidence and decision metadata is available in an explainable form
**And** the row state can be justified from stored evidence.

### Story 4.3: Review and Approve AI-Generated Content Safely

As a catalog operator,
I want to inspect AI-generated suggestions separately from source facts,
So that I can approve or reject them with confidence.

**Acceptance Criteria:**

**Given** a row contains AI-generated or AI-augmented content
**When** the operator opens the review experience
**Then** source-provided facts, AI suggestions, and final confirmed content are shown distinctly
**And** the UI does not visually blur them together.

**Given** the operator reviews AI suggestions
**When** they accept or reject the generated content
**Then** the decision is persisted against the row or relevant row revision
**And** the row workflow reflects that decision consistently.

**Given** AI suggestions are available for different content areas
**When** the operator inspects them
**Then** they can review the suggestions without losing row context
**And** the review surface remains aligned with the approved diagnostic UX patterns.

### Story 4.4: Escalate Low-Confidence or Conflicting Enrichment

As a catalog operator,
I want low-confidence or conflicting AI results to trigger review states,
So that the system never hides uncertainty behind completed-looking output.

**Acceptance Criteria:**

**Given** an AI result falls below confidence threshold or conflicts with trusted source information
**When** the workflow decision is computed
**Then** the row is downgraded to a review-required state such as `NEEDS_INPUT` or `BLOCKED_FOR_REVIEW`
**And** the system does not auto-accept the output.

**Given** a row was escalated because of AI uncertainty
**When** the operator inspects the row
**Then** the reason for the escalation is shown clearly
**And** the next valid review action is provided.

**Given** cost and confidence rules are both active
**When** the system decides whether to escalate, skip, or accept an AI step
**Then** the decision follows configured policy guardrails
**And** the outcome is traceable afterward.

### Story 4.5: Assess Source Images for Listing Suitability

As a catalog operator,
I want source images evaluated for quality and compliance readiness,
So that I know whether image work can proceed safely.

**Acceptance Criteria:**

**Given** a row references one or more platform-managed image assets
**When** image suitability assessment runs
**Then** the system evaluates the assets for quality, usability, and listing-support readiness
**And** stores the results for later image-plan review.

**Given** an image asset is insufficient for truthful or compliant listing use
**When** the assessment completes
**Then** the issue is surfaced in the row workflow
**And** the row is prevented from advancing through unsupported image generation paths.

**Given** the operator needs to understand whether images are usable
**When** they inspect the row or image workflow
**Then** they can see assessment outcomes in a review-friendly form
**And** not just a binary hidden backend result.

### Story 4.6: Generate Truth-Preserving Image Plans and Transformations

As a catalog operator,
I want the system to produce image plans and limited truthful transformations from verified assets,
So that listing imagery can improve without inventing unsupported product facts.

**Acceptance Criteria:**

**Given** a row has suitable verified source imagery
**When** image planning or transformation runs
**Then** the system may propose or produce truthful image outputs derived from the source assets
**And** those outputs do not fabricate unseen packaging, accessories, labels, dimensions, or usage claims.

**Given** product identity or packaging truth cannot be established from the available evidence
**When** the system considers image generation
**Then** image generation is blocked or downgraded according to policy
**And** the row does not receive misleading synthetic imagery.

**Given** an image plan is generated
**When** it is stored for operator review
**Then** the row has a clear record of what image outputs were planned or produced
**And** the workflow preserves the relationship to the original source assets.

### Story 4.7: Review, Approve, or Block Image Outputs

As a catalog operator,
I want to inspect planned or generated image outputs before submission,
So that misleading or non-compliant imagery never enters the submission flow.

**Acceptance Criteria:**

**Given** a row has an image plan or generated image outputs
**When** the operator opens image review
**Then** they can inspect the planned or produced assets in context
**And** understand which images are source-derived, transformed, or blocked.

**Given** an image output is unsuitable or non-compliant
**When** the operator or system rejects it
**Then** that output is prevented from flowing into submission packaging
**And** the row retains a clear explanation of why it was blocked.

**Given** image review is complete
**When** the operator confirms acceptable outputs
**Then** the approved image plan is persisted for downstream submission use
**And** the decision remains traceable in support or audit workflows.

### Story 4.8: Configure AI and Image Guardrails

As an operations administrator,
I want configurable confidence thresholds and cost guardrails,
So that AI and image workflows remain commercially sensible and operationally safe.

**Acceptance Criteria:**

**Given** an administrator manages operational policy settings
**When** they configure confidence thresholds or cost guardrails
**Then** those settings are persisted and used by enrichment and image workflows
**And** the policies apply consistently to future processing runs.

**Given** policy settings materially influence workflow outcomes
**When** an operator or support user inspects an affected row
**Then** the resulting workflow behavior is explainable in terms of applied guardrails
**And** does not appear arbitrary.

**Given** policy settings are updated
**When** the change is saved
**Then** the system records an audit trail for the configuration action
**And** later investigations can determine which policy state influenced a given decision.

## Epic 5: Submission Execution and Outcome Recovery

Catalog operators can choose eligible rows, submit them to Amazon, monitor outcomes, recover from failures, and retry safely.

### Story 5.1: Select Submission Scope from Eligible Rows

As a catalog operator,
I want to choose which eligible rows to submit,
So that I can control the exact scope of a submission batch.

**Acceptance Criteria:**

**Given** a batch contains rows in mixed states
**When** the operator prepares a submission
**Then** they can select from eligible rows only
**And** rows blocked by validation or policy are clearly excluded from the selectable scope.

**Given** the operator chooses a submission subset
**When** the submission summary is shown
**Then** the UI displays included rows, excluded rows, and any remaining warnings in a clear scope summary
**And** the operator can confirm the scope before dispatch.

**Given** the submission surface is used repeatedly across batches
**When** scope selection occurs
**Then** the workflow remains consistent with the approved status vocabulary
**And** does not rely on hidden assumptions about row eligibility.

### Story 5.2: Build Submission-Ready Payloads with Schema Traceability

As a catalog operator,
I want the system to construct submission payloads from approved rows,
So that submission packaging is consistent and traceable.

**Acceptance Criteria:**

**Given** one or more eligible rows have been selected for submission
**When** payload construction runs
**Then** the system builds submission-ready payloads using the validated row data and approved assets
**And** excludes rows that violate submission rules.

**Given** a payload is constructed
**When** the submission attempt is persisted
**Then** the associated schema or product-type version is stored with the payload metadata
**And** the resulting submission can be traced back to the exact validation context.

**Given** a row is missing a required approved input at payload-build time
**When** construction is attempted
**Then** the row is prevented from entering the final payload
**And** the operator receives an explicit reason for the exclusion.

### Story 5.3: Execute New-Product Submission to Amazon

As a catalog operator,
I want approved rows sent through the correct Amazon submission path,
So that valid products can actually be created.

**Acceptance Criteria:**

**Given** a submission scope has been confirmed
**When** the dispatch process starts
**Then** the system sends the payload through the approved new-product submission path
**And** preserves the new-product-only policy boundary.

**Given** a row has a disqualifying submission condition such as forced-match protection or unresolved blocker state
**When** the system prepares to dispatch the submission
**Then** that row is not sent through the automated submission path
**And** the attempt records the reason for exclusion or blocking.

**Given** a submission request is accepted for processing
**When** the dispatch action completes
**Then** the operator receives a persisted submission attempt record
**And** the workflow moves into asynchronous monitoring rather than pretending the final outcome is already known.

### Story 5.4: Monitor Submission Status at Batch and Row Level

As a catalog operator,
I want to see queued, processing, success, failure, and follow-up states per batch and per row,
So that I can understand what happened after submission.

**Acceptance Criteria:**

**Given** a submission attempt is in progress or completed
**When** the operator opens monitoring views
**Then** they can see status at both the batch and row level
**And** the states include explicit async distinctions such as queued, processing, delayed, failed, and succeeded.

**Given** Amazon or internal sync status changes over time
**When** the monitoring workflow refreshes
**Then** the UI shows updated row and batch outcomes without requiring a misleading full reset of context
**And** operators can continue from the same monitoring workspace.

**Given** a row transitions through multiple submission-related states
**When** the operator or support user inspects that row
**Then** the timeline of outcome states is available in a readable form
**And** meaningful events are not hidden behind generic status labels.

### Story 5.5: Surface Amazon Errors and Recovery Actions

As a catalog operator,
I want returned Amazon errors translated into row-level recovery information,
So that I know what to fix next.

**Acceptance Criteria:**

**Given** Amazon returns a submission error for one or more rows
**When** the result is captured by the platform
**Then** the row-level outcome includes the returned error information
**And** the operator can inspect it in the monitoring or row workflow.

**Given** a row has failed after submission
**When** the operator reviews the failure
**Then** the UI shows a recovery-oriented explanation with the next useful action
**And** does not reduce the outcome to an opaque generic failure.

**Given** a batch has partial success and partial failure
**When** the operator reviews the batch outcome
**Then** successful and failed rows remain clearly separated
**And** the failed rows can be targeted for follow-up without disturbing unaffected rows.

### Story 5.6: Retry and Resubmit Rows Safely

As a catalog operator,
I want corrected or failed rows retried independently and idempotently,
So that I can recover outcomes without causing duplicate submissions.

**Acceptance Criteria:**

**Given** one or more rows failed and later become eligible again
**When** the operator requests retry or resubmission
**Then** the system can process those rows independently of unaffected rows in the original batch
**And** preserves traceability to the original batch and prior attempts.

**Given** the same row revision and submission intent are retried
**When** the system evaluates the new attempt
**Then** idempotency rules prevent accidental duplicate submission behavior
**And** the attempt record reflects whether it is a true new dispatch or a protected duplicate condition.

**Given** a corrected row is resubmitted successfully
**When** the retry completes
**Then** the updated outcome is visible in monitoring and support workflows
**And** the history of failure, correction, and retry remains preserved for audit and troubleshooting.

## Epic 6: Administration, Defaults, and Operational Governance

Operations administrators can manage defaults, policies, and operational oversight for listing preparation and system guardrails.

### Story 6.1: Manage Seller Defaults for Listing Preparation

As an operations administrator,
I want to configure seller defaults used during listing preparation,
So that operators do not have to repeat the same settings row by row.

**Acceptance Criteria:**

**Given** an administrator opens the defaults management area
**When** they create or update seller-level defaults
**Then** the system persists those defaults for later use in listing preparation
**And** the saved defaults are associated with the correct organization context.

**Given** defaults exist for relevant preparation fields
**When** later workflow stages consume row data
**Then** the defaults are available as controlled operational inputs
**And** they do not obscure which values came from defaults versus source or user edits.

**Given** a defaults change is invalid or incomplete
**When** the administrator attempts to save it
**Then** the UI blocks the invalid save with clear feedback
**And** does not leave the defaults state ambiguous.

### Story 6.2: Apply Operational Fulfillment, Condition, and Quantity Behaviors

As an operations administrator,
I want to control default operational behaviors for fulfillment and inventory-related fields,
So that row preparation follows consistent operational policy.

**Acceptance Criteria:**

**Given** an administrator manages operational default behaviors
**When** they define fulfillment, condition, or quantity defaults
**Then** those behaviors are available to later listing-preparation workflows
**And** the system uses them consistently where applicable.

**Given** a row or workflow needs to distinguish defaults from source-provided values
**When** the row is inspected
**Then** the origin of the operational values remains traceable
**And** defaults do not appear as native seller truth when they are administrative fallbacks.

**Given** different operational defaults may be required over time
**When** the administrator updates the configuration
**Then** subsequent processing uses the updated policy
**And** prior historical rows remain explainable against the configuration active at the time they were prepared.

### Story 6.3: Enforce New-Product-Only Policy Boundaries

As an operations administrator,
I want the system to visibly enforce the new-product-only workflow policy,
So that listing mode cannot drift into unsupported paths.

**Acceptance Criteria:**

**Given** the MVP workflow is restricted to new-product creation
**When** rows are prepared, reviewed, or submitted
**Then** the system enforces the new-product-only policy consistently
**And** does not silently route users into an existing-ASIN offer path.

**Given** an operator encounters a condition that would violate the new-product-only boundary
**When** the system surfaces that condition
**Then** the UI and workflow explain the policy block clearly
**And** the violation is handled as an explicit blocked path rather than an implicit reroute.

**Given** administrators need confidence that the rule is being enforced
**When** they review governance surfaces
**Then** the product provides visible evidence that the policy exists and affects workflow decisions
**And** those decisions remain traceable.

### Story 6.4: Review Operational Outcomes Across Batches

As an operations administrator,
I want visibility into recurring issues and workflow outcomes across batches,
So that I can improve throughput and spot systemic problems.

**Acceptance Criteria:**

**Given** multiple batches have been processed through the platform
**When** the administrator opens operational outcome views
**Then** they can review meaningful batch-level and recurring issue information
**And** the surface supports understanding where work is being lost or slowed.

**Given** recurring problems such as identifiers, variants, images, or ambiguity affect multiple batches
**When** the administrator reviews aggregated outcomes
**Then** those patterns are visible in a governance-friendly form
**And** not buried only inside row-by-row forensic views.

**Given** the governance view supports operational improvement rather than raw analytics sprawl
**When** the administrator uses it
**Then** the product emphasizes actionable outcomes and recurring workflow failure categories
**And** remains aligned with the operational scope of the MVP.

### Story 6.5: Preserve Audit History for Configuration and Operational Decisions

As an operations administrator,
I want material configuration and workflow decisions recorded,
So that changes and outcomes remain accountable and traceable.

**Acceptance Criteria:**

**Given** an administrator changes defaults, policies, or governance-relevant settings
**When** the change is saved
**Then** the system records an audit entry with actor, action, and timing context
**And** the resulting change can be reviewed later.

**Given** a workflow decision materially affects row or batch handling
**When** that decision is made by the system or an operator in a tracked flow
**Then** the relevant audit history is preserved
**And** support or governance users can reconstruct what happened.

**Given** audit information is exposed in admin or support workflows
**When** it is displayed
**Then** the history is readable and chronologically coherent
**And** it does not require direct database inspection to understand key changes.

### Story 6.6: Prepare Governance Models for Marketplace-Aware Expansion

As an operations administrator,
I want governance and configuration models designed to support future marketplace expansion,
So that later growth does not require a redesign of core operational controls.

**Acceptance Criteria:**

**Given** the MVP launches with Amazon.eg only
**When** governance and configuration models are implemented
**Then** they remain marketplace-aware in structure
**And** are not hard-coded in a way that prevents future marketplace extension.

**Given** defaults, policies, and governance surfaces may later need marketplace-specific variation
**When** the model is inspected or extended
**Then** there is a clear path to add marketplace-specific behavior
**And** current MVP behavior remains simple and correct.

**Given** future expansion is not yet fully implemented
**When** this story is completed
**Then** the design preserves forward compatibility without overbuilding speculative features
**And** the current admin experience remains focused on present operational value.

## Epic 7: Support Traceability and Future Integration Readiness

Support users can investigate row histories, understand decision chains, identify remediation steps, and preserve stable integration-facing identifiers and traceability.

### Story 7.1: Build the Support Investigation Workspace

As a support user,
I want a dedicated investigation workspace for problematic rows and batches,
So that I can troubleshoot issues without reverse-engineering the system.

**Acceptance Criteria:**

**Given** a support user needs to investigate a problematic batch or row
**When** they open the support workflow
**Then** they have a dedicated investigation surface separate from normal operator triage
**And** that surface is structured for diagnostic review rather than routine batch editing.

**Given** support users often need to move quickly between affected entities
**When** they search or navigate within the support workspace
**Then** the interface supports locating relevant rows or batches efficiently
**And** preserves the context needed for investigation.

**Given** support access is more sensitive than standard operator access
**When** the investigation workspace is used
**Then** access remains bounded by the approved authorization model
**And** elevated support visibility is still auditable.

### Story 7.2: Show Complete Row Lifecycle and Decision Trace

As a support user,
I want to inspect the full lifecycle of a row from intake through final outcome,
So that I can understand what happened at each stage.

**Acceptance Criteria:**

**Given** a support user opens a row investigation
**When** the lifecycle trace is displayed
**Then** it shows the row's progression from intake through validation, enrichment, submission, and recorded result states
**And** the lifecycle remains aligned to the approved status vocabulary.

**Given** the row has moved through multiple revisions or attempts
**When** the support user inspects its history
**Then** the trace preserves the sequence of meaningful transitions
**And** does not collapse important steps into an unreadable generic log.

**Given** lifecycle history is used to explain a current failure or dispute
**When** the support user reviews the trace
**Then** they can identify where the row changed state
**And** what decision or event caused that transition.

### Story 7.3: Show Data Provenance Across Source, Defaults, AI, and Submission

As a support user,
I want to see where each important piece of row data came from,
So that I can distinguish source truth from system-applied or generated values.

**Acceptance Criteria:**

**Given** a support user inspects a row with mixed data origins
**When** provenance information is displayed
**Then** they can see which important values came from the source spreadsheet, seller defaults, AI output, user edits, validation packaging, or submission payload construction
**And** those origins are shown distinctly.

**Given** a row includes AI-generated or default-derived values
**When** the support user reviews those fields
**Then** the UI does not present them as if they were original seller truth
**And** the provenance remains explicit enough to explain disputes or corrections.

**Given** the support user needs to compare what entered the system versus what was submitted
**When** they inspect the row history
**Then** the workflow exposes the relevant progression of data origin and transformation
**And** preserves the relationship between source values and final payload values.

### Story 7.4: Surface Explainable Remediation Guidance

As a support user,
I want the system to explain why a row failed and what can move it forward,
So that I can guide operators toward the correct fix.

**Acceptance Criteria:**

**Given** a row is blocked, downgraded, warned, or rejected
**When** the support user opens the row investigation
**Then** the workflow explains the issue in operational language
**And** includes a clear next-action path where one exists.

**Given** multiple issue types may affect a single row
**When** remediation guidance is shown
**Then** the system distinguishes the primary blocker from secondary warnings
**And** avoids forcing support users to infer priority from raw details alone.

**Given** a row cannot proceed without external or seller-provided input
**When** the support user reviews the case
**Then** the system indicates that limitation clearly
**And** does not imply that a purely internal fix is available when it is not.

### Story 7.5: Preserve Traceable Histories for Recurring Issue Analysis

As a support user,
I want row histories and issue patterns preserved over time,
So that repeated classes of failure can be recognized and investigated.

**Acceptance Criteria:**

**Given** similar failures recur across rows or batches
**When** support users review historical investigation data
**Then** the underlying issue patterns remain traceable over time
**And** prior row histories are available for comparison.

**Given** a row has gone through multiple cycles of failure, correction, and retry
**When** the support user reviews its history
**Then** the sequence remains preserved in a coherent chronological record
**And** repeated outcomes do not overwrite previous investigative context.

**Given** support workflows are used to learn from recurring issues
**When** the stored history is inspected
**Then** it highlights meaningful recurring failure classes
**And** avoids reducing investigation history to disconnected point-in-time snapshots.

### Story 7.6: Expose Stable Integration-Ready Traceability Boundaries

As a technical operations or future integration stakeholder,
I want stable identifiers and traceable workflow semantics preserved,
So that future import, export, or reporting integrations can be added safely.

**Acceptance Criteria:**

**Given** batches, rows, row revisions, and submission outcomes are used across the platform
**When** traceability boundaries are implemented
**Then** each relevant entity has a stable internal identifier suitable for future integration use
**And** those identifiers remain consistent across user-facing and backend workflows.

**Given** future integrations will depend on row identity and lifecycle semantics
**When** data is exposed or modeled for downstream use
**Then** the design preserves the approved workflow vocabulary and traceability guarantees
**And** does not break support or operational interpretation.

**Given** future import, export, or reporting workflows are out of scope for MVP implementation
**When** this story is completed
**Then** the current product is still prepared for those future extensions
**And** no speculative external interface is shipped prematurely.
