---
title: "Product Brief Distillate: Bulk-SKU-Creator"
type: llm-distillate
source: "product-brief-Bulk-SKU-Creator.md"
created: "2026-04-25T21:02:08+03:00"
purpose: "Token-efficient context for downstream PRD creation"
---

# Product Brief Distillate: Amazon Bulk SKU Creator

## Core Product Intent

- Internal-first tool for bulk creation of new Amazon product listings from spreadsheet rows plus uploaded product images.
- Primary launch scope is Amazon.eg only, but the architecture should remain marketplace-aware from the start.
- System must always follow `listing_path = NEW_PRODUCT`; no offer-on-existing-ASIN workflow is allowed.

## Core Operating Rules

- Duplicate detection is a safety check and research aid only; it must not switch the submission path away from new product creation.
- AI may augment missing non-critical content but may not invent factual product attributes.
- Source-of-truth priority is: spreadsheet data, uploaded images, seller defaults, marketplace defaults, Amazon schema, then AI inference.
- Every row must resolve to one of four statuses: `READY`, `READY_WITH_AUGMENTATION`, `NEEDS_INPUT`, or `NOT_ENOUGH_DATA`.

## Requirements Hints

- Each row needs marketplace, brand, raw item name, price, currency, quantity, and fulfillment information.
- Each row must also provide a GTIN-style identifier or a confirmed GTIN exemption; otherwise the row is blocked.
- Seller-level defaults should support fulfillment channel, condition, quantity fallback, and optional shipping or returns preferences.
- Variant handling is controlled mode only, with explicit group id, relationship type, and variation theme when variants exist.
- If seller grouping is missing, AI may suggest grouping but unclear cases should remain blocked for human input.

## Image and Content Constraints

- Spreadsheet should reference uploaded `image_id` values rather than external image URLs.
- Default image plan is two images per product, with optional expansion to four where truthful source material supports it.
- Main image must remain compliant: clean product shot, white background, no overlays or fabricated accessories.
- Image pipeline should include quality checks, extraction, truth validation against spreadsheet data, selective generation, and compliance review.

## AI and Cost Strategy

- Use a low-cost model tier for classification, extraction, normalization, and basic content generation.
- Escalate to a stronger model only for ambiguity, low confidence, or complex categories.
- Use GPT image generation selectively rather than on every SKU.
- Product value proposition depends partly on low average cost per SKU, so AI usage policies are product-critical, not implementation detail.

## MVP Modules

- Spreadsheet ingestion
- Data sufficiency engine
- Product type resolution
- Variant builder
- AI enrichment engine
- Image pipeline
- Validation engine
- Listing payload builder
- Feed submission and monitoring
- Error resolution center

## In Scope for MVP

- Amazon.eg only
- New product creation only
- Spreadsheet upload
- Image upload and mapping
- Controlled variant support
- AI-assisted enrichment
- Bulk submission
- Per-row preview and status tracking

## Explicitly Out of Scope

- Offer-on-existing-ASIN flows
- Automatic ASIN matching as a listing mode
- AI-generated factual claims without source evidence
- GTIN-free submission without documented exemption
- Unvalidated variation themes

## Success Signals

- First-pass submission success rate
- Percentage of rows auto-completed
- Cost per SKU processed
- Manual edits required before submission

## Open Questions

- Whether seller defaults such as returns and shipping need to be marketplace-specific in the first release or can remain account-wide.
- How much product-type-specific schema guidance should be exposed in the preview UI versus kept internal to validation logic.
- Whether Amazon.eg-only launch should ship with extension hooks for additional marketplaces immediately or defer that generalization until after MVP validation.
