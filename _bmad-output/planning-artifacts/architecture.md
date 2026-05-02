---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/_bmad-output/planning-artifacts/prd.md"
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/_bmad-output/planning-artifacts/product-brief-Bulk-SKU-Creator.md"
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/_bmad-output/planning-artifacts/product-brief-Bulk-SKU-Creator-distillate.md"
workflowType: "architecture"
project_name: "Bulk-SKU-Creator"
user_name: "7egazy"
date: "2026-04-25"
lastStep: 8
status: "complete"
completedAt: "2026-04-25"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines a full operational pipeline rather than isolated features. Architecturally, the requirements cluster into five major capability layers:

1. Intake and normalization of spreadsheet rows and uploaded image assets.
2. Rules-driven classification and validation, including identifiers, required attributes, variants, duplicates, and image compliance.
3. AI-assisted classification, enrichment, and selective image transformation under strict truth and confidence constraints.
4. Operator-facing review, correction, submission selection, and batch tracking workflows.
5. Administrative governance, auditability, troubleshooting, and future integration readiness.

This means the architecture must support long-lived row state, explicit transitions, versioned processing, and clear separation between decision-making layers. A simple synchronous request/response design will not be sufficient for the full workflow.

**Non-Functional Requirements:**

The most architecture-shaping NFRs are:
- deterministic batch, row, and submission state preservation
- idempotent submission behavior
- schema-version traceability
- reliable integration with Amazon submission and status interfaces
- access control and audit visibility
- operator-usable performance during filtering, drill-down, and asynchronous job monitoring

These requirements point toward an architecture with durable workflow state, background job orchestration, strong audit trails, and clear separation between interactive application flows and asynchronous processing.

**Scale & Complexity:**

This project is high complexity because it combines:
- high-volume batch workflows
- external marketplace integration
- schema-sensitive validation
- AI confidence and cost controls
- image-processing safety constraints
- row-level lifecycle and troubleshooting requirements

- Primary domain: internal full-stack ecommerce operations workflow
- Complexity level: high
- Estimated architectural components: 8-12 major subsystems

### Technical Constraints & Dependencies

- Amazon SP-API is a hard external dependency for listing submission and outcome monitoring.
- Product-type schemas and required attributes are core runtime dependencies, not static reference material.
- The system must operate on internal `image_id` references rather than external image URLs.
- New-product-only flow is a hard business constraint that the architecture must enforce consistently.
- AI-generated content and images must remain subordinate to source truth, confidence thresholds, and cost controls.
- Product-type resolution, identifier handling, duplicate risk, and forced-match detection all need auditable decision paths.

### Cross-Cutting Concerns Identified

- Row lifecycle state management
- Row revisioning and batch traceability
- Confidence scoring and escalation policy
- Cost guardrails for AI and image work
- Schema versioning and validation reproducibility
- Retry and idempotency controls
- Access control and operational auditability
- Marketplace-aware extensibility beyond Amazon.eg

## Starter Template Evaluation

### Primary Technology Domain

Full-stack SaaS web application with:
- a Vite-based frontend intended to be iterated through Lovable-generated UI work
- a separate backend or service layer responsible for Amazon integration, workflow orchestration, lifecycle state, validation, AI decisions, and submission processing
- authenticated multi-user product behavior rather than internal-only operator tooling

### Starter Options Considered

**Option 1: Vite + React + TypeScript**
- Best fit for frontend generation and iteration
- Cleanest path for Lovable-driven UI output
- Minimal framework lock-in on the frontend
- Good if backend concerns will live in a separate app/service boundary

**Option 2: Next.js App Router**
- Still strong for full-stack SaaS products
- Less aligned with the stated frontend-generation workflow
- Adds more application conventions than wanted on the frontend side

**Option 3: React Router framework starter**
- Viable for full-stack React
- Less direct fit than Vite for prompt-driven frontend generation

### Selected Starter: Vite + React + TypeScript

**Rationale for Selection:**

Because the frontend will be generated and iterated from UX prompts using Lovable, the architecture should optimize for:
- low-friction frontend regeneration
- minimal opinionated framework constraints
- clear separation between frontend presentation and backend workflow services
- fast local feedback for a prompt-driven design/build loop

Vite is the strongest foundation for that frontend role. It keeps the frontend lightweight while allowing the backend architecture to evolve independently around SaaS, multi-tenant workflows, and Amazon-facing processing.

