# Bulk-SKU-Creator Screen Prompts

Use these prompts in Lovable to generate the main application screens for `Bulk-SKU-Creator`.

## Global Prompt

Use this global prompt before generating any individual screen:

```text
Design a SaaS web app screen for Bulk-SKU-Creator, a truth-first Amazon listing operations platform. The product turns messy spreadsheet uploads and product images into submission-ready Amazon listing batches.

Visual direction:
- Desktop-first operations UI, not a marketing site
- Calm, precise, trustworthy, serious
- Avoid generic AI-dashboard aesthetics
- Use a warm off-white / light stone background foundation, white panels, muted gray borders, deep charcoal text, and an ink-blue primary accent
- Semantic status colors only: restrained green for READY, blue-teal for READY_WITH_AUGMENTATION, amber for NEEDS_INPUT, red-orange for NOT_ENOUGH_DATA / blocked
- Dense but breathable layout
- Strong information hierarchy
- Table-first triage surfaces when appropriate
- Progressive disclosure for detail, evidence, AI reasoning, and audit traces

Design system assumptions:
- Tailwind-style tokens
- shadcn/ui-style primitives
- Custom workflow components layered on top

UX rules:
- Always make it obvious what happened, what is blocked, and what the next action is
- Distinguish source facts, AI suggestions, warnings, and blockers clearly
- Preserve batch context when moving into row detail
- Use side panels or split views for row inspection where possible
- Show realistic operational content, not lorem ipsum
- Use labels, statuses, tables, filters, and timeline/event UI suitable for enterprise workflow software

Accessibility:
- Strong contrast
- Clear focus states
- Never rely on color alone
- Clear text labels for all statuses

Output:
- Create a polished, implementation-ready SaaS application screen
- Use realistic content for Amazon bulk listing operations
- Optimize for desktop first, but keep the layout responsive
```

## 1. Auth Entry Screen

```text
Using the global Bulk-SKU-Creator design brief, create the authentication entry screen for a SaaS application.

Screen goal:
- Help users sign in or create an account
- Communicate that the product is an operational platform for Amazon bulk listing creation
- Keep the experience clean and professional, not marketing-heavy

Layout requirements:
- Split layout or centered auth card
- Left or top area with short product value statement
- Main auth panel with sign in and sign up entry points
- Show organization-aware SaaS framing

Content requirements:
- Product name: Bulk-SKU-Creator
- Short message about turning messy spreadsheets into submission-ready Amazon listings
- Email and password entry
- SSO-friendly layout if needed
- Link to create workspace / create account
- Link to join existing organization if invited

Design notes:
- Calm and trustworthy, not flashy
- Minimal illustration if any
- Emphasize product seriousness and operational clarity
```

## 2. Organization Workspace Selection Screen

```text
Using the global Bulk-SKU-Creator design brief, create the organization and workspace selection screen after authentication.

Screen goal:
- Let users choose an organization or workspace
- Support users who belong to multiple organizations
- Let new users create a workspace if needed

Layout requirements:
- Clean workspace selection view
- List of organizations with role badges
- Primary action to continue into selected workspace
- Secondary action to create a new workspace

Content requirements:
- Organization name
- Role label such as Operator, Support, Admin
- Last active indicator
- Create workspace CTA
- Invite or join workflow entry point

Design notes:
- This is not a consumer account switcher
- It should feel like entering a serious operational environment
```

## 3. Dashboard Overview Screen

```text
Using the global Bulk-SKU-Creator design brief, create the main dashboard overview screen for a SaaS workspace.

Screen goal:
- Give users a quick operational overview
- Provide entry points into batches, submission monitoring, defaults, and support
- Show what needs attention today

Layout requirements:
- Persistent left navigation
- Workspace header with organization context
- Summary cards for active batches, blocked rows, ready rows, failed submissions
- A priority panel showing what needs attention first
- Recent batches table
- Recent submission outcomes or alerts panel

Content requirements:
- Active batch counts
- Readiness breakdown
- Failed or delayed submission alerts
- Recent activity feed
- Quick actions such as Create Batch, Resume Batch, Review Failures

Design notes:
- This screen should feel like a command overview, not a BI dashboard
- Use restrained charts if any; favor counts, states, and actionable lists
```

## 4. Batches List Screen

