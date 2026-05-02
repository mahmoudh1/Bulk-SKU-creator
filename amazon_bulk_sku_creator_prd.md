# Amazon Bulk SKU Creator (Final PRD)

## Goal
Build an internal-first app that ingests a spreadsheet of product data, enriches it with AI, validates marketplace/category requirements, and creates **new Amazon product listings in bulk** using the official Selling Partner API.

⚠️ Important constraint:
- This system **always creates new products** (no offer-on-existing-ASIN flow)
- Duplicate detection is used only as a **safety check**, not as a listing path switch

---

## Core Principles

### 1. Always New Product Creation
- `listing_path = NEW_PRODUCT`
- No automatic ASIN matching for offers
- Catalog search is only used for:
  - duplicate detection
  - research
  - enrichment

---

### 2. Data Sufficiency Engine (CRITICAL)
Each row must return one of the following:

- **READY** → all required data available
- **READY_WITH_AUGMENTATION** → non-critical data auto-filled
- **NEEDS_INPUT** → preview available but missing required inputs
- **NOT_ENOUGH_DATA** → critical data missing, cannot proceed

### Data Hierarchy (Source of Truth Priority)
1. Spreadsheet data
2. Uploaded images
3. Seller defaults
4. Marketplace defaults
5. Amazon schema
6. AI inference

### Rule
- AI **can augment**
- AI **cannot invent factual attributes**

---

## Marketplace Scope
- Start with: **Amazon.eg only**
- System must be marketplace-aware from day one

---

## Identifier Policy (CRITICAL)
Per product:
- Must provide **GTIN / UPC / EAN** OR
- Must confirm **GTIN exemption**

If neither is available:
➡️ `NOT_ENOUGH_DATA`

---

## Fulfillment Defaults
Seller-level configuration:
- fulfillment_channel → FBA / FBM
- condition_type → default (e.g. NEW)
- quantity → default fallback
- shipping/returns → optional defaults

---

## Input Spreadsheet Schema

### Minimum Required
- client_row_id
- marketplace_code
- brand
- item_name_raw
- product_type_hint (optional but recommended)
- price
- currency
- quantity
- fulfillment_channel

### Identifier (MANDATORY PER ROW)
- external_product_id
- external_product_id_type

---

## Variant Handling (Controlled Mode — REQUIRED)

### Required Columns (when variants exist)
- variant_group_id
- relationship_type (parent / child)
- variation_theme (e.g. COLOR, SIZE, COLOR_SIZE)

### Variant Attributes
- color
- size
- material
OR
- variant_attribute_1
- variant_attribute_2

### Example
| row | group | type | theme | color | size |
|-----|------|------|------|------|------|
| 1   | A    | parent | COLOR_SIZE | | |
| 2   | A    | child  | COLOR_SIZE | Red | M |
| 3   | A    | child  | COLOR_SIZE | Blue | M |

### Rules
- If grouping provided → trust seller
- If missing → AI suggests but marks NEEDS_INPUT if unclear
- If invalid theme → block submission

---

## Image Strategy (Cost-Optimized)

### Default: 2 Images (RECOMMENDED)
1. Main image (white background)
2. Secondary (detail or simple lifestyle)

### Optional: 4 Images
1. Main image
2. Alternate angle
3. Detail / packaging (⚠️ DO NOT INVENT)
4. Lifestyle / usage

### Rules
- Never fabricate packaging contents
- Never add fake accessories
- Keep main image clean and compliant

---

## Image Upload System (REPLACES EXCEL URLS)

### Supported Modes

#### 1. Bulk Upload (ZIP)
- Folder per product (by client_row_id)

#### 2. Batch Upload UI
- Drag & drop images
- System assigns IDs

#### 3. Single Upload
- Upload per row manually

### Spreadsheet Reference
- Use **image_id** (NOT URLs)

---

## Image Generation Pipeline

### Step 1: Quality Check
- blur detection
- product visibility
- background complexity

### Step 2: Product Extraction
- isolate product
- identify orientation

### Step 3: Truth Validation
- compare visible data vs spreadsheet
- flag mismatch

### Step 4: Generation (GPT Image Model)
- clean main image
- generate additional images if needed

### Step 5: Compliance Check
- white background main image
- no overlays/text

### Fail Conditions
- product not identifiable → NEEDS_INPUT
- misleading generation risk → NOT_ENOUGH_DATA

---

## AI System Design

### Low-Cost Tier (Primary)
- Qwen-Flash (or equivalent)
- Used for:
  - classification
  - extraction
  - normalization
  - simple content

### High-Quality Tier (Fallback)
- stronger model (OpenAI / Qwen Plus)
- Used only when:
  - ambiguity
  - low confidence
  - complex categories

### Image Model
- GPT Image model
- Used selectively (NOT for every SKU)

### Cost Rules
- Default = minimal generation
- Only enhance when needed
- Default image count = 2

---

## AI Tasks

### Allowed
- title generation
- bullet points
- description
- keyword generation
- product classification
- missing field detection

### Forbidden (Critical)
- invent GTIN
- invent ingredients/materials
- invent certifications
- invent dimensions
- invent packaging contents

---

## System Modules
1. Spreadsheet ingestion
2. Data sufficiency engine
3. Product type resolver
4. Variant builder
5. AI enrichment engine
6. Image pipeline
7. Validation engine
8. Listing builder
9. Feed submission system
10. Error resolution center

---

## Core Workflow

### Step 1: Upload
- spreadsheet + images

### Step 2: Normalize
- map fields
- clean values

### Step 3: Validate
- schema check
- restrictions

### Step 4: AI Enrichment
- fill non-critical gaps

### Step 5: Image Processing
- enhance or generate images

### Step 6: Preview
- show SKU preview
- show missing data

### Step 7: Seller Input (if needed)
- collect missing critical fields

### Step 8: Submit
- JSON_LISTINGS_FEED

### Step 9: Monitor
- track status per row

---

## Validation Rules
- required attributes present
- GTIN or exemption exists
- valid variation structure
- images valid
- SKU unique
- no duplicate conflict

---

## Error Classification

### Hard Blockers
- missing GTIN/exemption
- missing required attributes
- invalid variant structure
- product type unresolved

### Soft Warnings
- weak content
- missing optional images
- low confidence attributes

---

## Output (Per Row)

Each row produces:

- SKU preview
- status
- missing fields
- warnings
- image plan

---

## Success Metrics
- first-pass success rate
- % rows auto-completed
- cost per SKU
- manual edits required

---

## MVP Scope
- Amazon.eg only
- new product creation only
- spreadsheet upload
- image upload system
- 2–4 image generation
- variant support (explicit mode)
- AI enrichment
- bulk submission

---

## Final Recommendation

Build as:

👉 **SP-API-first + AI-assisted + cost-optimized bulk listing system**

Key advantages:
- scalable
- controlled
- low cost
- high success rate

---

## Next Step

Design:
1. Database schema
2. API endpoints
3. Spreadsheet contract v1
4. Prompt system for each agent