**Initialization Command:**

```bash
pnpm create vite@latest bulk-sku-creator-frontend --template react-ts
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript-based React frontend
- modern browser-targeted build and dev workflow

**Styling Solution:**
- not fully decided by the starter itself
- architecture should assume styling remains flexible so the UX flow can choose Tailwind, CSS modules, or another system deliberately

**Build Tooling:**
- Vite development server and production build pipeline
- fast iteration loop suitable for UI-heavy prompt-driven work

**Testing Framework:**
- base starter is lightweight
- testing setup can be added intentionally after frontend structure is stabilized

**Code Organization:**
- straightforward React project structure
- good for separating generated UI, shared components, domain views, and API client layers

**Development Experience:**
- fast hot reload
- low ceremony
- easy handoff between UX prompt output and application code integration

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Separate frontend and backend architecture
- Multi-tenant auth and organization model
- Primary database and ORM
- Async job orchestration model
- External API integration boundary
- API contract between frontend and backend

**Important Decisions (Shape Architecture):**
- Frontend routing and server-state strategy
- Backend framework choice
- Queue/worker topology
- Hosting model
- OpenAPI / API contract discipline

**Deferred Decisions (Post-MVP):**
- billing provider implementation
- analytics warehouse
- advanced event streaming
- marketplace expansion infrastructure beyond Amazon.eg

### Data Architecture

**Primary database:** Neon Postgres  
**ORM / schema tooling:** Prisma ORM  
**Caching / queue backing store:** Redis  
**Data modeling approach:** tenant-aware relational model with hard organization/workspace boundaries

**Rationale:**
- The product has structured relational entities: organizations, users, batches, rows, row revisions, product-type resolutions, submissions, audit events, image assets, AI decisions, and schema versions.
- PostgreSQL fits this better than document storage because traceability, lifecycle transitions, and reporting are core.
- Neon provides managed Postgres with a deployment model suited to SaaS application teams while retaining the relational model the workflow needs.
- Prisma gives strong TypeScript integration and schema management suited to a multi-service JS/TS stack.
- Redis is the right complement for background jobs, retries, throttling, and queue events.

**Architectural decisions:**
- Every business record must be tenant-scoped.
- Batch, row, row-revision, and submission records must be persisted relationally.
- Schema version references must be stored with validation and submission artifacts.
- Auditability is first-class, not an add-on.

### Authentication & Security

**Authentication platform:** Clerk  
**Multi-tenancy model:** Clerk Organizations  
**Authorization pattern:** organization-scoped RBAC plus backend-enforced resource ownership  
**Session model:** frontend session via Clerk, backend trust established through verified auth context

**Rationale:**
- This product is now SaaS, which makes tenant and organization boundaries foundational.
- Clerk Organizations directly matches workspace/team SaaS behavior and gives active-organization context, memberships, roles, and permissions.
- The frontend can move quickly while auth complexity is offloaded to a mature provider.
- Backend authorization still must enforce organization scoping independently of frontend state.

**Security decisions:**
- All row, batch, image, and submission access must be organization-scoped.
- Support/admin access must be explicitly elevated and auditable.
- Sensitive operational records must be encrypted in transit and protected at rest through platform controls and database/storage configuration.
- Public API calls from the frontend must never carry direct Amazon credentials.

### API & Communication Patterns

**Primary API pattern:** REST JSON API  
**API documentation:** OpenAPI-first or OpenAPI-synchronized contract  
**Backend integration boundary:** dedicated application API between frontend and backend; backend owns all Amazon, AI, and queue interactions  
**Error handling:** structured error model with row-level and batch-level codes

**Rationale:**
- The product is workflow-heavy, stateful, and operational. REST is a better fit here than GraphQL because the domain naturally exposes task-oriented resources: batches, rows, validations, previews, defaults, submissions, jobs, and audits.
- OpenAPI gives downstream consistency for AI agents and supports frontend/backend coordination.
- The frontend should be a consumer of application APIs, not a direct orchestrator of external systems.

**Communication decisions:**
- Frontend communicates only with the application backend.
- Backend communicates with Amazon SP-API, AI providers, storage, and queue infrastructure.
- Long-running operations return accepted/pending states and are completed asynchronously.
- Realtime updates, if added, should be limited to job or row-status notification channels rather than broad live-collaboration infrastructure.

### Frontend Architecture

**Frontend runtime:** Vite + React + TypeScript  
**Routing:** React Router  
**Server-state/data fetching:** TanStack Query  
**Client-state strategy:** minimal local UI state store only; avoid global business-state duplication  
**Design system direction:** generated UX integrated into a controlled component/system layer, not raw page-by-page drift

**Rationale:**
- Lovable-driven frontend generation needs a flexible, low-ceremony frontend foundation.
- React Router fits well for SaaS page/workspace flows without forcing full-stack framework coupling.
- TanStack Query is the right default for async workflow data, polling, mutation state, invalidation, and cache control.
- Keep client state small: filters, table UI state, selected rows, panel state. Business truth remains on the server.

**Frontend decisions:**
- Use route-based screens for auth, organization context, batch list, batch detail, row detail, defaults, and support/admin views.
- Use query-driven server state for batches, rows, validations, and submission outcomes.
- Generated UI from Lovable must land inside a controlled application structure rather than dictate domain architecture.

### Infrastructure & Deployment

**Application topology:** split frontend + API/backend + worker processes  
**Frontend hosting:** static/web frontend hosting for Vite build  
**Backend hosting:** containerized Node services  
**Worker hosting:** separate containerized worker process tier  
**Queue infrastructure:** Redis-backed job processing with BullMQ  
**Backend framework:** Express  
**Runtime baseline:** Node `20+`

**Recommended MVP deployment shape:**
- `frontend`: Vite-built React app
- `api`: Express application service
- `worker`: BullMQ worker service for validation, enrichment, image processing, and submission orchestration
- `postgres`: Neon Postgres primary relational store
- `redis`: queue + transient coordination

**Rationale:**
- The workflow has a natural split between interactive API traffic and long-running job execution.
- Separating API and workers avoids turning submission, enrichment, or image work into request/response bottlenecks.
- Express is the chosen backend fit for the service layer and should be treated as the stable API host for the SaaS application.
- BullMQ is a direct fit for retries, isolated row processing, concurrency control, and job orchestration.

### Decision Impact Analysis

**Implementation Sequence:**
1. Establish tenant/auth model
2. Define relational domain schema
3. Stand up backend API service and contract
4. Stand up queue/worker topology
5. Build frontend shell with auth and organization context
6. Implement batch/row workflow slices against the API
7. Add Amazon integration, AI services, and image pipeline behind workers

**Cross-Component Dependencies:**
- Auth model affects database schema, API authorization, and frontend routing
- Row lifecycle model affects database schema, worker design, API shape, and support tooling
- Queue strategy affects retries, idempotency, and submission orchestration
- API contract affects Lovable-generated frontend integration quality
- Tenant model affects every storage and access-control decision

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 6 areas where AI agents could make incompatible choices without explicit rules:
- tenant and organization scoping
- database and Prisma naming
- API route and payload conventions
- frontend file/component/query organization
- worker job naming and payload structure
- lifecycle, audit, and error semantics

### Naming Patterns

**Database Naming Conventions:**
- Use `snake_case` for database tables and columns.
- Use plural table names for top-level entities: `organizations`, `batches`, `batch_rows`, `row_revisions`, `submission_attempts`.
- Use `_id` suffix for foreign keys: `organization_id`, `batch_id`, `row_id`.
- Use explicit join or support table names instead of overloaded generic names.

**Prisma Naming Conventions:**
- Use `PascalCase` model names in Prisma: `Organization`, `Batch`, `BatchRow`, `RowRevision`, `SubmissionAttempt`.
- Map Prisma models to `snake_case` table names explicitly when needed.
- Use `camelCase` field names in Prisma/client-facing TypeScript code, even when the underlying database uses `snake_case`.

**API Naming Conventions:**
- Use plural REST resources: `/organizations`, `/batches`, `/rows`, `/submissions`.
- Use `kebab-case` for path segments where multiple words are needed.
- Use `camelCase` in JSON request/response bodies.
- Use stable resource IDs in route params: `/batches/:batchId/rows/:rowId`.

**Code Naming Conventions:**
- Use `PascalCase` for React components and Prisma models.
- Use `camelCase` for functions, variables, hooks, and service methods.
- Use `kebab-case` or feature-folder naming for route and file organization on the frontend.
- Use explicit names over generic names like `data`, `item`, or `handler` where domain meaning matters.

### Structure Patterns

**Project Organization:**
- Keep frontend, API, and worker codebases as separate applications or clearly separated packages.
- Organize frontend code by feature/domain first, not by generic type buckets.
- Organize backend code by domain modules such as `auth`, `organizations`, `batches`, `rows`, `submissions`, `schemas`, `ai`, `images`.
- Keep queue processors aligned to the same domain vocabulary as the API and database.

**File Structure Patterns:**
- Co-locate feature-specific UI, query hooks, schemas, and DTOs where practical.
- Keep shared types in clearly scoped shared packages or modules, but do not centralize unrelated domain logic into a generic `utils` dump.
- Keep Prisma schema, migrations, and generated client ownership in the backend/shared data layer, not in frontend code.
- Keep job processors and job payload contracts in dedicated worker modules.

### Format Patterns

**API Response Formats:**
- Successful responses use a consistent wrapper or a consistent direct-resource strategy across the API. Do not mix styles arbitrarily.
- Errors use a structured payload with machine-readable code plus human-readable message.
- Row-level validation responses must expose status, blocking reasons, warnings, and next-action guidance in a predictable format.
- Long-running actions return accepted/pending semantics instead of pretending work is complete synchronously.

**Data Exchange Formats:**
- JSON fields use `camelCase`.
- Date/time values use ISO 8601 strings in API payloads.
- Enums for lifecycle and readiness states use explicit uppercase or explicit string literals consistently across API, workers, and UI.
- Nullability must be deliberate and documented; do not use empty string and null interchangeably.

### Communication Patterns

**Event and Job Naming:**
- Use domain-oriented names such as `batch.normalized`, `row.validated`, `row.enriched`, `submission.dispatched`, `submission.completed`.
- Queue job names should reflect a single responsibility and a single domain step.
- Event/job payloads must always carry tenant context, batch/row identity, revision identity where relevant, and correlation metadata.

**State Management Patterns:**
- Frontend server state lives in TanStack Query.
- Frontend local UI state is limited to presentation concerns like filters, drawer state, selection state, and modal state.
- Backend remains the source of truth for lifecycle state, readiness state, and audit history.
- Query keys should be domain-scoped and stable, e.g. `['batches', organizationId]`, `['batchRows', batchId, filters]`.

### Process Patterns

**Error Handling Patterns:**
- Distinguish clearly between user-correctable errors, policy blocks, external integration failures, and internal system failures.
- Never collapse validation blockers into generic 500-style application errors.
- All externally visible errors should preserve a stable code and a user-meaningful message.
- All support-relevant failures must emit auditable backend logs with correlation identifiers.

**Loading and Async Workflow Patterns:**
- Frontend loading states reflect server truth for long-running operations rather than optimistic fake completion.
- Async workflows must expose lifecycle progress in a way the UI can poll or subscribe to consistently.
- Retry behavior must be explicit and domain-safe; retries must not create silent duplicate submission behavior.
- Row reprocessing must create traceable revision or attempt boundaries.

### Enforcement Guidelines

**All AI Agents MUST:**
- enforce organization scoping on every backend resource access
- preserve the row lifecycle vocabulary exactly as defined in the PRD
- use the shared API and status conventions instead of inventing local variants
- treat Prisma/database naming and API/frontend naming as intentionally different layers
- keep Lovable-generated frontend output inside the agreed route, query, and component boundaries
- avoid direct frontend coupling to Amazon, queue, or database concerns

**Pattern Enforcement:**
- Review new stories and code against naming, lifecycle, and tenant-scoping rules first.
- Treat deviations in status naming, payload format, and query keys as architecture violations, not style nits.
- Update the architecture document first before intentionally changing any cross-cutting convention.

### Pattern Examples

**Good Examples:**
- Database table: `batch_rows`
- Prisma model: `BatchRow`
- API field: `batchId`
- Query key: `['batchRows', batchId]`
- Job name: `row.validated`
- Error payload: `{ code, message, details }`

**Anti-Patterns:**
- Mixed `snake_case` and `camelCase` in public JSON
- One agent using `READY_WITH_AUGMENTATION` while another uses `READY_WITH_AI`
- Direct frontend calls to Amazon APIs
- Worker payloads that omit tenant or row revision context
- Generic folders like `misc`, `helpers2`, or `commonStuff`

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
bulk-sku-creator/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
├── .env.example
├── docs/
│   ├── architecture-notes/
│   ├── api-contracts/
│   └── operational-runbooks/
├── apps/
│   ├── web/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── public/
│   │   │   └── assets/
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── app/
│   │       │   ├── router.tsx
│   │       │   ├── providers/
│   │       │   ├── layouts/
│   │       │   └── guards/
│   │       ├── routes/
│   │       │   ├── auth/
│   │       │   ├── org/
│   │       │   ├── dashboard/
│   │       │   ├── batches/
│   │       │   ├── rows/
│   │       │   ├── defaults/
│   │       │   ├── support/
│   │       │   └── admin/
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   ├── organizations/
│   │       │   ├── batches/
│   │       │   ├── rows/
│   │       │   ├── validations/
│   │       │   ├── submissions/
│   │       │   ├── image-assets/
│   │       │   ├── seller-defaults/
│   │       │   └── support-tools/
│   │       ├── components/
│   │       │   ├── ui/
│   │       │   ├── data-grid/
│   │       │   ├── forms/
│   │       │   └── feedback/
│   │       ├── lib/
│   │       │   ├── api-client/
│   │       │   ├── query/
│   │       │   ├── auth/
│   │       │   ├── formatting/
│   │       │   └── utils/
│   │       ├── hooks/
│   │       ├── types/
│   │       └── styles/
│   ├── api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── app.ts
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   │   ├── health/
│   │   │   │   ├── auth/
│   │   │   │   ├── organizations/
│   │   │   │   ├── batches/
│   │   │   │   ├── rows/
│   │   │   │   ├── submissions/
│   │   │   │   ├── defaults/
│   │   │   │   ├── support/
│   │   │   │   └── admin/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   │   ├── auth/
│   │   │   │   ├── organizations/
│   │   │   │   ├── batches/
│   │   │   │   ├── rows/
│   │   │   │   ├── validations/
│   │   │   │   ├── submissions/
│   │   │   │   ├── schemas/
│   │   │   │   ├── ai/
│   │   │   │   ├── images/
│   │   │   │   └── audit/
│   │   │   ├── repositories/
│   │   │   ├── policies/
│   │   │   ├── dto/
│   │   │   ├── errors/
│   │   │   └── openapi/
│   └── worker/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── worker.ts
│           ├── queues/
│           ├── jobs/
│           │   ├── batch-normalization/
│           │   ├── row-validation/
│           │   ├── product-type-resolution/
│           │   ├── ai-enrichment/
│           │   ├── image-processing/
│           │   ├── submission-dispatch/
│           │   └── submission-status-sync/
│           ├── processors/
│           ├── services/
│           └── telemetry/
├── packages/
│   ├── database/
│   │   ├── package.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── client.ts
│   │       ├── tenancy.ts
│   │       └── seeds/
│   ├── contracts/
│   │   ├── package.json
│   │   └── src/
│   │       ├── api/
│   │       ├── events/
│   │       ├── enums/
│   │       └── schemas/
│   ├── config/
│   │   ├── package.json
│   │   └── src/
│   └── shared/
│       ├── package.json
│       └── src/
│           ├── logging/
│           ├── errors/
│           ├── ids/
│           ├── dates/
│           └── guards/
├── infrastructure/
│   ├── docker/
│   ├── ci/
│   └── scripts/
└── tests/
    ├── e2e/
    ├── integration/
    │   ├── api/
    │   └── worker/
    ├── contract/
    └── fixtures/
```

