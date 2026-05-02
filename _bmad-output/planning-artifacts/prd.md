---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/_bmad-output/planning-artifacts/product-brief-Bulk-SKU-Creator.md"
  - "d:/Terminal/Terminal/Bulk-SKU-Creator/_bmad-output/planning-artifacts/product-brief-Bulk-SKU-Creator-distillate.md"
workflowType: "prd"
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: "web_app"
  domain: "general"
  complexity: "high"
  projectContext: "greenfield"
releaseMode: "single-release"
---

# Product Requirements Document - Bulk-SKU-Creator

**Author:** 7egazy
**Date:** 2026-04-25

## Executive Summary

Bulk-SKU-Creator is an internal-first web application for creating new Amazon product listings in bulk from spreadsheet data and uploaded product images. It is designed for catalog operations teams that need a controlled way to turn incomplete seller inputs into submission-ready listings without relying on manual Seller Central work or unsafe AI automation. The initial release targets Amazon.eg only and treats the product as a greenfield system built around marketplace-aware expansion later.

The core problem is not just bulk listing creation. It is the operational gap between messy source data and compliant marketplace submission. Teams struggle with missing identifiers, inconsistent product attributes, invalid variant structures, weak content, and image issues that cause repeated failures and expensive manual correction. Existing approaches either push too much work onto humans or let automation produce outputs that appear complete but are not trustworthy enough to submit.

This product addresses that gap through a truth-first workflow: ingest, normalize, validate, enrich, preview, and submit. Each row is classified into a clear readiness state so the team knows whether it is ready, can be safely augmented, needs seller input, or cannot proceed. AI is used to improve speed and completeness where possible, but it is explicitly constrained from inventing factual product data. The result is a bulk listing pipeline optimized for first-pass success, lower manual effort, and lower cost per SKU.

### What Makes This Special

What makes this product special is not generic AI assistance, but controlled automation under hard business rules. The system always creates new products, never switches into an offer-on-existing-ASIN flow, and uses duplicate detection only as a safety check. That constraint removes ambiguity from the listing path and makes the system operationally predictable.

The key insight is that bulk listing automation only becomes reliable when data sufficiency is treated as a first-class decision layer. Instead of masking missing critical inputs with generated content, the system makes readiness explicit and uses AI only for non-critical augmentation. That gives operations teams a workflow they can trust: one that accelerates throughput without sacrificing factual accuracy, marketplace compliance, or cost discipline.

## Project Classification

- **Project Type:** `web_app`
- **Domain:** `general` with an ecommerce marketplace operations focus
- **Complexity:** `high`
- **Project Context:** `greenfield`

## Success Criteria

### User Success

Catalog operators can upload a spreadsheet and product image set, review row-by-row readiness, and reach a submission-ready preview without needing to manually reconstruct listing requirements in Seller Central. Users should quickly understand which SKUs are blocked, which can be auto-augmented safely, and what exact seller input is still required.

Success for the user is operational confidence: they trust that the system will not hide critical data gaps, invent factual attributes, or silently route them into the wrong Amazon listing path. The "aha" moment is when a messy spreadsheet becomes a clearly classified bulk workload with actionable statuses, valid image plans, and submission-ready listing payloads.

### Business Success

The product is successful if it materially increases listing throughput while reducing manual correction effort and failed submissions. In the first phase, the business outcome is a reliable internal workflow for new Amazon.eg product creation that lowers cost per SKU and reduces dependency on manual listing labor.

At 3 months, success looks like internal teams using the tool for real listing batches and trusting its readiness decisions. At 12 months, success looks like strong first-pass submission performance, lower average processing cost per SKU, and a foundation that is reusable for additional marketplaces without redesigning the core workflow.

### Technical Success

The system must reliably enforce new-product-only listing creation, validate required attributes before submission, and preserve truth-first AI constraints across enrichment and image generation. It must produce row-level status outcomes deterministically and support controlled variant structures, seller defaults, image compliance checks, and bulk submission monitoring.

Technical success also means predictable operations: the system handles ingestion, normalization, validation, enrichment, preview, and feed submission as distinct modules with clear error resolution paths. Performance should be good enough that bulk processing feels operationally useful rather than batch-admin heavy, especially during preview and validation.

### Measurable Outcomes