```text
Using the global Bulk-SKU-Creator design brief, create the batch list screen.

Screen goal:
- Let users browse, search, and resume batches
- Show operational status at a glance
- Make it easy to create a new batch

Layout requirements:
- Persistent app shell
- Page header with Create Batch primary button
- Dense table of batches
- Filters for status, date, owner, marketplace
- Search bar

Content requirements:
- Batch name
- Created date
- Owner
- Total rows
- Ready count
- Needs input count
- Blocked count
- Submission state
- Last updated

Design notes:
- This should feel like a serious operations queue
- Use clear status chips and compact row summaries
- Include an empty state for no batches yet
```

## 5. Create Batch / Upload Intake Screen

```text
Using the global Bulk-SKU-Creator design brief, create the create-batch intake screen where users upload spreadsheet data and product images.

Screen goal:
- Start a new batch
- Upload spreadsheet and image assets
- Make the process feel like the start of analysis, not just file transfer

Layout requirements:
- Multi-section intake form in a single calm workspace
- Batch name field
- Spreadsheet upload zone
- Image upload zone
- Optional seller / workspace settings preview
- Sidebar or footer summary of what will happen next

Content requirements:
- Drag-and-drop spreadsheet area
- Drag-and-drop image upload area
- Notes on supported formats
- Marketplace label: Amazon.eg
- New-product-only reminder
- Primary CTA: Start Analysis
- Secondary CTA: Save Draft

Design notes:
- Avoid wizard overload
- Show upload readiness and file validation clearly
- Use clear guidance for image IDs and row mapping expectations
```

## 6. Intake Mapping and Preprocessing Review Screen

```text
Using the global Bulk-SKU-Creator design brief, create the preprocessing review screen shown after upload but before full processing continues.

Screen goal:
- Let users review detected spreadsheet fields and image mappings
- Surface mapping problems early
- Give users confidence before processing

Layout requirements:
- Split layout with field mapping review on the left and mapping issues / preview on the right
- Compact table preview of first rows
- Image ID mapping review section
- Intake issues panel

Content requirements:
- Source column to internal field mapping
- Row preview
- Image identifier preview
- Warnings for missing required source data
- CTA to continue processing
- CTA to edit mappings

Design notes:
- This should feel like a controlled checkpoint
- Highlight mismatches without making the screen feel punitive
```

## 7. Batch Review and Triage Workspace

```text
Using the global Bulk-SKU-Creator design brief, create the main batch review and triage workspace. This is the most important screen in the whole product.

Screen goal:
- Turn a processed batch into a legible, actionable triage surface
- Help users understand what is ready, blocked, risky, or incomplete
- Support filtering and rapid row inspection

Layout requirements:
- Persistent left navigation
- Workspace header with batch title and lifecycle status
- Batch status summary bar with counts for READY, READY_WITH_AUGMENTATION, NEEDS_INPUT, NOT_ENOUGH_DATA, blocked review, submitted
- Guided priority banner showing what to fix first
- Large table-first triage surface
- Right-side or split-panel row detail preview for selected row

Content requirements:
- Filter chips for readiness status, blocker type, submission state, product type, owner
- Search by row ID / SKU / product name
- Table columns such as product, status, blocker, AI state, product type, updated at
- Selected row preview with blocker explanation, next action, and evidence summary
- Bulk action area for eligible rows

Design notes:
- This should feel like the Triage Console direction
- Dense but extremely readable
- Not a prettier spreadsheet; it must feel like an operational decision workspace
```

## 8. Full Row Detail Inspector Screen

```text
Using the global Bulk-SKU-Creator design brief, create the full row detail inspector screen for one product row.

Screen goal:
- Give users a deep diagnostic and correction workspace for a single row
- Separate facts, AI suggestions, validation issues, and actions clearly
- Support operator, support, and admin investigation needs

Layout requirements:
- Row header with row ID, product name, lifecycle stage, readiness status
- Main detail sections for source data, validation results, AI augmentation, image plan, and submission preview
- Sticky action rail or side panel
- Evidence / reason chain panel

Content requirements:
- Source spreadsheet values
- Seller defaults applied
- Validation blockers and warnings
- Product type resolution result and confidence
- GTIN / exemption state
- AI-suggested content with accept/reject review affordances
- Image plan preview with compliance notes
- Lifecycle history or revision history
- Actions like Revalidate, Save Changes, Defer, Exclude, Resubmit

Design notes:
- This should feel like a diagnostic console, not a long generic form
- Progressive disclosure is critical
- Support readable dense data without clutter
```

## 9. AI Review and Augmentation Screen