### Architectural Boundaries

**API Boundaries:**
- `apps/web` only talks to `apps/api`
- `apps/api` owns authentication enforcement, tenant scoping, and domain orchestration
- `apps/worker` never serves end-user HTTP traffic
- Amazon SP-API, AI providers, and asset processing are backend/worker-only integrations

**Component Boundaries:**
- `apps/web/features/*` owns domain-specific UI and frontend workflows
- `apps/web/components/ui/*` owns reusable design-system primitives
- `apps/web/lib/api-client/*` owns HTTP/API integration logic
- Lovable-generated screens must land within `routes/`, `features/`, and `components/` conventions

**Service Boundaries:**
- `apps/api/services/*` owns application logic invoked by HTTP routes
- `apps/worker/jobs/*` owns async execution logic for long-running workflows
- `packages/database` owns Prisma schema and shared DB bootstrap
- `packages/contracts` owns shared DTOs, enums, lifecycle states, and contracts

**Data Boundaries:**
- Persistent relational truth lives in Neon Postgres through Prisma
- Queue and job coordination state lives in Redis/BullMQ
- Asset binaries live in object storage, with metadata in Postgres
- Frontend never owns canonical business state beyond transient view state

### Requirements to Structure Mapping

**Feature / FR Category Mapping:**
- Ingestion & Batch Setup → `apps/web/features/batches`, `apps/api/services/batches`, `apps/worker/jobs/batch-normalization`
- Readiness & Validation → `apps/web/features/validations`, `apps/api/services/validations`, `apps/worker/jobs/row-validation`
- AI Enrichment & Content Generation → `apps/api/services/ai`, `apps/worker/jobs/ai-enrichment`
- Image Processing & Asset Review → `apps/web/features/image-assets`, `apps/api/services/images`, `apps/worker/jobs/image-processing`
- Review / Correction / Workflow Management → `apps/web/features/rows`, `apps/api/services/rows`
- Submission & Monitoring → `apps/web/features/submissions`, `apps/api/services/submissions`, `apps/worker/jobs/submission-dispatch`, `apps/worker/jobs/submission-status-sync`
- Administration / Governance / Defaults → `apps/web/features/seller-defaults`, `apps/api/services/organizations`, `apps/api/services/audit`
- Troubleshooting & Traceability → `apps/web/features/support-tools`, `apps/api/services/audit`, `apps/api/services/support`
- Internal Integration Readiness → `packages/contracts`, `apps/api/openapi`, future export/reporting surfaces