- Increase first-pass submission success rate for new Amazon.eg listings.
- Reduce manual edits required per SKU before submission.
- Increase the percentage of rows that can be completed as `READY` or `READY_WITH_AUGMENTATION`.
- Reduce average time from upload to submission-ready preview.
- Lower average AI and processing cost per SKU.
- Keep per-row enrichment and image-processing cost within configurable seller or workspace guardrails.
- Reduce the number of rows that fail due to avoidable issues such as missing identifiers, invalid variant structures, or non-compliant images.

## Product Scope

### MVP - Minimum Viable Product

Amazon.eg only, new product creation only, spreadsheet upload, image upload and mapping, data sufficiency classification, controlled variant handling, AI-assisted non-critical enrichment, row preview, validation, feed submission, and submission status monitoring.

### Growth Features (Post-MVP)

Marketplace expansion beyond Amazon.eg, stronger schema guidance by product type, smarter seller-default management, improved exception-resolution workflows, and broader automation around enrichment confidence handling and image plan optimization.

### Vision (Future)

A marketplace-aware catalog operations platform that lets teams launch large numbers of products across regions through a controlled, truth-first listing pipeline. Over time, it becomes the operational system of record for bulk listing readiness, submission quality, and scalable catalog expansion.

## User Journeys

### Primary User - Success Path

Mariam is a catalog operations specialist responsible for launching dozens or hundreds of new products into Amazon.eg. Today, she starts with a spreadsheet from a supplier that is partially complete, inconsistently formatted, and paired with a folder of product images that may or may not match the rows cleanly. Her current process is slow because every missing identifier, weak title, invalid variant grouping, or image issue turns into manual investigation.

She uploads the spreadsheet and image set into Bulk-SKU-Creator. The system maps rows, links image IDs, normalizes obvious formatting issues, and evaluates each row for data sufficiency. Instead of a vague import success message, she gets a row-by-row readiness view showing which SKUs are ready, which can be safely augmented, which need more seller input, and which cannot proceed. This is the moment the product starts to feel different: the workload becomes legible.

As she reviews the preview, the system has already improved non-critical content where allowed, validated the variant structure, flagged missing GTIN or exemption cases, and proposed a compliant image plan. She is not guessing what Amazon will reject later. She is deciding whether to accept a controlled, explicit listing package.

The climax of the journey is bulk submission. Mariam sends a filtered set of validated rows to Amazon through the feed process and can monitor status by row instead of losing visibility in a black-box batch. Her new reality is that launching a large listing batch feels operationally managed rather than manually improvised.

This journey reveals requirements for spreadsheet ingestion, image mapping, row-level status modeling, preview UX, validation workflows, AI augmentation constraints, and bulk submission monitoring.

### Primary User - Edge Case / Recovery Path

Later, Mariam uploads a new batch that contains missing identifiers, unclear parent-child relationships, mismatched images, and one suspected duplicate product already present in the catalog. In a weaker system, this would either fail late or hide the issues behind generated content that looks plausible but is unsafe.

Here, the system blocks what must be blocked. Duplicate detection appears as a warning and investigation aid, not as an automatic switch to a different listing path. Invalid variation themes are surfaced before submission. Rows missing GTIN or exemption are explicitly marked `NOT_ENOUGH_DATA`. Some rows are downgraded to `NEEDS_INPUT`, with the exact missing fields called out.

Her emotional state changes from frustration to controlled triage. She is no longer trying to figure out why Amazon rejected a listing after the fact. She is resolving issues before submission with precise guidance. The recovery path matters as much as the happy path because this product only works if users trust it under imperfect input conditions.

This journey reveals requirements for blocker classification, duplicate-warning workflows, missing-data prompts, variant validation, row-level error explanation, and pre-submission recovery tooling.

### Admin / Operations User

Omar is the internal operations lead responsible for configuring how the tool behaves across listing batches. He is less concerned with individual titles and more concerned with system consistency. He needs to define seller defaults for fulfillment channel, condition, quantity fallbacks, and optional operational settings so that teams do not repeat the same choices row by row.

He enters the admin area to manage marketplace-aware defaults, check recent submission batches, review processing outcomes, and understand where failures are clustering. He wants to know whether the team is losing time on identifiers, image issues, variant problems, or product-type ambiguity. He also needs confidence that the system is enforcing the non-negotiable rules: new-product-only flow, truth-first augmentation, and no invented factual attributes.

The climax of his journey is not a single submission but operational visibility. He can see whether the system is reducing cost per SKU, increasing first-pass success rates, and helping the team process larger batches with less manual effort. His resolution is governance: the tool is not just functional, it is controllable.