```text
Using the global Bulk-SKU-Creator design brief, create a dedicated AI review screen or focused workspace section for reviewing AI-assisted enrichment.

Screen goal:
- Help users inspect what AI changed
- Make confidence and truth boundaries explicit
- Prevent users from confusing suggested content with verified facts

Layout requirements:
- Side-by-side or stacked comparison between source facts and AI proposals
- Confidence panel
- Approval / rejection controls
- Notes about what AI is allowed to do and what it cannot invent

Content requirements:
- Source facts area
- Suggested title / bullets / description area
- Confidence label
- Warnings for low-confidence suggestions
- Reviewer action buttons
- Trace note showing whether stronger model escalation occurred

Design notes:
- This screen should feel careful and trustworthy
- No “AI magic” aesthetic
- Explicitly separate facts, draft, and final accepted output
```

## 10. Image Plan Review Screen

```text
Using the global Bulk-SKU-Creator design brief, create the image plan review screen for a product row or batch subset.

Screen goal:
- Let users review uploaded images, image quality, and any truth-preserving transformations
- Show compliance readiness for Amazon listing imagery

Layout requirements:
- Grid of image assets
- Main image candidate area
- Compliance notes panel
- Evidence / limitations panel
- Actions for approve, replace, suppress generated variant, or request new source image

Content requirements:
- Original uploaded images
- Proposed transformed images if any
- Compliance status labels
- Image ID labels
- Warnings for packaging ambiguity or unsupported transformations
- Clear note that external image URLs are out of scope

Design notes:
- Keep this grounded in truth and compliance
- Avoid looking like a creative design tool
- Emphasize review and evidence, not decoration
```

## 11. Submission Scope Review Screen

```text
Using the global Bulk-SKU-Creator design brief, create the submission scope review screen shown before confirming a batch submission.

Screen goal:
- Help users understand exactly what will be submitted
- Make exclusions and unresolved blockers obvious
- Support a deliberate submission decision

Layout requirements:
- Header with batch and submission scope summary
- Summary cards for eligible rows, excluded rows, warnings, and blocked rows
- Compact table of included rows
- Compact table or panel of excluded rows with reasons
- Confirmation area

Content requirements:
- Marketplace destination
- Number of rows being submitted
- Number excluded and why
- Row status summaries
- Submission warnings
- Primary CTA: Confirm Submission
- Secondary CTA: Back to Review

Design notes:
- This should feel like a controlled handoff, not just a confirmation modal
- Use clarity and accountability over decoration
```

## 12. Submission Monitoring Screen

```text
Using the global Bulk-SKU-Creator design brief, create the submission monitoring screen for a submitted batch.

Screen goal:
- Let users monitor batch and row-level submission outcomes
- Show queued, processing, delayed, success, and failure states clearly
- Support partial failure recovery

Layout requirements:
- Batch header with live submission state
- Summary metrics
- Timeline or event history panel
- Row-level results table
- Filters for success, failed, pending, retrying

Content requirements:
- Batch submission timeline
- Row-by-row result statuses
- Failure reason summaries
- Retry state markers
- Delayed external-service state messages
- CTA to reopen failed rows

Design notes:
- This should feel highly legible and support trust under uncertainty
- Pending and retrying states must be explicit, not hidden behind generic loading
```

## 13. Submission Failure Recovery Screen

```text
Using the global Bulk-SKU-Creator design brief, create the failed-row recovery screen for rows that failed submission.

Screen goal:
- Help users focus only on failed rows
- Explain why those rows failed
- Route users back into the correction workflow

Layout requirements:
- Focused filtered table of failed rows
- Right-side reason chain and remediation panel
- Clear retry and reopen actions

Content requirements:
- Failure reason
- Submission attempt timestamp
- Affected payload or schema reference
- Suggested remediation action
- Button to reopen row
- Button to retry after correction

Design notes:
- This should feel surgical and recoverable
- Avoid overwhelming the user with unrelated batch information
```

## 14. Seller Defaults Screen

```text
Using the global Bulk-SKU-Creator design brief, create the seller defaults management screen.

Screen goal:
- Let operations users define default values used during listing preparation
- Make defaults feel controlled, auditable, and easy to understand

Layout requirements:
- Settings-style page with grouped sections
- Clear distinction between marketplace defaults, seller defaults, and automation guardrails
- Audit or last-updated sidebar

Content requirements:
- Default fulfillment channel
- Default condition
- Default quantity
- Optional product preparation defaults
- Confidence threshold settings
- Cost guardrail settings
- Save and audit controls

Design notes:
- Serious settings UI
- Strong grouping and explanations
- Should feel operational, not consumer preferences-like
```