**Cross-Cutting Concerns:**
- Auth and tenancy → `apps/api/middleware`, `apps/api/policies`, `packages/database/src/tenancy.ts`, `apps/web/app/guards`
- Shared enums / lifecycle states / readiness states → `packages/contracts/src/enums`
- Error model → `packages/shared/src/errors`, `apps/api/errors`
- Logging and correlation → `packages/shared/src/logging`, `apps/worker/src/telemetry`

### Integration Points

**Internal Communication:**
- `web -> api` via REST/JSON
- `api -> worker` via BullMQ jobs
- `worker -> database` via Prisma
- `api <-> database` via Prisma
- `api/worker -> contracts/shared` via workspace packages

**External Integrations:**
- Clerk for authentication and organizations
- Amazon SP-API for listing submission and status tracking
- AI provider(s) for enrichment/classification
- image-processing provider/tooling
- object storage for uploaded/generated assets
- Redis for queue orchestration

**Data Flow:**
1. Frontend initiates batch workflow through API.
2. API persists batch + row records and enqueues processing.
3. Workers normalize, validate, enrich, and update row lifecycle state.
4. Frontend reads status through API with polling/query refresh.
5. Submission-ready rows are dispatched through worker jobs.
6. Submission results sync back into persisted row and batch state.

### File Organization Patterns