This journey reveals requirements for defaults management, auditability, status dashboards, operational analytics, configuration governance, and policy enforcement visibility.

### Support / Troubleshooting User

Nadine supports the catalog team when a batch behaves unexpectedly. She is called in when users say a row should have passed but did not, when an image was rejected, or when a submission returned a confusing Amazon-side error. She needs to inspect row history, validation outcomes, enrichment decisions, and feed-status transitions without reverse-engineering the pipeline from scratch.

She opens a problem row and can see what source data came from the spreadsheet, what came from seller defaults, what AI changed, what the validation engine rejected, and what the final submission payload contained. If a generated image was suppressed for compliance reasons, she needs to know why. If a row was downgraded from augmentable to blocked, she needs the reason chain.

The product delivers value here by making failure understandable. Instead of support becoming a forensic exercise across disconnected tools, Nadine can trace one row through the system and give the operator a clear next action. Her new reality is faster issue resolution and better institutional learning from recurring failure patterns.

This journey reveals requirements for row history, decision traceability, validation explainability, feed response capture, and operator-facing remediation guidance.

### Integration / Technical Operations User

If the product later exposes internal integration points, Kareem is the technical operations user who wants to connect upstream product data sources or downstream reporting flows. He is not looking for a public developer platform; he wants structured, reliable interfaces for bulk import, export, and operational reporting.

He needs predictable schemas, stable status models, and clear mappings between source rows and submission outcomes. What matters to him is not visual convenience but consistency and traceability. If integrations are added later, they must preserve the same readiness logic and truth-first constraints already enforced in the UI.

This journey reveals future requirements for import/export contracts, stable identifiers, event or status APIs, and operational data models that can be consumed programmatically.

### Journey Requirements Summary

- Bulk spreadsheet import with image-to-row mapping and row identity preservation.
- A row-level readiness engine with explicit statuses, warnings, and blockers.
- Safe AI augmentation limited to non-critical content.
- Strict validation for GTIN/exemption, required attributes, images, and variants.
- Duplicate detection as a warning workflow, not a listing path decision.
- Submission preview and row-level batch monitoring.
- Admin configuration for seller defaults and governance.
- Troubleshooting views with traceability across ingestion, enrichment, validation, and submission.
- Future-compatible contracts for internal integrations and reporting.

## Domain-Specific Requirements

### Identifier & Catalog Matching Policy

- The system shall require a valid GTIN-style identifier or a valid exemption path for any row whose Amazon product type requires one.
- If a required GTIN is missing and no exemption evidence exists, the row shall be classified as `NOT_ENOUGH_DATA`.
- If a GTIN is present and catalog lookup indicates likely existing catalog ownership or strong duplicate risk, the row shall be escalated to manual review before submission.
- If Amazon submission or pre-submission checks force matching to an existing ASIN, the system shall not silently switch to an offer-on-existing-ASIN flow. It shall block automated submission and require explicit manual operator decision outside the default workflow.
- Categories or product types with optional identifiers shall be handled according to their resolved schema rules rather than a blanket identifier assumption.

### Compliance & Regulatory

- The system must enforce Amazon marketplace listing rules relevant to new product creation, especially required attributes, identifier rules, variation-theme validity, and image compliance.
- The system must respect the policy boundary that new-product creation is the only allowed listing path in MVP; duplicate detection may inform operator review but must not automatically change listing mode.
- The system must preserve factual accuracy in generated content and images; AI output cannot be used to invent identifiers, materials, dimensions, certifications, packaging contents, or other unsupported claims.

### Technical Constraints

- The platform must support high-volume batch workflows without turning validation and preview into an operational bottleneck.
- Row-level status classification must be deterministic and explainable so users can understand why a SKU is `READY`, `READY_WITH_AUGMENTATION`, `NEEDS_INPUT`, or `NOT_ENOUGH_DATA`.
- The system must maintain traceability across source spreadsheet data, uploaded images, seller defaults, AI augmentation decisions, validation outcomes, and final submission payloads.
- Access control and auditability should support internal operational use, especially around who changed defaults, approved rows, or resubmitted failed items.

### Integration Requirements