## 15. Support Investigation Screen

```text
Using the global Bulk-SKU-Creator design brief, create the support investigation screen for troubleshooting problematic rows and batches.

Screen goal:
- Help support users inspect row history end-to-end
- Make failures understandable without reverse-engineering the system

Layout requirements:
- Searchable investigation workspace
- Left table or results list of flagged rows / support cases
- Center detail area with row history
- Right trace / evidence / event panel

Content requirements:
- Source data origin
- Defaults applied
- AI changes
- Validation history
- Submission packaging summary
- Amazon response messages
- Lifecycle timeline
- Remediation suggestions

Design notes:
- This is a forensic operational UI
- Keep it calm and readable despite high information density
- Emphasize chronology and reason chains
```

## 16. Admin Governance and Operations Screen

```text
Using the global Bulk-SKU-Creator design brief, create the admin governance and operations screen.

Screen goal:
- Give admins visibility into system health, recurring failures, configuration governance, and policy enforcement

Layout requirements:
- Workspace shell
- Summary metrics row
- Operational issue breakdown panels
- Audit and governance panels
- Configuration shortcuts

Content requirements:
- Batch throughput
- First-pass success rate
- Common blocker categories
- Image issue frequency
- Duplicate risk frequency
- Policy enforcement signals
- Recent config changes
- Recent escalations

Design notes:
- This is not a flashy analytics dashboard
- Use charts only when they clarify trends
- The screen should primarily answer where the team is losing time and why
```

## 17. Saved Filters and Views Screen

```text
Using the global Bulk-SKU-Creator design brief, create the saved filters and views management screen.

Screen goal:
- Let operators save common triage views
- Support repeat workflows across large batch volumes

Layout requirements:
- Table or list of saved views
- Preview of filters included
- Create / edit saved view flow

Content requirements:
- View name
- Owner
- Included filters
- Scope such as personal or organization-wide
- Last used
- Actions to apply, edit, duplicate, delete

Design notes:
- Simple but serious utility screen
- Must feel integrated with the batch workflow, not like an isolated settings tool
```

## 18. Empty States Pack Prompt

```text
Using the global Bulk-SKU-Creator design brief, design a set of empty states for the product.

Create empty states for:
- no batches yet
- no rows match current filter
- no failed submissions
- no support cases found
- no saved views yet

For each empty state:
- include a clear explanation
- include one primary next action
- keep tone calm and operational
- avoid mascot-style startup illustration clichés
```

## 19. Loading and Async States Pack Prompt

```text
Using the global Bulk-SKU-Creator design brief, design a set of loading and async states for the product.

Create patterns for:
- batch upload in progress
- validation processing
- AI enrichment running
- image processing running
- submission queued
- submission delayed by external system
- retrying failed row

Requirements:
- use realistic progress language
- distinguish queued vs processing vs delayed vs retrying
- use skeletons for structured data surfaces
- keep the UI calm and trustworthy
```

## 20. Mobile Review Companion Screen

```text
Using the global Bulk-SKU-Creator design brief, create a mobile companion screen for light review use.

Screen goal:
- Support checking batch status and inspecting individual row outcomes on mobile
- Do not attempt full heavy batch authoring on mobile

Layout requirements:
- Compact mobile shell
- Batch summary cards
- Small list of rows needing attention
- Tap into row detail drawer

Content requirements:
- Ready / blocked / failed counts
- Recent submission outcome
- Mobile-friendly row cards
- Simple next action buttons

Design notes:
- This is a secondary support surface
- Keep it simple, direct, and highly legible
```

## Suggested Generation Order

Generate screens in this order:

1. Batch Review and Triage Workspace
2. Full Row Detail Inspector
3. Create Batch / Upload Intake
4. Submission Scope Review
5. Submission Monitoring
6. Batches List
7. Dashboard Overview
8. Seller Defaults
9. Support Investigation
10. Admin Governance
11. Remaining utility screens

## Notes

- If Lovable supports project-wide instructions, use the `Global Prompt` first.
- Reuse the same status vocabulary everywhere:
  - `READY`
  - `READY_WITH_AUGMENTATION`
  - `NEEDS_INPUT`
  - `NOT_ENOUGH_DATA`
  - `BLOCKED_FOR_REVIEW`
  - `SUBMITTED`
  - `FAILED_SUBMISSION`
- Keep every generated screen aligned to the chosen `Triage Console` direction with selective guidance and diagnostic side panels.