**Configuration Files:**
- Root workspace config at repository root
- app-specific runtime config inside each app
- shared environment parsing in `packages/config`
- `.env.example` at root, app-specific expectations documented, not duplicated arbitrarily

**Source Organization:**
- Domain-first structure inside each app
- shared contracts/types extracted into packages only when genuinely cross-app
- no direct imports from frontend into backend internals or vice versa

**Test Organization:**
- app-local unit tests may be co-located where useful
- integration tests under `tests/integration`
- contract tests under `tests/contract`
- e2e tests under `tests/e2e`
- worker-flow tests explicitly separate from API-route tests

**Asset Organization:**
- static frontend assets in `apps/web/public/assets`
- uploaded/generated product assets outside repo in storage, referenced by metadata records
- fixtures only in `tests/fixtures`

### Development Workflow Integration

**Development Server Structure:**
- frontend, API, and worker run independently in local development
- shared packages resolve through workspace tooling
- local orchestration scripts live under `infrastructure/scripts` or root package scripts

**Build Process Structure:**
- each app builds independently
- shared packages build first or resolve through workspace-aware tooling
- Prisma generation occurs through the database package and is consumed by API/worker

**Deployment Structure:**
- frontend deploys separately from API and worker
- API and worker scale independently
- database and Redis are managed infrastructure dependencies
- architecture supports future service extraction without rewriting frontend structure

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** `PASS`
- Vite + React frontend, Express API, BullMQ workers, Neon Postgres, Prisma, Clerk, and Redis are compatible as a SaaS workflow stack.
- The split between frontend, API, and worker tiers matches the PRD's async processing and row-lifecycle requirements.
- Multi-tenant auth and tenant-scoped relational data model align with the SaaS direction.