- The system must integrate with Amazon Selling Partner API submission flows for new listing creation and with the relevant catalog or feed status endpoints needed for monitoring and troubleshooting.
- The ingestion layer must rely on internally managed image identifiers rather than external image URLs and must reliably map spreadsheet rows and uploaded image identifiers into the internal listing model without losing row identity.
- The architecture should preserve a marketplace-aware abstraction so Amazon.eg can be the first release without hard-coding the entire system to a single marketplace forever.

### Risk Mitigations

- Risk: users trust generated outputs that hide critical missing data.
  Mitigation: enforce the data sufficiency engine as a first-class gate and prevent non-critical augmentation from masking blocked rows.
- Risk: duplicate detection creates operator confusion about whether the product should create a new listing or attach to an existing ASIN.
  Mitigation: keep duplicate signals informational only and preserve `NEW_PRODUCT` as a hard workflow rule.
- Risk: invalid variation structures and image issues cause repeated submission failures late in the process.
  Mitigation: validate themes, parent-child relationships, and image compliance before submission preview is approved.
- Risk: generated images or generated content drift away from the real product.
  Mitigation: allow only truth-preserving transformations of verified source assets and block generation when product identity is unclear.
- Risk: support and troubleshooting become expensive because row failures are not explainable.
  Mitigation: keep row-level decision history and validation reasoning visible throughout the pipeline.

## Operational Decision Models

### Row Lifecycle Model

Each row moves through an explicit lifecycle:

`UPLOADED -> NORMALIZED -> CLASSIFIED -> VALIDATED -> ENRICHED -> REVIEW_READY -> SUBMITTED -> RESULT_RECORDED`

- Rows may branch into `NEEDS_INPUT`, `NOT_ENOUGH_DATA`, `BLOCKED_FOR_REVIEW`, or `FAILED_SUBMISSION` from the validation, enrichment, or submission stages.
- Lifecycle transitions shall be persisted and inspectable so operators and support users can understand both current state and prior decisions.

### Product Type Resolution Strategy

Product type resolution follows a strict fallback hierarchy:

1. Seller-provided product type or category mapping when present and valid.
2. Rule-based or schema-backed mapping from trusted input fields.
3. AI classification when seller input is missing or ambiguous.
4. Manual operator selection when confidence is below threshold or multiple product types remain plausible.

Wrong product type is treated as a submission-critical failure mode. The system shall never silently continue with a low-confidence product type.

### AI Confidence & Cost Control

- Every AI-assisted enrichment or classification decision shall carry a confidence result that affects workflow state.
- High-confidence non-critical enrichment may remain in `READY_WITH_AUGMENTATION`.
- Low-confidence or conflicting enrichment shall downgrade the row to `NEEDS_INPUT` or `BLOCKED_FOR_REVIEW` instead of being auto-accepted.
- The system shall use configurable cost controls to decide when to skip stronger models or image generation.
- Expensive steps such as stronger-model escalation or image generation shall run only when lower-cost processing is insufficient and the row still appears commercially viable.

### Image Safety Rules

- Generated listing images must be transformations of verified source product imagery, not synthetic inventions of unseen product facts.
- The system shall not fabricate packaging contents, accessories, labels, dimensions, or usage scenes that are not supported by source evidence.
- If product identity, packaging truth, or attribute truth cannot be established from uploaded assets and seller data, the row shall be downgraded to `NOT_ENOUGH_DATA` or `NEEDS_INPUT`.
- The MVP image contract is internal image upload plus internal `image_id` reference only. External image URL ingestion is out of scope.

### Retry, Idempotency & Versioning

- Rows and batches shall support partial retry without requiring a full-batch restart.
- Submission attempts shall be idempotent from the system perspective so duplicate send behavior can be detected and controlled.
- Row corrections shall create a new row revision or processing revision while preserving traceability to the original uploaded row.
- Batch processing shall isolate row-level failures where possible so one failed row does not invalidate unrelated rows.

### Schema Versioning

- Each batch shall record the schema or product-type definition version used for validation and payload construction.
- Row validation outcomes shall remain traceable to the schema version active at processing time.
- Schema changes from Amazon shall not silently reinterpret historical batch results.

## Web App Specific Requirements

### Project-Type Overview

Bulk-SKU-Creator is a browser-based internal operations application optimized for high-volume structured work rather than public discovery or marketing traffic. Its value depends on turning complex bulk-listing workflows into a fast, inspectable, low-friction web experience for internal users handling many SKUs per session.

### Technical Architecture Considerations