**Pattern Consistency:** `PASS`
- Naming, payload, lifecycle, and tenant-scoping rules are internally consistent.
- The Prisma/database vs API/frontend naming split is explicitly documented, which avoids a common multi-agent conflict.
- The frontend/server-state separation is clear and supports Lovable-generated UI without giving it architectural control.

**Structure Alignment:** `PASS`
- The project tree supports the chosen stack and isolates boundaries cleanly.
- FR categories have clear architectural homes.
- Shared contracts, database ownership, worker isolation, and API boundaries are explicit enough for downstream agents.

### Requirements Coverage Validation

**Functional Requirements Coverage:** `PASS`
- All major FR groups are represented: ingestion, validation, AI enrichment, image processing, review flows, submissions, governance, traceability, and integration readiness.
- High-risk FRs such as row lifecycle, schema versioning, forced-match blocking, cost controls, and idempotency are architecturally supported.

**Non-Functional Requirements Coverage:** `PASS`
- Performance is addressed through async processing split, query-driven UI, and worker isolation.
- Security is addressed through Clerk, org-scoped RBAC, backend authorization, and data-boundary separation.
- Reliability is addressed through BullMQ, revisioning, row lifecycle persistence, and retry/idempotency strategy.
- Integration and scalability concerns are covered at the topology level.