The application should favor a responsive, stateful workflow model suited to bulk review, correction, and submission. The interface must support long-running batch operations, row-level status updates, and progressive visibility into validation and submission outcomes without forcing users to restart or lose context.

The architecture should separate ingestion, validation, enrichment, preview, and submission monitoring into clear application modules so that the web experience remains predictable even when backend processing is asynchronous. Users should be able to move between batch overview and row-level inspection without ambiguity about current state.

### Browser Support Matrix

The product should support modern desktop browsers used in internal operations environments, with primary optimization for Chromium-based browsers and current Firefox. Mobile browser support is not a priority for MVP beyond basic non-broken rendering, because the core workflow is spreadsheet-heavy and operationally desktop-first.

The UI should preserve usability across common laptop screen sizes used by operations teams. Large-table workflows, side panels, validation details, and image review areas should be designed for sustained desktop use rather than touch-first interaction.

### Responsive Design Requirements

Responsive behavior should prioritize preserving task flow rather than simply shrinking layouts. On narrower screens, the system should collapse secondary panels and preserve core row review, blocker explanation, and submission actions in a readable sequence. The product should remain functional on smaller screens for review use, but primary authoring and bulk correction workflows should target desktop.

### Performance Targets

The web application should feel operationally immediate during upload review, row filtering, status inspection, and correction workflows. Users must be able to inspect large batches without sluggish table rendering or excessive waiting between state transitions.

Performance targets should focus on:
- fast batch ingestion feedback after upload
- quick rendering of row-level readiness summaries
- low-latency filtering, sorting, and drill-down into row details
- clear asynchronous progress handling for validation, image processing, and submission monitoring

### Accessibility Level

The product should meet a practical internal-accessibility baseline: keyboard-navigable tables and actions, clear status labeling, readable validation messages, sufficient contrast, and structured semantics for forms and review screens. Accessibility matters here not only for compliance hygiene but for operator efficiency in dense, repetitive workflows.

### Implementation Considerations

Because this is an internal web app, the biggest risk is not public-facing polish but operational friction. The implementation should prioritize clarity of state, recovery from partial failures, durable batch context, and low-friction review flows. Every major web interaction should help users answer three questions quickly: what happened, what is blocked, and what should I do next.

## Project Scoping

### Strategy & Philosophy

**Approach:** single-release, operations-first MVP. The release should prove that the end-to-end workflow works for real Amazon.eg bulk listing operations: ingest, classify, validate, enrich safely, preview, submit, and troubleshoot. The priority is not breadth of channels or automation novelty; it is a trustworthy production path for new-product bulk submission.

**Resource Requirements:** at minimum, this needs product/ops input, a full-stack application engineer, a backend/integration engineer with SP-API familiarity, and design or UX support strong enough to make dense operational workflows usable. If resourcing is tighter, UX and product can be combined operationally, but backend integration and workflow design cannot be dropped.

### Complete Feature Set

**Core User Journeys Supported:**
- Primary operator happy path from upload to validated bulk submission
- Primary operator recovery path for blocked or ambiguous rows
- Admin and operations oversight for defaults, governance, and batch monitoring
- Support and troubleshooting path for row-level investigation and issue resolution

**Must-Have Capabilities:**
- Spreadsheet upload and row normalization
- Image upload and row/image association
- Data sufficiency engine with explicit readiness statuses
- GTIN/exemption validation and required-attribute validation
- Controlled variant handling and theme validation
- Truth-constrained AI enrichment for non-critical content
- Image compliance workflow with selective enhancement/generation
- Row-level preview with missing-field and warning visibility
- New-product-only submission flow to Amazon SP-API
- Batch and row-level submission monitoring
- Seller defaults management
- Traceability for validation, enrichment, and submission decisions

**Nice-to-Have Capabilities:**
- Deeper product-type-specific schema guidance in the UI
- Stronger operational analytics and trend reporting
- Smarter exception resolution tooling and guided remediation
- Expanded internal integration/export interfaces
- Broader automation around confidence handling and optimization policies
- Early scaffolding for future marketplace expansion beyond what is strictly needed for Amazon.eg launch

### Risk Mitigation Strategy

**Technical Risks:** the highest-risk areas are SP-API submission correctness, variant validation, and maintaining explainable row-level decisions across AI and rules-based processing. Mitigation should focus on modular pipeline design, deterministic validation layers, strong payload inspection before submission, and audit-friendly row histories.

**Market Risks:** the biggest product risk is building something that automates processing but does not actually earn operator trust. The release should validate that users prefer this workflow over manual listing operations because it is clearer, safer, and faster, not just more automated.

**Resource Risks:** if team capacity is smaller than expected, the safest compression is to reduce analytics depth, defer richer schema-guidance UX, and keep integrations minimal beyond the core Amazon.eg submission path. The release should not drop row-level readiness modeling, validation clarity, or troubleshooting traceability, because those are core to product trust.

## Functional Requirements

### Ingestion & Batch Setup

- FR1: Catalog operators can create a new batch by uploading a spreadsheet of product rows.
- FR2: Catalog operators can upload product images and associate them with product rows through stable image identifiers.
- FR3: The system can preserve source row identity throughout ingestion, review, submission, and troubleshooting.
- FR4: Catalog operators can review detected spreadsheet fields and mapped product data before processing continues.
- FR5: The system can normalize uploaded product data into a consistent internal listing structure.
- FR6: Catalog operators can reprocess a batch after correcting source data or image associations.

### Readiness & Validation

- FR7: The system can evaluate each row for listing readiness before submission.
- FR8: The system can classify each row as `READY`, `READY_WITH_AUGMENTATION`, `NEEDS_INPUT`, or `NOT_ENOUGH_DATA`.
- FR9: Catalog operators can see the specific reason a row received its current readiness status.
- FR10: The system can validate whether each row has a valid product identifier or a documented exemption path.
- FR11: The system can validate required listing attributes before a row is eligible for submission.
- FR12: The system can validate variant grouping structure, relationship type, and variation theme rules.
- FR13: The system can validate uploaded images against listing compliance requirements.
- FR14: The system can flag potential duplicate catalog conflicts without changing the listing path.
- FR15: Catalog operators can review warnings separately from submission-blocking issues.
- FR16: The system can detect when Amazon catalog behavior or pre-submission checks would force matching to an existing ASIN and block default automated submission.

### AI Enrichment & Content Generation

- FR17: The system can enrich non-critical listing content for eligible rows.
- FR18: The system can prevent AI enrichment from inventing unsupported factual product attributes.
- FR19: Catalog operators can review AI-generated or AI-augmented content before submission.
- FR20: The system can identify when seller input is required instead of attempting automated completion.
- FR21: The system can apply stronger review or escalation logic when enrichment confidence is insufficient.
- FR22: The system can generate listing content outputs aligned to marketplace-specific listing needs.
- FR23: The system can persist AI confidence results for classification and enrichment decisions.
- FR24: The system can use configurable cost and confidence rules to decide whether to skip, accept, escalate, or block AI-assisted processing.

### Image Processing & Asset Review

- FR25: The system can assess uploaded images for quality and suitability for listing use.
- FR26: The system can determine whether uploaded images support compliant main-image creation.
- FR27: The system can generate or enhance images only when the source material supports truthful output.
- FR28: Catalog operators can review the image plan for each row before submission.
- FR29: The system can prevent misleading or non-compliant generated image outputs from entering the submission flow.
- FR30: The system can block image generation when product identity or packaging truth cannot be established from source evidence.

### Review, Correction & Workflow Management

- FR31: Catalog operators can review a row-level preview of listing data before submission.
- FR32: Catalog operators can filter and sort rows by readiness status, warnings, blockers, and submission state.
- FR33: Catalog operators can inspect missing fields and required corrections for blocked or incomplete rows.
- FR34: Catalog operators can update or supply missing row data through the application workflow.
- FR35: Catalog operators can choose which eligible rows to include in a submission batch.
- FR36: The system can preserve batch context while users move between batch overview and row-level detail.
- FR37: Catalog operators can resume work on previously created batches.
- FR38: The system can display the current lifecycle stage and transition history for each row.
- FR39: The system can require manual product-type confirmation when automated product-type resolution is ambiguous.

### Submission & Monitoring

- FR40: The system can build submission-ready listing payloads for eligible rows.
- FR41: The system can submit new-product listing batches to Amazon through the approved submission path.
- FR42: The system can prevent rows that violate core submission rules from being submitted.
- FR43: Catalog operators can monitor submission progress and outcomes at both batch and row level.
- FR44: The system can capture and display submission errors returned by Amazon.
- FR45: Catalog operators can identify which rows succeeded, failed, or require follow-up after submission.
- FR46: Catalog operators can resubmit corrected rows after issues are resolved.
- FR47: The system can retry failed rows independently of unaffected rows in the same batch.
- FR48: The system can preserve idempotent submission intent for repeated processing or resubmission attempts.
- FR49: The system can store the schema or product-type version used when a payload was constructed and submitted.