### Implementation Readiness Validation

**Decision Completeness:** `MOSTLY PASS`
- Core stack is fully specified.
- Major boundaries are clear.
- Multi-agent conflict points are documented.
- One remaining gap: object storage provider is still generic, which is acceptable now but should be chosen before implementation stories that touch upload or generated asset persistence.

**Structure Completeness:** `PASS`
- The monorepo structure is concrete enough to start implementation planning.
- App/package boundaries and ownership are clear.
- Test organization and shared package ownership are defined.

**Pattern Completeness:** `PASS`
- Naming, API, lifecycle, error, job, and frontend-query patterns are explicit.
- The patterns are strong enough to prevent most AI-agent divergence during implementation.

### Gap Analysis Results

**Critical Gaps:** none identified

**Important Gaps:**
- Object storage provider not yet chosen. This affects uploaded image persistence and generated asset handling.
- OpenAPI generation approach not fully pinned. The architecture uses OpenAPI discipline, but not whether it is code-first or spec-first in day-to-day workflow.
- Realtime status transport is left intentionally flexible. The architecture allows polling or evented updates, but does not yet commit to one.

**Nice-to-Have Gaps:**
- Billing and subscription architecture deferred
- Analytics/reporting architecture deferred
- Marketplace expansion abstractions beyond Amazon.eg intentionally not detailed yet

### Validation Issues Addressed

- Internal-only assumption was removed and replaced with SaaS assumptions.
- Backend stack was corrected from Fastify to Express.
- Database choice was corrected from generic Postgres to Neon Postgres.
- Frontend foundation was corrected from Next.js recommendation to Vite, aligned with the Lovable workflow.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented
- [x] Technology stack specified
- [x] Integration patterns defined
- [x] Performance and reliability implications addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements-to-structure mapping completed

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION PLANNING

**Confidence Level:** high

**Key Strengths:**
- Strong alignment with the PRD's real complexity
- Clear SaaS boundary model
- Good separation between frontend generation workflow and backend operational complexity
- Explicit worker-based handling for async, risky, and retriable flows
- Strong multi-agent consistency rules

**Areas for Future Enhancement:**
- choose object storage provider
- lock OpenAPI workflow details
- decide whether submission-status UX uses polling only or adds push-style updates later
- add billing architecture when SaaS monetization becomes active scope

### Implementation Handoff

**AI Agent Guidelines:**
- Follow the architectural boundaries exactly.
- Treat `apps/web`, `apps/api`, and `apps/worker` as separate ownership zones.
- Preserve row lifecycle, readiness vocabulary, and tenant-scoping rules from the PRD and architecture.
- Do not let frontend code directly absorb queue, database, or Amazon responsibilities.

**First Implementation Priority:**
```bash
pnpm create vite@latest bulk-sku-creator-frontend --template react-ts
```

- Then scaffold the workspace structure around `apps/web`, `apps/api`, `apps/worker`, and shared packages.