### Administration, Governance & Defaults

- FR50: Operations administrators can define seller-level defaults used during listing preparation.
- FR51: Operations administrators can manage default fulfillment, condition, and quantity behaviors.
- FR52: Operations administrators can review operational outcomes across batches to identify recurring issues.
- FR53: The system can enforce the rule that MVP listing creation follows the new-product-only path.
- FR54: The system can record meaningful audit history for operational decisions and configuration changes.
- FR55: Operations administrators can configure confidence thresholds and cost guardrails that influence enrichment and image-processing decisions.

### Troubleshooting & Traceability

- FR56: Support users can inspect the lifecycle of a row from source ingestion through final submission outcome.
- FR57: Support users can see which data came from source files, defaults, AI augmentation, validation, and submission packaging.
- FR58: The system can explain why a row was blocked, downgraded, warned, or rejected.
- FR59: Support users can identify remediation actions needed to move a row forward.
- FR60: The system can preserve traceable row histories for recurring issue analysis and support workflows.

### Internal Integration Readiness

- FR61: The system can expose stable internal identifiers for batches, rows, row revisions, and submission outcomes.
- FR62: The system can support future internal import, export, or reporting workflows without breaking row traceability.
- FR63: The system can maintain marketplace-aware data structures that support future marketplace expansion.

## Non-Functional Requirements

### Performance

- NFR1: The system shall provide visible batch-ingestion feedback within 10 seconds of a valid spreadsheet and image upload starting.
- NFR2: The system shall display row-level readiness summaries for a processed batch without requiring users to reload the workspace.
- NFR3: The system shall support filtering, sorting, and opening row-level detail views with interaction latency that remains operationally usable for large internal batches.
- NFR4: The system shall present long-running operations such as validation, image processing, and submission monitoring with explicit progress or status feedback.
- NFR5: The system shall preserve user context during review workflows so operators can move between batch and row detail without losing work state.

### Security

- NFR6: The system shall restrict access to authorized internal users only.
- NFR7: The system shall enforce role-appropriate access for operators, administrators, and support users.
- NFR8: The system shall protect data in transit and at rest for uploaded files, product data, generated assets, and submission records.
- NFR9: The system shall maintain audit visibility for configuration changes, submission actions, and material workflow decisions.
- NFR10: The system shall prevent unauthorized users from viewing or modifying batch data, seller defaults, or row-level submission records.

### Reliability

- NFR11: The system shall preserve batch, row, and submission state across asynchronous processing steps.
- NFR12: The system shall fail rows safely by surfacing blockers and warnings rather than silently degrading data quality.
- NFR13: The system shall preserve traceable row histories so support users can investigate failures after processing or submission completes.
- NFR14: The system shall prevent invalid or blocked rows from being included in final submission payloads.
- NFR15: The system shall recover gracefully from partial batch failures by isolating row-level issues where possible instead of invalidating the entire batch.
- NFR16: The system shall preserve idempotent behavior for repeated submission attempts against the same row revision and submission intent.

### Integration

- NFR17: The system shall integrate reliably with Amazon submission and status interfaces required for new-product listing workflows.
- NFR18: The system shall preserve stable mappings between source rows, internal row identifiers, uploaded images, and downstream submission outcomes.
- NFR19: The system shall tolerate delayed or failed external responses by surfacing integration state clearly to internal users.
- NFR20: The system shall maintain marketplace-aware data handling so future marketplace expansion does not require redesign of the core processing model.
- NFR21: The system shall preserve schema-version traceability for validation and submission outcomes.

### Accessibility

- NFR22: The system shall support keyboard-accessible navigation for core operational workflows including batch review, row inspection, and action execution.
- NFR23: The system shall present statuses, warnings, blockers, and validation results in text form rather than color alone.
- NFR24: The system shall maintain readable form structure, labeling, and contrast for dense internal workflow screens.

### Scalability

- NFR25: The system shall support growth in batch volume, row count, and internal user adoption without requiring a redesign of the core workflow model.
- NFR26: The system shall allow processing capacity to expand independently of the operator-facing review interface.
- NFR27: The system shall maintain operationally usable behavior as listing volume increases across additional marketplaces in future releases.
