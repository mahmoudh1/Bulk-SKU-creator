import { randomUUID } from "node:crypto";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Pool } from "pg";
import type { Plugin } from "vite";

type BatchIntakeStatus = "INTAKE_NEEDS_CORRECTION" | "INTAKE_READY";
type ImageResolutionStatus = "RESOLVED";
type FieldMappingStatus = "MAPPED";
type RowInterpretationStatus = "READY_FOR_REVIEW" | "NEEDS_CORRECTION";
type ReadinessState = "READY" | "READY_WITH_AUGMENTATION" | "NEEDS_INPUT" | "NOT_ENOUGH_DATA" | "BLOCKED_FOR_REVIEW";
type RowLifecycleStage = "INTAKE_READY" | "READINESS_EVALUATED" | "NEEDS_CORRECTION" | "READY_FOR_SUBMISSION_PREP";

interface SourceRow {
  [key: string]: string;
}

interface ImageAssetRecord {
  image_id: string;
  organization_id: string;
  filename: string;
  media_type: "image/jpeg" | "image/png" | "image/webp";
  size_bytes: number;
  r2_key: string;
  created_at: string;
}

interface BatchIntakeReviewDto {
  batchId: string;
  organizationId: string;
  intakeStatus: BatchIntakeStatus;
  sourceFile: {
    sourceFileId: string;
    filename: string;
  };
  fieldMappings: Array<{
    sourceColumn: string;
    internalField: string;
    confidence: number;
    status: FieldMappingStatus;
    sampleRawValue: string;
    sampleNormalizedValue: string;
  }>;
  rows: Array<{
    rowId: string;
    batchId: string;
    sourceRowNumber: number;
    sourceRowKey: string;
    intakeAttempt: number;
    rowRevision: number;
    sku: string;
    productName: string;
    brand: string;
    originalImageIds: string[];
    normalizedFields: Array<{
      field: string;
      label: string;
      rawValue: string;
      normalizedValue: string;
      confidence: number;
      status: FieldMappingStatus;
    }>;
    interpretationStatus: RowInterpretationStatus;
    interpretationIssues: Array<{
      code: "UNRESOLVED_IMAGE_REFERENCE";
      label: string;
      field: string;
      message: string;
      correctionHint: string;
    }>;
    resolvedAssets: Array<{
      imageId: string;
      previewRef: string;
      filename: string;
      label: string;
      organizationId: string;
      resolutionStatus: ImageResolutionStatus;
    }>;
    imageIssues: Array<{
      code: "IMAGE_ID_NOT_FOUND";
      message: string;
      originalImageId: string;
      recoveryHint: string;
    }>;
  }>;
  summary: {
    totalRows: number;
    resolvedImageCount: number;
    issueCount: number;
    mappingIssueCount: number;
  };
  handoff: {
    readyForReadinessEvaluation: boolean;
    statusLabel: string;
    statusDetail: string;
    blockerCount: number;
    blockerRowCount: number;
    blockers: Array<{
      code: "UNRESOLVED_IMAGE_REFERENCE";
      label: string;
      affectedRows: number;
      firstRowId?: string;
    }>;
    nextCorrectionRowId?: string;
  };
}

interface ReadinessIssueSummaryDto {
  code: string;
  message: string;
}

interface ReadinessImageEvidenceDto {
  imageId: string;
  previewRef: string;
}

type ValidationSeverity = "BLOCKER" | "WARNING";

type ValidationCategory = "IDENTIFIER" | "ATTRIBUTE" | "VARIANT" | "IMAGE" | "INTAKE" | "DUPLICATE" | "POLICY";

interface ValidationRuleResultDto {
  ruleCode: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  field: string;
  message: string;
  remediationHint: string;
  blocking: boolean;
  readinessImpact: ReadinessState;
  evidence?: Record<string, unknown>;
}

interface ProductTypeCandidateDto {
  productType: string;
  confidence: number;
}

interface ProductTypeDecisionDto {
  candidates: ProductTypeCandidateDto[];
  threshold: number;
  selectedValue: string;
  confirmedValue: string | null;
  confirmationRequired: boolean;
  reason: string;
  decidedBy: string | null;
}

interface BatchReadinessRowDto {
  rowId: string;
  batchId: string;
  sourceRowNumber: number;
  sourceRowKey: string;
  rowRevision: number;
  sku: string;
  productName: string;
  brand: string;
  readinessState: ReadinessState;
  lifecycleStage: RowLifecycleStage;
  validation: {
    blockers: number;
    warnings: number;
    primaryCategory: ValidationCategory | null;
  };
  issueSummaries: ReadinessIssueSummaryDto[];
  imageEvidence: ReadinessImageEvidenceDto[];
  evaluatedAt: string;
  updatedAt: string;
}

interface BatchReadinessEvaluationDto {
  batchId: string;
  organizationId: string;
  rows: BatchReadinessRowDto[];
  summary: {
    totalRows: number;
    ready: number;
    readyAugmented: number;
    needsInput: number;
    blocked: number;
    notEnoughData: number;
  };
  evaluatedAt: string;
  updatedAt: string;
}

type RowIssueSeverity = "BLOCKER" | "WARNING";

interface RowIssueDetailDto {
  severity: RowIssueSeverity;
  code: string;
  category: ValidationCategory;
  reason: string;
  remediationHint: string;
  nextActionLabel: string;
  nextActionHref?: string;
}

interface RowLifecycleEntryDto {
  timestamp: string;
  lifecycleStage: RowLifecycleStage;
  readinessState: ReadinessState;
  summary: string;
}

interface BatchReadinessRowDetailDto {
  rowId: string;
  batchId: string;
  organizationId: string;
  sourceRowNumber: number;
  sourceRowKey: string;
  intakeAttempt: number;
  rowRevision: number;
  sku: string;
  productName: string;
  brand: string;
  readinessState: ReadinessState;
  lifecycleStage: RowLifecycleStage;
  issues: RowIssueDetailDto[];
  issueSummaries: ReadinessIssueSummaryDto[];
  productTypeDecision: ProductTypeDecisionDto | null;
  validationResults: ValidationRuleResultDto[];
  imageEvidence: ReadinessImageEvidenceDto[];
  normalizedFields: BatchIntakeReviewDto["rows"][number]["normalizedFields"];
  originalImageIds: string[];
  lifecycleHistory: RowLifecycleEntryDto[];
  evaluatedAt: string;
  updatedAt: string;
}

const requiredColumns = ["sku", "name", "brand", "image_id"] as const;
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

let pool: Pool | null = null;
let s3: S3Client | null = null;
let schemaReady: Promise<void> | null = null;

function findProjectRoot(startDir: string) {
  let current = resolve(startDir);
  let fallback = resolve(startDir);

  while (current !== dirname(current)) {
    const packagePath = join(current, "package.json");

    if (existsSync(packagePath)) {
      fallback = current;

      try {
        const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as { workspaces?: unknown };

        if (packageJson.workspaces) {
          return current;
        }
      } catch {
        // Keep walking; a malformed package file should not hide parent env files.
      }
    }

    current = dirname(current);
  }

  return fallback;
}

function loadSingleEnvFile(envPath: string) {

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
    process.env[key.trim()] ??= value;
  }
}

function loadEnvFiles(projectRoot: string) {
  loadSingleEnvFile(join(projectRoot, ".env.local"));
  loadSingleEnvFile(join(projectRoot, "apps", "web", ".env.local"));
}

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for the local API server.`);
  }

  return value;
}

function getPool() {
  pool ??= new Pool({
    connectionString: requiredEnv("DATABASE_URL"),
    ssl: { rejectUnauthorized: false },
  });

  return pool;
}

function getS3() {
  s3 ??= new S3Client({
    region: "auto",
    endpoint: requiredEnv("CLOUDFLARE_R2_ENDPOINT"),
    credentials: {
      accessKeyId: requiredEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    },
  });

  return s3;
}

async function ensureSchema() {
  schemaReady ??= getPool().query(`
    create table if not exists image_assets (
      image_id text primary key,
      organization_id text not null,
      filename text not null,
      media_type text not null,
      size_bytes integer not null,
      r2_key text not null,
      created_at timestamptz not null default now()
    );

    create index if not exists image_assets_organization_idx
      on image_assets (organization_id, created_at desc);

    create table if not exists batch_intake_reviews (
      batch_id text primary key,
      organization_id text not null,
      created_by text not null,
      marketplace text not null,
      batch_name text not null,
      source_file jsonb not null,
      review jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create index if not exists batch_intake_reviews_organization_idx
      on batch_intake_reviews (organization_id, updated_at desc);

    create table if not exists batch_readiness_results (
      organization_id text not null,
      batch_id text not null,
      row_id text not null,
      source_row_number integer not null,
      source_row_key text not null,
      row_revision integer not null,
      sku text not null,
      product_name text not null,
      brand text not null,
      readiness_state text not null,
      lifecycle_stage text not null,
      issue_summaries jsonb not null default '[]'::jsonb,
      evidence jsonb not null default '[]'::jsonb,
      evaluated_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (organization_id, batch_id, row_id, row_revision)
    );

    create index if not exists batch_readiness_results_batch_idx
      on batch_readiness_results (organization_id, batch_id, updated_at desc);

    alter table batch_readiness_results add column if not exists source_row_number integer;
    alter table batch_readiness_results add column if not exists source_row_key text;
    alter table batch_readiness_results add column if not exists sku text;
    alter table batch_readiness_results add column if not exists product_name text;
    alter table batch_readiness_results add column if not exists brand text;
    alter table batch_readiness_results add column if not exists evaluated_at timestamptz not null default now();
    alter table batch_readiness_results add column if not exists updated_at timestamptz not null default now();

    create table if not exists batch_row_lifecycle_events (
      organization_id text not null,
      batch_id text not null,
      row_id text not null,
      row_revision integer not null,
      lifecycle_stage text not null,
      readiness_state text not null,
      decision_context jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (organization_id, batch_id, row_id, row_revision)
    );

    create index if not exists batch_row_lifecycle_events_batch_idx
      on batch_row_lifecycle_events (organization_id, batch_id, updated_at desc);

    create table if not exists batch_row_validation_evidence (
      organization_id text not null,
      batch_id text not null,
      row_id text not null,
      row_revision integer not null,
      evidence jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (organization_id, batch_id, row_id, row_revision)
    );

    create index if not exists batch_row_validation_evidence_batch_idx
      on batch_row_validation_evidence (organization_id, batch_id, updated_at desc);

    create table if not exists batch_row_validation_results (
      organization_id text not null,
      batch_id text not null,
      row_id text not null,
      row_revision integer not null,
      rule_version text not null,
      results jsonb not null default '[]'::jsonb,
      evaluated_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (organization_id, batch_id, row_id, row_revision)
    );

    create index if not exists batch_row_validation_results_batch_idx
      on batch_row_validation_results (organization_id, batch_id, updated_at desc);

    create table if not exists batch_row_corrections (
      organization_id text not null,
      batch_id text not null,
      row_id text not null,
      base_row_revision integer not null,
      row_revision integer not null,
      patch jsonb not null default '{}'::jsonb,
      created_by text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (organization_id, batch_id, row_id, row_revision)
    );

    create index if not exists batch_row_corrections_batch_idx
      on batch_row_corrections (organization_id, batch_id, updated_at desc);

    create table if not exists batch_row_product_type_decisions (
      organization_id text not null,
      batch_id text not null,
      row_id text not null,
      row_revision integer not null,
      decision jsonb not null default '{}'::jsonb,
      decided_by text,
      decided_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (organization_id, batch_id, row_id, row_revision)
    );

    create index if not exists batch_row_product_type_decisions_batch_idx
      on batch_row_product_type_decisions (organization_id, batch_id, updated_at desc);

    create table if not exists batch_review_contexts (
      organization_id text not null,
      batch_id text not null,
      user_id text not null,
      context jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now(),
      primary key (organization_id, batch_id, user_id)
    );

    create index if not exists batch_review_contexts_batch_idx
      on batch_review_contexts (organization_id, batch_id, updated_at desc);
  `).then(() => undefined);

  return schemaReady;
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.end(body);
}

function sendError(res: ServerResponse, status: number, code: string, message: string) {
  sendJson(res, status, { code, message });
}

async function parseFormData(req: IncomingMessage) {
  const request = new Request(`http://localhost${req.url ?? "/"}`, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: Readable.toWeb(req) as unknown as RequestInit["body"],
    duplex: "half",
  } as RequestInit);

  return request.formData();
}

async function parseJson(req: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function normalizeIdPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function parseCsv(text: string) {
  const [headerLine = "", ...bodyLines] = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = headerLine.split(",").map((column) => column.trim().toLowerCase());
  const rows = bodyLines.map((line): SourceRow => {
    const values = line.split(",").map((value) => value.trim());

    return headers.reduce<SourceRow>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });

  return { headers, rows };
}

function sourceValue(row: SourceRow, ...keys: string[]) {
  return keys.map((key) => row[key]).find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

async function findImageAsset(imageId: string, organizationId: string) {
  const result = await getPool().query<ImageAssetRecord>(
    `select image_id, organization_id, filename, media_type, size_bytes, r2_key, created_at::text
       from image_assets
      where image_id = $1 and organization_id = $2`,
    [imageId, organizationId],
  );

  return result.rows[0] ?? null;
}

async function resolveImageReferences(imageIds: string[], organizationId: string) {
  const resolvedAssets: BatchIntakeReviewDto["rows"][number]["resolvedAssets"] = [];
  const imageIssues: BatchIntakeReviewDto["rows"][number]["imageIssues"] = [];

  for (const imageId of imageIds) {
    const asset = await findImageAsset(imageId, organizationId);

    if (asset) {
      resolvedAssets.push({
        imageId: asset.image_id,
        previewRef: `/api/image-assets/${asset.image_id}/preview`,
        filename: asset.filename,
        label: "Main image",
        organizationId,
        resolutionStatus: "RESOLVED",
      });
      continue;
    }

    imageIssues.push({
      code: "IMAGE_ID_NOT_FOUND",
      message: "Image ID not found",
      originalImageId: imageId,
      recoveryHint: "Upload the image through the image service or correct the spreadsheet image_id, then reprocess intake.",
    });
  }

  return { resolvedAssets, imageIssues };
}

async function buildRowsFromSource(batchId: string, organizationId: string, rows: SourceRow[]): Promise<BatchIntakeReviewDto["rows"]> {
  const output: BatchIntakeReviewDto["rows"] = [];

  for (const [index, sourceRow] of rows.entries()) {
    const rowId = `src-row-${index + 1}`;
    const imageIds = sourceValue(sourceRow, "image_id").split(/[;\s]+/).map((imageId) => imageId.trim()).filter(Boolean);
    const { resolvedAssets, imageIssues } = await resolveImageReferences(imageIds, organizationId);
    const interpretationIssues = imageIssues.map((issue) => ({
      code: "UNRESOLVED_IMAGE_REFERENCE" as const,
      label: "Unresolved image reference",
      field: "image references",
      message: issue.message,
      correctionHint: issue.recoveryHint,
    }));

    output.push({
      rowId,
      batchId,
      sourceRowNumber: index + 2,
      sourceRowKey: `source row ${index + 2}`,
      intakeAttempt: 1,
      rowRevision: 1,
      sku: sourceValue(sourceRow, "sku") || rowId,
      productName: sourceValue(sourceRow, "name") || "Untitled product",
      brand: sourceValue(sourceRow, "brand") || "Unknown brand",
      originalImageIds: imageIds,
      normalizedFields: [
        {
          field: "sku",
          label: "SKU",
          rawValue: sourceValue(sourceRow, "sku"),
          normalizedValue: sourceValue(sourceRow, "sku") || rowId,
          confidence: 1,
          status: "MAPPED",
        },
        {
          field: "title",
          label: "Product title",
          rawValue: sourceValue(sourceRow, "name"),
          normalizedValue: sourceValue(sourceRow, "name") || "Untitled product",
          confidence: 1,
          status: "MAPPED",
        },
        {
          field: "brand",
          label: "Brand",
          rawValue: sourceValue(sourceRow, "brand"),
          normalizedValue: sourceValue(sourceRow, "brand") || "Unknown brand",
          confidence: 1,
          status: "MAPPED",
        },
        ...(sourceRow.gtin !== undefined
          ? [
              {
                field: "gtin",
                label: "GTIN",
                rawValue: sourceValue(sourceRow, "gtin"),
                normalizedValue: sourceValue(sourceRow, "gtin"),
                confidence: 1,
                status: "MAPPED" as const,
              },
            ]
          : []),
        ...(sourceRow.variant_group !== undefined
          ? [
              {
                field: "variant_group",
                label: "Variant group",
                rawValue: sourceValue(sourceRow, "variant_group"),
                normalizedValue: sourceValue(sourceRow, "variant_group"),
                confidence: 1,
                status: "MAPPED" as const,
              },
            ]
          : []),
        ...(sourceRow.variant_key !== undefined
          ? [
              {
                field: "variant_key",
                label: "Variant key",
                rawValue: sourceValue(sourceRow, "variant_key"),
                normalizedValue: sourceValue(sourceRow, "variant_key"),
                confidence: 1,
                status: "MAPPED" as const,
              },
            ]
          : []),
        ...(sourceRow.variant_value !== undefined
          ? [
              {
                field: "variant_value",
                label: "Variant value",
                rawValue: sourceValue(sourceRow, "variant_value"),
                normalizedValue: sourceValue(sourceRow, "variant_value"),
                confidence: 1,
                status: "MAPPED" as const,
              },
            ]
          : []),
        ...(sourceRow.forced_match_asin !== undefined
          ? [
              {
                field: "forced_match_asin",
                label: "Forced match ASIN",
                rawValue: sourceValue(sourceRow, "forced_match_asin"),
                normalizedValue: sourceValue(sourceRow, "forced_match_asin"),
                confidence: 1,
                status: "MAPPED" as const,
              },
            ]
          : []),
      ],
      interpretationStatus: interpretationIssues.length > 0 ? "NEEDS_CORRECTION" : "READY_FOR_REVIEW",
      interpretationIssues,
      resolvedAssets,
      imageIssues,
    });
  }

  return output;
}

function buildFieldMappings(headers: string[], firstRow: SourceRow | undefined): BatchIntakeReviewDto["fieldMappings"] {
  return headers.map((header) => ({
    sourceColumn: header,
    internalField: header === "name" ? "title" : header === "image_id" ? "image references" : header,
    confidence: 1,
    status: "MAPPED",
    sampleRawValue: sourceValue(firstRow ?? {}, header),
    sampleNormalizedValue: sourceValue(firstRow ?? {}, header),
  }));
}

function finalizeReview(review: Omit<BatchIntakeReviewDto, "summary" | "handoff" | "intakeStatus">): BatchIntakeReviewDto {
  const issueRows = review.rows.filter((row) => row.interpretationIssues.length > 0 || row.imageIssues.length > 0);
  const blockerCount = review.rows.reduce((sum, row) => sum + row.interpretationIssues.length, 0);
  const intakeStatus: BatchIntakeStatus = issueRows.length > 0 ? "INTAKE_NEEDS_CORRECTION" : "INTAKE_READY";
  const firstIssueRow = issueRows[0]?.rowId;
  const blockers =
    issueRows.length > 0
      ? [{ code: "UNRESOLVED_IMAGE_REFERENCE" as const, label: "Unresolved image reference", affectedRows: issueRows.length, firstRowId: firstIssueRow }]
      : [];

  return {
    ...review,
    intakeStatus,
    summary: {
      totalRows: review.rows.length,
      resolvedImageCount: review.rows.reduce((sum, row) => sum + row.resolvedAssets.length, 0),
      issueCount: review.rows.reduce((sum, row) => sum + row.imageIssues.length, 0),
      mappingIssueCount: review.rows.reduce((sum, row) => sum + row.interpretationIssues.length, 0),
    },
    handoff:
      intakeStatus === "INTAKE_READY"
        ? {
            readyForReadinessEvaluation: true,
            statusLabel: "Intake ready",
            statusDetail: "Ready for readiness evaluation.",
            blockerCount: 0,
            blockerRowCount: 0,
            blockers: [],
          }
        : {
            readyForReadinessEvaluation: false,
            statusLabel: "Intake needs correction",
            statusDetail: `${blockerCount} blockers across ${issueRows.length} rows must be corrected before readiness evaluation.`,
            blockerCount,
            blockerRowCount: issueRows.length,
            blockers,
            nextCorrectionRowId: firstIssueRow,
          },
  };
}

async function insertReview(input: {
  batchName: string;
  marketplace: string;
  organizationId: string;
  createdBy: string;
  sourceFile: BatchIntakeReviewDto["sourceFile"];
  review: BatchIntakeReviewDto;
}) {
  await getPool().query(
    `insert into batch_intake_reviews (batch_id, organization_id, created_by, marketplace, batch_name, source_file, review, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, now())
     on conflict (batch_id) do update set
       organization_id = excluded.organization_id,
       created_by = excluded.created_by,
       marketplace = excluded.marketplace,
       batch_name = excluded.batch_name,
       source_file = excluded.source_file,
       review = excluded.review,
       updated_at = now()`,
    [input.review.batchId, input.organizationId, input.createdBy, input.marketplace, input.batchName, input.sourceFile, input.review],
  );
}

async function readReview(batchId: string, organizationId: string) {
  const result = await getPool().query<{ review: BatchIntakeReviewDto }>(
    `select review from batch_intake_reviews where batch_id = $1 and organization_id = $2`,
    [batchId, organizationId],
  );

  return result.rows[0]?.review ?? null;
}

async function handleCreateImage(req: IncomingMessage, res: ServerResponse) {
  const form = await parseFormData(req);
  const organizationId = String(form.get("organizationId") ?? "");
  const file = form.get("file");

  if (!organizationId) {
    return sendError(res, 400, "MISSING_ORGANIZATION", "Select an active workspace before uploading images.");
  }

  if (!(file instanceof File) || file.size === 0) {
    return sendError(res, 400, "INVALID_FILE", "Choose one supported product image before uploading.");
  }

  if (!supportedImageTypes.has(file.type)) {
    return sendError(res, 415, "UNSUPPORTED_MEDIA_TYPE", "Unsupported image type. Upload a JPG, PNG, or WebP product image.");
  }

  const safeName = normalizeIdPart(file.name);
  const imageId = `img_${organizationId}_${safeName}`;
  const r2Key = `organizations/${organizationId}/images/${imageId}/${file.name}`;
  const body = Buffer.from(await file.arrayBuffer());

  await getS3().send(
    new PutObjectCommand({
      Bucket: requiredEnv("CLOUDFLARE_R2_BUCKET"),
      Key: r2Key,
      Body: body,
      ContentType: file.type,
    }),
  );

  const result = await getPool().query<ImageAssetRecord>(
    `insert into image_assets (image_id, organization_id, filename, media_type, size_bytes, r2_key, created_at)
     values ($1, $2, $3, $4, $5, $6, now())
     on conflict (image_id) do update set
       organization_id = excluded.organization_id,
       filename = excluded.filename,
       media_type = excluded.media_type,
       size_bytes = excluded.size_bytes,
       r2_key = excluded.r2_key,
       created_at = now()
     returning image_id, organization_id, filename, media_type, size_bytes, r2_key, created_at::text`,
    [imageId, organizationId, file.name, file.type, file.size, r2Key],
  );

  const asset = result.rows[0];
  sendJson(res, 201, {
    image_id: asset.image_id,
    organization_id: asset.organization_id,
    filename: asset.filename,
    media_type: asset.media_type,
    size_bytes: asset.size_bytes,
    created_at: asset.created_at,
  });
}

async function handlePreview(_req: IncomingMessage, res: ServerResponse, imageId: string) {
  const result = await getPool().query<ImageAssetRecord>(
    `select image_id, organization_id, filename, media_type, size_bytes, r2_key, created_at::text
       from image_assets
      where image_id = $1`,
    [imageId],
  );
  const asset = result.rows[0];

  if (!asset) {
    return sendError(res, 404, "IMAGE_ID_NOT_FOUND", "Image asset was not found.");
  }

  const object = await getS3().send(
    new GetObjectCommand({
      Bucket: requiredEnv("CLOUDFLARE_R2_BUCKET"),
      Key: asset.r2_key,
    }),
  );

  res.statusCode = 200;
  res.setHeader("Content-Type", asset.media_type);
  res.setHeader("Cache-Control", "private, max-age=60");

  if (object.Body && "pipe" in object.Body) {
    object.Body.pipe(res);
    return;
  }

  res.end();
}

async function handleCreateBatch(req: IncomingMessage, res: ServerResponse) {
  const form = await parseFormData(req);
  const batchName = String(form.get("batchName") ?? "");
  const marketplace = String(form.get("marketplace") ?? "");
  const organizationId = String(form.get("organizationId") ?? "");
  const createdBy = String(form.get("createdBy") ?? "");
  const file = form.get("sourceFile");

  if (!organizationId) {
    return sendError(res, 400, "MISSING_ORGANIZATION", "Select an active workspace before creating a batch.");
  }

  if (!createdBy) {
    return sendError(res, 400, "MISSING_INITIATING_USER", "Sign in again before creating a batch.");
  }

  if (!(file instanceof File) || file.size === 0) {
    return sendError(res, 400, "INVALID_SOURCE_FILE", "Select a spreadsheet before starting intake.");
  }

  if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
    return sendError(res, 415, "UNSUPPORTED_SPREADSHEET_TYPE", "CSV intake is available in this app build. Export XLSX sources to CSV before starting intake.");
  }

  const text = await file.text();
  const { headers, rows } = parseCsv(text);
  const missingColumns = requiredColumns.filter((column) => !headers.includes(column));

  if (missingColumns.length > 0) {
    return sendError(res, 400, "MISSING_REQUIRED_COLUMNS", `Spreadsheet is missing required ${missingColumns.join(", ")} column. Include image_id values issued by the image service.`);
  }

  const safeFileName = normalizeIdPart(file.name.replace(/\.(csv|xlsx)$/i, ""));
  const batchId = `batch_${organizationId}_${safeFileName}`;
  const sourceFile = {
    sourceFileId: `src_${batchId}`,
    filename: file.name,
    mediaType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    requiredColumns: [...requiredColumns],
  };
  const review = finalizeReview({
    batchId,
    organizationId,
    sourceFile,
    fieldMappings: buildFieldMappings(headers, rows[0]),
    rows: await buildRowsFromSource(batchId, organizationId, rows),
  });

  await insertReview({ batchName, marketplace, organizationId, createdBy, sourceFile, review });

  sendJson(res, 201, {
    batchId,
    organizationId,
    createdBy,
    marketplace,
    batchName,
    sourceFile,
    intakeStatus: "INTAKE_PROCESSING",
    createdAt: new Date().toISOString(),
  });
}

async function handleListBatches(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const organizationId = url.searchParams.get("organizationId");

  if (!organizationId) {
    return sendJson(res, 200, []);
  }

  const result = await getPool().query<{
    batch_id: string;
    batch_name: string;
    marketplace: string;
    created_by: string;
    review: BatchIntakeReviewDto;
    created_at: string;
    updated_at: string;
  }>(
    `select batch_id, batch_name, marketplace, created_by, review, created_at::text, updated_at::text
       from batch_intake_reviews
      where organization_id = $1
      order by updated_at desc`,
    [organizationId],
  );

  sendJson(
    res,
    200,
    result.rows.map((row) => ({
      id: row.batch_id,
      name: row.batch_name,
      marketplace: row.marketplace,
      owner: row.created_by,
      createdAt: row.created_at,
      lastUpdated: row.updated_at,
      totalRows: row.review.summary.totalRows,
      ready: row.review.rows.filter((item) => item.interpretationStatus === "READY_FOR_REVIEW").length,
      readyAugmented: 0,
      needsInput: row.review.handoff.blockerRowCount,
      blocked: row.review.summary.issueCount,
      notEnough: 0,
      submission: "DRAFT",
    })),
  );
}

async function handleGetReview(req: IncomingMessage, res: ServerResponse, batchId: string) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const organizationId = url.searchParams.get("organizationId") ?? "";
  const review = await readReview(batchId, organizationId);

  if (!review) {
    return sendError(res, 404, "INTAKE_FAILED", "Batch intake data was not found. Create the batch from a spreadsheet before opening mapping.");
  }

  sendJson(res, 200, finalizeReview({ batchId: review.batchId, organizationId: review.organizationId, sourceFile: review.sourceFile, fieldMappings: review.fieldMappings, rows: review.rows }));
}

async function handleReprocess(req: IncomingMessage, res: ServerResponse, batchId: string) {
  const input = await parseJson(req);
  const organizationId = String(input.organizationId ?? "");
  const corrections = Array.isArray(input.corrections) ? input.corrections : [];
  const review = await readReview(batchId, organizationId);

  if (!review) {
    return sendError(res, 404, "INTAKE_FAILED", "Batch intake data was not found. Create the batch from a spreadsheet before reprocessing.");
  }

  const correctionByRow = new Map(corrections.map((correction: { rowId: string }) => [correction.rowId, correction]));
  const attemptNumber = Math.max(1, ...review.rows.map((row) => row.intakeAttempt)) + 1;
  const rowOutcomes = [];
  const updatedRows: BatchIntakeReviewDto["rows"] = [];

  for (const row of review.rows) {
    const correction = correctionByRow.get(row.rowId) as { imageIdCorrection?: { correctedValue?: string } } | undefined;

    if (!correction) {
      rowOutcomes.push({
        rowId: row.rowId,
        sourceRowNumber: row.sourceRowNumber,
        previousRowRevision: row.rowRevision,
        rowRevision: row.rowRevision,
        attemptNumber: row.intakeAttempt,
        sku: row.sku,
        status: "UNCHANGED",
        imageIds: row.originalImageIds,
        message: "Unaffected row preserved",
        issueSummaries: [],
      });
      updatedRows.push(row);
      continue;
    }

    const correctedImageId = correction.imageIdCorrection?.correctedValue?.trim();
    const imageIds = correctedImageId ? [correctedImageId] : row.originalImageIds;
    const { resolvedAssets, imageIssues } = await resolveImageReferences(imageIds, organizationId);
    const stillMissing = imageIssues.length > 0;

    rowOutcomes.push({
      rowId: row.rowId,
      sourceRowNumber: row.sourceRowNumber,
      previousRowRevision: row.rowRevision,
      rowRevision: row.rowRevision + 1,
      attemptNumber,
      sku: row.sku,
      status: stillMissing ? "STILL_NEEDS_CORRECTION" : "CORRECTED",
      imageIds,
      message: stillMissing ? "Batch remains recoverable" : "Corrected row reprocessed",
      issueSummaries: stillMissing ? ["Image ID not found after reprocess"] : [],
    });

    updatedRows.push({
      ...row,
      intakeAttempt: attemptNumber,
      rowRevision: row.rowRevision + 1,
      originalImageIds: imageIds,
      interpretationStatus: (stillMissing ? "NEEDS_CORRECTION" : "READY_FOR_REVIEW") as RowInterpretationStatus,
      interpretationIssues: imageIssues.map((issue) => ({
        code: "UNRESOLVED_IMAGE_REFERENCE" as const,
        label: "Unresolved image reference",
        field: "image references",
        message: issue.message,
        correctionHint: issue.recoveryHint,
      })),
      resolvedAssets,
      imageIssues,
    });
  }

  const updatedReview = finalizeReview({
    batchId: review.batchId,
    organizationId: review.organizationId,
    sourceFile: review.sourceFile,
    fieldMappings: review.fieldMappings,
    rows: updatedRows,
  });

  await getPool().query(`update batch_intake_reviews set review = $1, updated_at = now() where batch_id = $2 and organization_id = $3`, [
    updatedReview,
    batchId,
    organizationId,
  ]);

  const remainingIssueRows = rowOutcomes.filter((outcome) => outcome.status === "STILL_NEEDS_CORRECTION").length;
  sendJson(res, 200, {
    attemptId: `intake-attempt-${batchId}-${attemptNumber}`,
    attemptNumber,
    batchId,
    organizationId,
    status: remainingIssueRows > 0 ? "FAILED" : "COMPLETED",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    correlationId: `intake-reprocess-${batchId}-${attemptNumber}-${randomUUID()}`,
    rowOutcomes,
    summary: {
      correctedRows: rowOutcomes.filter((outcome) => outcome.status === "CORRECTED").length,
      unchangedRows: rowOutcomes.filter((outcome) => outcome.status === "UNCHANGED").length,
      remainingIssueRows,
    },
  });
}

const validationRuleVersion = "v1";

function normalizedValueForField(row: BatchIntakeReviewDto["rows"][number], field: string) {
  const match = row.normalizedFields.find((item) => item.field === field);
  return {
    raw: match?.rawValue ?? "",
    normalized: match?.normalizedValue ?? "",
  };
}

type DuplicateContext = {
  skuCounts: Record<string, number>;
  gtinCounts: Record<string, number>;
  titleBrandCounts: Record<string, number>;
};

function incrementCounter(record: Record<string, number>, key: string) {
  if (!key) {
    return;
  }

  record[key] = (record[key] ?? 0) + 1;
}

function buildDuplicateContext(rows: BatchIntakeReviewDto["rows"]): DuplicateContext {
  const context: DuplicateContext = {
    skuCounts: {},
    gtinCounts: {},
    titleBrandCounts: {},
  };

  for (const row of rows) {
    incrementCounter(context.skuCounts, row.sku.trim().toLowerCase());
    const gtin = normalizedValueForField(row, "gtin").normalized.trim().toLowerCase();
    incrementCounter(context.gtinCounts, gtin);
    const title = normalizedValueForField(row, "title").normalized.trim().toLowerCase();
    const brand = normalizedValueForField(row, "brand").normalized.trim().toLowerCase();
    incrementCounter(context.titleBrandCounts, title && brand ? `${title}::${brand}` : "");
  }

  return context;
}

function computeProductTypeDecision(row: BatchIntakeReviewDto["rows"][number], decidedBy: string | null): ProductTypeDecisionDto {
  const threshold = 0.8;
  const manual = normalizedValueForField(row, "product_type").normalized.trim();

  if (manual) {
    return {
      candidates: [{ productType: manual, confidence: 1 }],
      threshold,
      selectedValue: manual,
      confirmedValue: manual,
      confirmationRequired: false,
      reason: "MANUAL_CONFIRMATION",
      decidedBy,
    };
  }

  const title = normalizedValueForField(row, "title").normalized.trim().toLowerCase();

  let candidates: ProductTypeCandidateDto[] = [];

  if (title.includes("lamp")) {
    candidates = [
      { productType: "LIGHTING", confidence: 0.92 },
      { productType: "HOME_DECOR", confidence: 0.72 },
    ];
  } else if (title.includes("chair")) {
    candidates = [
      { productType: "FURNITURE", confidence: 0.93 },
      { productType: "HOME_DECOR", confidence: 0.61 },
    ];
  } else if (title.includes("mug")) {
    candidates = [
      { productType: "KITCHEN", confidence: 0.91 },
      { productType: "HOME_GOODS", confidence: 0.63 },
    ];
  } else {
    candidates = [
      { productType: "GENERAL_MERCHANDISE", confidence: 0.62 },
      { productType: "HOME_GOODS", confidence: 0.59 },
    ];
  }

  const [top, second] = candidates;
  const gap = Math.abs((top?.confidence ?? 0) - (second?.confidence ?? 0));
  const below = (top?.confidence ?? 0) < threshold;
  const ambiguous = gap < 0.15;
  const confirmationRequired = below || ambiguous;
  const reason = below ? "BELOW_THRESHOLD" : ambiguous ? "AMBIGUOUS" : "CONFIDENT";

  return {
    candidates,
    threshold,
    selectedValue: top?.productType ?? "",
    confirmedValue: null,
    confirmationRequired,
    reason,
    decidedBy: null,
  };
}

function deriveReadinessState(results: ValidationRuleResultDto[]) {
  const impacts = results.map((result) => result.readinessImpact);

  if (impacts.includes("BLOCKED_FOR_REVIEW")) {
    return "BLOCKED_FOR_REVIEW" as const;
  }

  if (impacts.includes("NEEDS_INPUT")) {
    return "NEEDS_INPUT" as const;
  }

  if (impacts.includes("NOT_ENOUGH_DATA")) {
    return "NOT_ENOUGH_DATA" as const;
  }

  if (results.some((result) => result.severity === "WARNING")) {
    return "READY_WITH_AUGMENTATION" as const;
  }

  return "READY" as const;
}

function buildValidationSummary(results: ValidationRuleResultDto[]) {
  const blockers = results.filter((result) => result.severity === "BLOCKER").length;
  const warnings = results.filter((result) => result.severity === "WARNING").length;
  const primaryCategory = results.find((result) => result.severity === "BLOCKER")?.category ?? results[0]?.category ?? null;

  return { blockers, warnings, primaryCategory } satisfies BatchReadinessRowDto["validation"];
}

async function evaluateValidationRules(
  client: import("pg").PoolClient,
  row: BatchIntakeReviewDto["rows"][number],
  organizationId: string,
  duplicateContext: DuplicateContext,
  productTypeDecision: ProductTypeDecisionDto,
): Promise<ValidationRuleResultDto[]> {
  const results: ValidationRuleResultDto[] = [];

  for (const issue of row.interpretationIssues) {
    const isImageIssue = issue.code === "UNRESOLVED_IMAGE_REFERENCE";
    results.push({
      ruleCode: issue.code,
      category: isImageIssue ? "IMAGE" : "INTAKE",
      severity: "BLOCKER",
      field: issue.field,
      message: issue.message,
      remediationHint: issue.correctionHint,
      blocking: true,
      readinessImpact: isImageIssue ? "NOT_ENOUGH_DATA" : "NEEDS_INPUT",
    });
  }

  for (const issue of row.imageIssues) {
    results.push({
      ruleCode: issue.code,
      category: "IMAGE",
      severity: "BLOCKER",
      field: issue.originalImageId,
      message: issue.message,
      remediationHint: issue.recoveryHint,
      blocking: true,
      readinessImpact: "NOT_ENOUGH_DATA",
      evidence: { originalImageId: issue.originalImageId },
    });
  }

  const title = normalizedValueForField(row, "title");
  if (!title.raw) {
    results.push({
      ruleCode: "REQUIRED_TITLE_MISSING",
      category: "ATTRIBUTE",
      severity: "BLOCKER",
      field: "title",
      message: "Product title is required",
      remediationHint: "Provide a product name in the spreadsheet, then reprocess intake.",
      blocking: true,
      readinessImpact: "NEEDS_INPUT",
    });
  }

  const brand = normalizedValueForField(row, "brand");
  if (!brand.raw) {
    results.push({
      ruleCode: "REQUIRED_BRAND_MISSING",
      category: "ATTRIBUTE",
      severity: "BLOCKER",
      field: "brand",
      message: "Brand is required",
      remediationHint: "Provide a brand value in the spreadsheet, then reprocess intake.",
      blocking: true,
      readinessImpact: "NEEDS_INPUT",
    });
  }

  if (productTypeDecision.confirmationRequired) {
    results.push({
      ruleCode: "PRODUCT_TYPE_CONFIRMATION_REQUIRED",
      category: "ATTRIBUTE",
      severity: "BLOCKER",
      field: "product_type",
      message: "Product type requires manual confirmation",
      remediationHint: "Confirm a product type in the row inspector, then revalidate.",
      blocking: true,
      readinessImpact: "NEEDS_INPUT",
      evidence: { productTypeDecision },
    });
  }

  const gtin = normalizedValueForField(row, "gtin");
  if (row.normalizedFields.some((field) => field.field === "gtin") && !gtin.normalized) {
    results.push({
      ruleCode: "IDENTIFIER_GTIN_REQUIRED",
      category: "IDENTIFIER",
      severity: "BLOCKER",
      field: "gtin",
      message: "GTIN is required when the spreadsheet provides a GTIN column",
      remediationHint: "Fill the GTIN value or remove the GTIN column for this batch.",
      blocking: true,
      readinessImpact: "BLOCKED_FOR_REVIEW",
    });
  }

  if (row.resolvedAssets.length === 0) {
    results.push({
      ruleCode: "IMAGE_EVIDENCE_REQUIRED",
      category: "IMAGE",
      severity: "BLOCKER",
      field: "image_id",
      message: "At least one resolved image is required",
      remediationHint: "Upload the image through the image service, update the spreadsheet image_id values, then reprocess intake.",
      blocking: true,
      readinessImpact: "NOT_ENOUGH_DATA",
    });
  }

  const assetIds = row.resolvedAssets.map((asset) => asset.imageId);
  if (assetIds.length > 0) {
    const assets = await client.query<{ image_id: string }>(
      `select image_id from image_assets where organization_id = $1 and image_id = any($2::text[])`,
      [organizationId, assetIds],
    );
    const present = new Set(assets.rows.map((asset) => asset.image_id));

    for (const imageId of assetIds) {
      if (!present.has(imageId)) {
        results.push({
          ruleCode: "IMAGE_ASSET_MISSING",
          category: "IMAGE",
          severity: "BLOCKER",
          field: "image_id",
          message: "Image asset metadata was not found for the referenced image",
          remediationHint: "Re-upload the missing image through the image service, then reprocess intake.",
          blocking: true,
          readinessImpact: "NOT_ENOUGH_DATA",
          evidence: { imageId },
        });
      }
    }
  }

  const variantGroup = normalizedValueForField(row, "variant_group");
  const variantKey = normalizedValueForField(row, "variant_key");
  const variantValue = normalizedValueForField(row, "variant_value");
  if (variantGroup.raw || variantKey.raw || variantValue.raw) {
    if (!variantGroup.normalized || !variantKey.normalized || !variantValue.normalized) {
      results.push({
        ruleCode: "VARIANT_STRUCTURE_INCOMPLETE",
        category: "VARIANT",
        severity: "WARNING",
        field: "variant_group",
        message: "Variant structure is incomplete",
        remediationHint: "Provide variant group, key, and value to enable later variant prep or clear variant columns.",
        blocking: false,
        readinessImpact: "READY_WITH_AUGMENTATION",
        evidence: { variantGroup: variantGroup.normalized, variantKey: variantKey.normalized, variantValue: variantValue.normalized },
      });
    }
  }

  const forcedMatch = normalizedValueForField(row, "forced_match_asin").normalized.trim();
  if (forcedMatch) {
    results.push({
      ruleCode: "FORCED_MATCH_BLOCKED",
      category: "POLICY",
      severity: "BLOCKER",
      field: "forced_match_asin",
      message: "Forced-match protection blocked this row from the new-product-only workflow",
      remediationHint: "Remove the forced_match_asin value or move this row to an existing-ASIN workflow outside the default path.",
      blocking: true,
      readinessImpact: "BLOCKED_FOR_REVIEW",
      evidence: { signalSource: "EXPLICIT_ROW_FIELD", forcedMatchAsin: forcedMatch, decisionOutcome: "BLOCK_DEFAULT_WORKFLOW" },
    });
  }

  const normalizedSku = row.sku.trim().toLowerCase();
  const gtinValue = normalizedValueForField(row, "gtin").normalized.trim().toLowerCase();
  const titleBrandKey = (() => {
    const titleValue = normalizedValueForField(row, "title").normalized.trim().toLowerCase();
    const brandValue = normalizedValueForField(row, "brand").normalized.trim().toLowerCase();
    return titleValue && brandValue ? `${titleValue}::${brandValue}` : "";
  })();

  const duplicateSignals: Array<{ type: string; value: string; count: number }> = [];
  const skuCount = duplicateContext.skuCounts[normalizedSku] ?? 0;
  if (normalizedSku && skuCount > 1) {
    duplicateSignals.push({ type: "SKU", value: normalizedSku, count: skuCount });
  }

  const gtinCount = duplicateContext.gtinCounts[gtinValue] ?? 0;
  if (gtinValue && gtinCount > 1) {
    duplicateSignals.push({ type: "GTIN", value: gtinValue, count: gtinCount });
  }

  const titleBrandCount = duplicateContext.titleBrandCounts[titleBrandKey] ?? 0;
  if (titleBrandKey && titleBrandCount > 1) {
    duplicateSignals.push({ type: "TITLE_BRAND", value: titleBrandKey, count: titleBrandCount });
  }

  if (duplicateSignals.length > 0) {
    results.push({
      ruleCode: "DUPLICATE_RISK_WARNING",
      category: "DUPLICATE",
      severity: "WARNING",
      field: duplicateSignals[0].type.toLowerCase(),
      message: "Potential duplicate risk detected within this batch",
      remediationHint: "Inspect the highlighted rows to confirm this is a new product before proceeding.",
      blocking: false,
      readinessImpact: "READY_WITH_AUGMENTATION",
      evidence: { signalSource: "LOCAL_BATCH_SCAN", matches: duplicateSignals, decisionOutcome: "WARN_ONLY" },
    });
  }

  return results;
}

function evaluateReadinessRow(
  row: BatchIntakeReviewDto["rows"][number],
  validationResults: ValidationRuleResultDto[],
): Omit<BatchReadinessRowDto, "evaluatedAt" | "updatedAt"> {
  const validation = buildValidationSummary(validationResults);
  const readinessState = deriveReadinessState(validationResults);
  const lifecycleStage: RowLifecycleStage =
    readinessState === "READY" || readinessState === "READY_WITH_AUGMENTATION" ? "READY_FOR_SUBMISSION_PREP" : "NEEDS_CORRECTION";
  const imageEvidence = row.resolvedAssets.map((asset) => ({ imageId: asset.imageId, previewRef: asset.previewRef }));
  const issueSummaries: ReadinessIssueSummaryDto[] = validationResults.map((result) => ({ code: result.ruleCode, message: result.message }));

  return {
    rowId: row.rowId,
    batchId: row.batchId,
    sourceRowNumber: row.sourceRowNumber,
    sourceRowKey: row.sourceRowKey,
    rowRevision: row.rowRevision,
    sku: row.sku,
    productName: row.productName,
    brand: row.brand,
    readinessState,
    lifecycleStage,
    validation,
    issueSummaries,
    imageEvidence,
  };
}

function buildReadinessSummary(rows: BatchReadinessRowDto[]): BatchReadinessEvaluationDto["summary"] {
  const ready = rows.filter((row) => row.readinessState === "READY").length;
  const readyAugmented = rows.filter((row) => row.readinessState === "READY_WITH_AUGMENTATION").length;
  const needsInput = rows.filter((row) => row.readinessState === "NEEDS_INPUT").length;
  const blocked = rows.filter((row) => row.readinessState === "BLOCKED_FOR_REVIEW").length;
  const notEnoughData = rows.filter((row) => row.readinessState === "NOT_ENOUGH_DATA").length;

  return {
    totalRows: rows.length,
    ready,
    readyAugmented,
    needsInput,
    blocked,
    notEnoughData,
  };
}

async function upsertReadinessRow(
  client: import("pg").PoolClient,
  organizationId: string,
  batchId: string,
  base: Omit<BatchReadinessRowDto, "evaluatedAt" | "updatedAt">,
) {
  const issueSummaries = JSON.stringify(base.issueSummaries);
  const evidence = JSON.stringify(base.imageEvidence);
  const inserted = await client.query<{ evaluated_at: string; updated_at: string }>(
    `insert into batch_readiness_results (
        organization_id,
        batch_id,
        row_id,
        source_row_number,
        source_row_key,
        row_revision,
        sku,
        product_name,
        brand,
        readiness_state,
        lifecycle_stage,
        issue_summaries,
        evidence
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb)
      on conflict (organization_id, batch_id, row_id, row_revision) do update set
        source_row_number = excluded.source_row_number,
        source_row_key = excluded.source_row_key,
        sku = excluded.sku,
        product_name = excluded.product_name,
        brand = excluded.brand,
        readiness_state = excluded.readiness_state,
        lifecycle_stage = excluded.lifecycle_stage,
        issue_summaries = excluded.issue_summaries,
        evidence = excluded.evidence,
        updated_at = now()
      where batch_readiness_results.source_row_number is distinct from excluded.source_row_number
        or batch_readiness_results.source_row_key is distinct from excluded.source_row_key
        or batch_readiness_results.sku is distinct from excluded.sku
        or batch_readiness_results.product_name is distinct from excluded.product_name
        or batch_readiness_results.brand is distinct from excluded.brand
        or batch_readiness_results.readiness_state is distinct from excluded.readiness_state
        or batch_readiness_results.lifecycle_stage is distinct from excluded.lifecycle_stage
        or batch_readiness_results.issue_summaries is distinct from excluded.issue_summaries
        or batch_readiness_results.evidence is distinct from excluded.evidence
      returning evaluated_at::text, updated_at::text`,
    [
      organizationId,
      batchId,
      base.rowId,
      base.sourceRowNumber,
      base.sourceRowKey,
      base.rowRevision,
      base.sku,
      base.productName,
      base.brand,
      base.readinessState,
      base.lifecycleStage,
      issueSummaries,
      evidence,
    ],
  );

  if (inserted.rows[0]) {
    return { ...base, evaluatedAt: inserted.rows[0].evaluated_at, updatedAt: inserted.rows[0].updated_at } satisfies BatchReadinessRowDto;
  }

  const existing = await client.query<{ evaluated_at: string; updated_at: string }>(
    `select evaluated_at::text, updated_at::text
       from batch_readiness_results
      where organization_id = $1 and batch_id = $2 and row_id = $3 and row_revision = $4`,
    [organizationId, batchId, base.rowId, base.rowRevision],
  );

  const record = existing.rows[0] ?? { evaluated_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  return { ...base, evaluatedAt: record.evaluated_at, updatedAt: record.updated_at } satisfies BatchReadinessRowDto;
}

async function upsertLifecycleEvent(
  client: import("pg").PoolClient,
  organizationId: string,
  batchId: string,
  base: Omit<BatchReadinessRowDto, "evaluatedAt" | "updatedAt">,
) {
  const decisionContext = JSON.stringify({ issueSummaries: base.issueSummaries, imageEvidence: base.imageEvidence });

  await client.query(
    `insert into batch_row_lifecycle_events (
        organization_id,
        batch_id,
        row_id,
        row_revision,
        lifecycle_stage,
        readiness_state,
        decision_context
      )
      values ($1, $2, $3, $4, $5, $6, $7::jsonb)
      on conflict (organization_id, batch_id, row_id, row_revision) do update set
        lifecycle_stage = excluded.lifecycle_stage,
        readiness_state = excluded.readiness_state,
        decision_context = excluded.decision_context,
        updated_at = now()
      where batch_row_lifecycle_events.lifecycle_stage is distinct from excluded.lifecycle_stage
        or batch_row_lifecycle_events.readiness_state is distinct from excluded.readiness_state
        or batch_row_lifecycle_events.decision_context is distinct from excluded.decision_context`,
    [organizationId, batchId, base.rowId, base.rowRevision, base.lifecycleStage, base.readinessState, decisionContext],
  );
}

async function upsertValidationEvidence(
  client: import("pg").PoolClient,
  organizationId: string,
  batchId: string,
  base: Omit<BatchReadinessRowDto, "evaluatedAt" | "updatedAt">,
) {
  const evidence = JSON.stringify({ imageEvidence: base.imageEvidence });

  await client.query(
    `insert into batch_row_validation_evidence (
        organization_id,
        batch_id,
        row_id,
        row_revision,
        evidence
      )
      values ($1, $2, $3, $4, $5::jsonb)
      on conflict (organization_id, batch_id, row_id, row_revision) do update set
        evidence = excluded.evidence,
        updated_at = now()
      where batch_row_validation_evidence.evidence is distinct from excluded.evidence`,
    [organizationId, batchId, base.rowId, base.rowRevision, evidence],
  );
}

async function upsertValidationResults(
  client: import("pg").PoolClient,
  organizationId: string,
  batchId: string,
  rowId: string,
  rowRevision: number,
  results: ValidationRuleResultDto[],
) {
  const payload = JSON.stringify(results);
  const inserted = await client.query<{ evaluated_at: string; updated_at: string }>(
    `insert into batch_row_validation_results (
        organization_id,
        batch_id,
        row_id,
        row_revision,
        rule_version,
        results
      )
      values ($1, $2, $3, $4, $5, $6::jsonb)
      on conflict (organization_id, batch_id, row_id, row_revision) do update set
        rule_version = excluded.rule_version,
        results = excluded.results,
        updated_at = now()
      where batch_row_validation_results.rule_version is distinct from excluded.rule_version
        or batch_row_validation_results.results is distinct from excluded.results
      returning evaluated_at::text, updated_at::text`,
    [organizationId, batchId, rowId, rowRevision, validationRuleVersion, payload],
  );

  if (inserted.rows[0]) {
    return inserted.rows[0];
  }

  const existing = await client.query<{ evaluated_at: string; updated_at: string }>(
    `select evaluated_at::text, updated_at::text
       from batch_row_validation_results
      where organization_id = $1 and batch_id = $2 and row_id = $3 and row_revision = $4`,
    [organizationId, batchId, rowId, rowRevision],
  );

  return existing.rows[0] ?? { evaluated_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

async function upsertProductTypeDecision(
  client: import("pg").PoolClient,
  organizationId: string,
  batchId: string,
  rowId: string,
  rowRevision: number,
  decision: ProductTypeDecisionDto,
) {
  const payload = JSON.stringify(decision);

  await client.query(
    `insert into batch_row_product_type_decisions (
        organization_id,
        batch_id,
        row_id,
        row_revision,
        decision,
        decided_by
      )
      values ($1, $2, $3, $4, $5::jsonb, $6)
      on conflict (organization_id, batch_id, row_id, row_revision) do update set
        decision = excluded.decision,
        decided_by = excluded.decided_by,
        updated_at = now()
      where batch_row_product_type_decisions.decision is distinct from excluded.decision
        or batch_row_product_type_decisions.decided_by is distinct from excluded.decided_by`,
    [organizationId, batchId, rowId, rowRevision, payload, decision.decidedBy],
  );
}

async function handleEvaluateReadiness(req: IncomingMessage, res: ServerResponse, batchId: string) {
  const input = await parseJson(req);
  const organizationId = String(input.organizationId ?? "");

  if (!organizationId) {
    return sendError(res, 400, "MISSING_ORGANIZATION", "Select an active workspace before running readiness evaluation.");
  }

  const review = await readReview(batchId, organizationId);

  if (!review) {
    return sendError(res, 404, "INTAKE_FAILED", "Batch intake data was not found. Create the batch from a spreadsheet before running readiness evaluation.");
  }

  if (!review.handoff.readyForReadinessEvaluation) {
    return sendError(res, 409, "INTAKE_FAILED", "Resolve intake blockers before running readiness evaluation.");
  }

  const client = await getPool().connect();

  try {
    await client.query("begin");
    const rows: BatchReadinessRowDto[] = [];
    const duplicateContext = buildDuplicateContext(review.rows);

    for (const row of review.rows) {
      const productTypeDecision = computeProductTypeDecision(row, null);
      const validationResults = await evaluateValidationRules(client, row, organizationId, duplicateContext, productTypeDecision);
      const base = evaluateReadinessRow(row, validationResults);
      const persisted = await upsertReadinessRow(client, organizationId, batchId, base);
      await upsertLifecycleEvent(client, organizationId, batchId, base);
      await upsertValidationEvidence(client, organizationId, batchId, base);
      await upsertValidationResults(client, organizationId, batchId, base.rowId, base.rowRevision, validationResults);
      await upsertProductTypeDecision(client, organizationId, batchId, base.rowId, base.rowRevision, productTypeDecision);
      rows.push(persisted);
    }

    await client.query("commit");
    const summary = buildReadinessSummary(rows);
    const evaluatedAt = rows.map((row) => row.evaluatedAt).sort().at(-1) ?? new Date().toISOString();
    const updatedAt = rows.map((row) => row.updatedAt).sort().at(-1) ?? evaluatedAt;

    sendJson(res, 200, { batchId, organizationId, rows, summary, evaluatedAt, updatedAt } satisfies BatchReadinessEvaluationDto);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function handleGetReadiness(req: IncomingMessage, res: ServerResponse, batchId: string) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const organizationId = url.searchParams.get("organizationId") ?? "";

  if (!organizationId) {
    return sendError(res, 400, "MISSING_ORGANIZATION", "Select an active workspace before fetching readiness data.");
  }

  const result = await getPool().query<{
    row_id: string;
    source_row_number: number;
    source_row_key: string;
    row_revision: number;
    sku: string;
    product_name: string;
    brand: string;
    readiness_state: ReadinessState;
    lifecycle_stage: RowLifecycleStage;
    issue_summaries: ReadinessIssueSummaryDto[];
    evidence: ReadinessImageEvidenceDto[];
    validation_results: ValidationRuleResultDto[];
    evaluated_at: string;
    updated_at: string;
  }>(
    `select *
       from (
         select distinct on (batch_readiness_results.row_id)
           row_id,
           source_row_number,
           source_row_key,
           row_revision,
           sku,
           product_name,
           brand,
           readiness_state,
           lifecycle_stage,
           issue_summaries,
           evidence,
           coalesce(batch_row_validation_results.results, '[]'::jsonb) as validation_results,
           evaluated_at::text,
           batch_readiness_results.updated_at::text as updated_at
         from batch_readiness_results
         left join batch_row_validation_results
           on batch_row_validation_results.organization_id = batch_readiness_results.organization_id
           and batch_row_validation_results.batch_id = batch_readiness_results.batch_id
           and batch_row_validation_results.row_id = batch_readiness_results.row_id
           and batch_row_validation_results.row_revision = batch_readiness_results.row_revision
         where batch_readiness_results.organization_id = $1 and batch_readiness_results.batch_id = $2
         order by batch_readiness_results.row_id, batch_readiness_results.row_revision desc
       ) latest
      order by source_row_number asc`,
    [organizationId, batchId],
  );

  if (result.rows.length === 0) {
    return sendError(res, 404, "INTAKE_FAILED", "Batch readiness data was not found. Run readiness evaluation before opening triage.");
  }

  const rows: BatchReadinessRowDto[] = result.rows.map((row) => ({
    rowId: row.row_id,
    batchId,
    sourceRowNumber: row.source_row_number,
    sourceRowKey: row.source_row_key,
    rowRevision: row.row_revision,
    sku: row.sku ?? "",
    productName: row.product_name ?? "",
    brand: row.brand ?? "",
    readinessState: row.readiness_state,
    lifecycleStage: row.lifecycle_stage,
    validation: buildValidationSummary(Array.isArray(row.validation_results) ? row.validation_results : []),
    issueSummaries: Array.isArray(row.issue_summaries) ? row.issue_summaries : [],
    imageEvidence: Array.isArray(row.evidence) ? row.evidence : [],
    evaluatedAt: row.evaluated_at,
    updatedAt: row.updated_at,
  }));

  const summary = buildReadinessSummary(rows);
  const evaluatedAt = rows.map((row) => row.evaluatedAt).sort().at(-1) ?? new Date().toISOString();
  const updatedAt = rows.map((row) => row.updatedAt).sort().at(-1) ?? evaluatedAt;

  sendJson(res, 200, { batchId, organizationId, rows, summary, evaluatedAt, updatedAt } satisfies BatchReadinessEvaluationDto);
}

function buildRowIssues(row: Pick<BatchReadinessRowDetailDto, "validationResults" | "batchId" | "rowId">): RowIssueDetailDto[] {
  return row.validationResults.map((result) => {
    const nextActionLabel = result.category === "IMAGE" ? "Open image plan" : "Review mapping";
    const nextActionHref =
      result.category === "IMAGE"
        ? `/batches/${encodeURIComponent(row.batchId)}/images`
        : `/batches/${encodeURIComponent(row.batchId)}/mapping?correction=${encodeURIComponent(row.rowId)}`;

    return {
      severity: result.severity,
      code: result.ruleCode,
      category: result.category,
      reason: result.message,
      remediationHint: result.remediationHint,
      nextActionLabel,
      nextActionHref,
    };
  });
}

function lifecycleSummary(stage: RowLifecycleStage, readiness: ReadinessState) {
  if (stage === "READY_FOR_SUBMISSION_PREP" && readiness === "READY") {
    return "Row is ready for submission prep.";
  }

  if (stage === "NEEDS_CORRECTION") {
    return "Row needs correction before submission prep.";
  }

  if (stage === "READINESS_EVALUATED") {
    return "Row readiness evaluated.";
  }

  return "Row is intake-ready.";
}

type RowCorrectionPatchDto = {
  title?: string;
  brand?: string;
  gtin?: string;
  productType?: string;
  forcedMatchAsin?: string;
  imageIds?: string[];
};

function upsertNormalizedField(
  normalizedFields: BatchIntakeReviewDto["rows"][number]["normalizedFields"],
  field: string,
  label: string,
  value: string,
) {
  const trimmed = value ?? "";
  const existingIndex = normalizedFields.findIndex((item) => item.field === field);
  const next = {
    field,
    label,
    rawValue: trimmed,
    normalizedValue: trimmed,
    confidence: 1,
    status: "MAPPED" as const,
  };

  if (existingIndex === -1) {
    return [...normalizedFields, next];
  }

  const updated = [...normalizedFields];
  updated[existingIndex] = { ...updated[existingIndex], ...next };
  return updated;
}

async function applyRowPatch(
  baseRow: BatchIntakeReviewDto["rows"][number],
  organizationId: string,
  patch: RowCorrectionPatchDto,
  nextRowRevision: number,
): Promise<BatchIntakeReviewDto["rows"][number]> {
  let normalizedFields = baseRow.normalizedFields;
  let productName = baseRow.productName;
  let brand = baseRow.brand;
  let originalImageIds = baseRow.originalImageIds;
  let resolvedAssets = baseRow.resolvedAssets;
  let imageIssues = baseRow.imageIssues;
  let interpretationIssues = baseRow.interpretationIssues;
  let interpretationStatus = baseRow.interpretationStatus;

  if (patch.title !== undefined) {
    productName = patch.title || "Untitled product";
    normalizedFields = upsertNormalizedField(normalizedFields, "title", "Product title", patch.title);
  }

  if (patch.brand !== undefined) {
    brand = patch.brand || "Unknown brand";
    normalizedFields = upsertNormalizedField(normalizedFields, "brand", "Brand", patch.brand);
  }

  if (patch.gtin !== undefined) {
    normalizedFields = upsertNormalizedField(normalizedFields, "gtin", "GTIN", patch.gtin);
  }

  if (patch.productType !== undefined) {
    normalizedFields = upsertNormalizedField(normalizedFields, "product_type", "Product type", patch.productType);
  }

  if (patch.forcedMatchAsin !== undefined) {
    normalizedFields = upsertNormalizedField(normalizedFields, "forced_match_asin", "Forced match ASIN", patch.forcedMatchAsin);
  }

  if (patch.imageIds !== undefined) {
    originalImageIds = patch.imageIds.filter(Boolean);
    const images = await resolveImageReferences(originalImageIds, organizationId);
    resolvedAssets = images.resolvedAssets;
    imageIssues = images.imageIssues;
    interpretationIssues = imageIssues.map((issue) => ({
      code: "UNRESOLVED_IMAGE_REFERENCE" as const,
      label: "Unresolved image reference",
      field: "image references",
      message: issue.message,
      correctionHint: issue.recoveryHint,
    }));
    interpretationStatus = interpretationIssues.length > 0 ? "NEEDS_CORRECTION" : "READY_FOR_REVIEW";
  }

  return {
    ...baseRow,
    rowRevision: nextRowRevision,
    intakeAttempt: baseRow.intakeAttempt + 1,
    productName,
    brand,
    originalImageIds,
    normalizedFields,
    interpretationStatus,
    interpretationIssues,
    resolvedAssets,
    imageIssues,
  };
}

async function loadEffectiveRowSnapshot(
  client: import("pg").PoolClient,
  review: BatchIntakeReviewDto,
  batchId: string,
  organizationId: string,
  rowId: string,
  targetRowRevision: number,
): Promise<BatchIntakeReviewDto["rows"][number] | null> {
  const correction = await client.query<{ base_row_revision: number; patch: RowCorrectionPatchDto }>(
    `select base_row_revision, patch
       from batch_row_corrections
      where organization_id = $1 and batch_id = $2 and row_id = $3 and row_revision = $4`,
    [organizationId, batchId, rowId, targetRowRevision],
  );

  const baseRowRevision = correction.rows[0]?.base_row_revision ?? null;
  const patch = correction.rows[0]?.patch ?? null;

  if (baseRowRevision !== null && patch) {
    const baseSnapshot = await loadEffectiveRowSnapshot(client, review, batchId, organizationId, rowId, baseRowRevision);
    if (!baseSnapshot) {
      return null;
    }
    return applyRowPatch(baseSnapshot, organizationId, patch, targetRowRevision);
  }

  return (
    review.rows.find((row) => row.rowId === rowId && row.rowRevision === targetRowRevision) ??
    review.rows.find((row) => row.rowId === rowId) ??
    null
  );
}

async function handleCorrectRow(req: IncomingMessage, res: ServerResponse, batchId: string, rowId: string) {
  const input = await parseJson(req);
  const organizationId = String(input.organizationId ?? "");
  const baseRowRevision = Number(input.baseRowRevision ?? 0);
  const createdBy = input.createdBy !== undefined ? String(input.createdBy) : null;
  const patch = (input.patch ?? {}) as RowCorrectionPatchDto;

  if (!organizationId) {
    return sendError(res, 400, "MISSING_ORGANIZATION", "Select an active workspace before correcting rows.");
  }

  const client = await getPool().connect();

  try {
    await client.query("begin");

    const currentRevisionResult = await client.query<{ row_revision: number }>(
      `select row_revision
         from batch_readiness_results
        where organization_id = $1 and batch_id = $2 and row_id = $3
        order by row_revision desc
        limit 1`,
      [organizationId, batchId, rowId],
    );

    const currentRevision = currentRevisionResult.rows[0]?.row_revision;

    if (!currentRevision) {
      await client.query("rollback");
      return sendError(res, 404, "INTAKE_FAILED", "Row detail was not found. Run readiness evaluation before correcting rows.");
    }

    if (baseRowRevision && baseRowRevision !== currentRevision) {
      await client.query("rollback");
      return sendError(
        res,
        409,
        "INTAKE_FAILED",
        "Row revision is stale. Refresh the row inspector before applying corrections.",
      );
    }

    const review = await readReview(batchId, organizationId);

    if (!review) {
      await client.query("rollback");
      return sendError(res, 404, "INTAKE_FAILED", "Batch intake data was not found. Create the batch before correcting rows.");
    }

    const baseSnapshot = await loadEffectiveRowSnapshot(client, review, batchId, organizationId, rowId, currentRevision);

    if (!baseSnapshot) {
      await client.query("rollback");
      return sendError(res, 404, "INTAKE_FAILED", "Row data was not found for this revision.");
    }

    const nextRevision = currentRevision + 1;
    const nextSnapshot = await applyRowPatch(baseSnapshot, organizationId, patch, nextRevision);
    const duplicateContext = buildDuplicateContext(
      review.rows.map((row) => (row.rowId === rowId ? nextSnapshot : row)),
    );
    const productTypeDecision = computeProductTypeDecision(nextSnapshot, createdBy);
    const validationResults = await evaluateValidationRules(client, nextSnapshot, organizationId, duplicateContext, productTypeDecision);
    const base = evaluateReadinessRow(nextSnapshot, validationResults);

    await client.query(
      `insert into batch_row_corrections (
          organization_id,
          batch_id,
          row_id,
          base_row_revision,
          row_revision,
          patch,
          created_by
        )
        values ($1, $2, $3, $4, $5, $6::jsonb, $7)
        on conflict (organization_id, batch_id, row_id, row_revision) do update set
          patch = excluded.patch,
          created_by = excluded.created_by,
          updated_at = now()`,
      [organizationId, batchId, rowId, currentRevision, nextRevision, JSON.stringify(patch), createdBy],
    );

    const persisted = await upsertReadinessRow(client, organizationId, batchId, base);
    await upsertLifecycleEvent(client, organizationId, batchId, base);
    await upsertValidationEvidence(client, organizationId, batchId, base);
    await upsertValidationResults(client, organizationId, batchId, base.rowId, base.rowRevision, validationResults);
    await upsertProductTypeDecision(client, organizationId, batchId, base.rowId, base.rowRevision, productTypeDecision);

    await client.query("commit");

    sendJson(res, 200, {
      rowId: persisted.rowId,
      batchId: persisted.batchId,
      organizationId,
      rowRevision: persisted.rowRevision,
      readinessState: persisted.readinessState,
      lifecycleStage: persisted.lifecycleStage,
    });
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function handleGetRowDetail(req: IncomingMessage, res: ServerResponse, batchId: string, rowId: string) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const organizationId = url.searchParams.get("organizationId") ?? "";

  if (!organizationId) {
    return sendError(res, 400, "MISSING_ORGANIZATION", "Select an active workspace before fetching row detail.");
  }

  const readinessResult = await getPool().query<{
    row_id: string;
    source_row_number: number;
    source_row_key: string;
    row_revision: number;
    sku: string;
    product_name: string;
    brand: string;
    readiness_state: ReadinessState;
    lifecycle_stage: RowLifecycleStage;
    issue_summaries: ReadinessIssueSummaryDto[];
    evidence: ReadinessImageEvidenceDto[];
    validation_results: ValidationRuleResultDto[];
    evaluated_at: string;
    updated_at: string;
  }>(
    `select
        row_id,
        source_row_number,
        source_row_key,
        row_revision,
        sku,
        product_name,
        brand,
        readiness_state,
        lifecycle_stage,
        issue_summaries,
        evidence,
        coalesce(batch_row_validation_results.results, '[]'::jsonb) as validation_results,
        evaluated_at::text,
        updated_at::text
      from batch_readiness_results
      left join batch_row_validation_results
        on batch_row_validation_results.organization_id = batch_readiness_results.organization_id
        and batch_row_validation_results.batch_id = batch_readiness_results.batch_id
        and batch_row_validation_results.row_id = batch_readiness_results.row_id
        and batch_row_validation_results.row_revision = batch_readiness_results.row_revision
      where organization_id = $1 and batch_id = $2 and row_id = $3
      order by row_revision desc
      limit 1`,
    [organizationId, batchId, rowId],
  );

  const readiness = readinessResult.rows[0];

  if (!readiness) {
    return sendError(res, 404, "INTAKE_FAILED", "Row detail was not found. Confirm the batch has been evaluated and the row ID is valid.");
  }

  const review = await readReview(batchId, organizationId);

  const snapshotClient = await getPool().connect();
  let intakeRow: BatchIntakeReviewDto["rows"][number] | null = null;

  try {
    intakeRow = review ? await loadEffectiveRowSnapshot(snapshotClient, review, batchId, organizationId, rowId, readiness.row_revision) : null;
  } finally {
    snapshotClient.release();
  }

  const historyResult = await getPool().query<{
    lifecycle_stage: RowLifecycleStage;
    readiness_state: ReadinessState;
    created_at: string;
    updated_at: string;
  }>(
    `select lifecycle_stage, readiness_state, created_at::text, updated_at::text
       from batch_row_lifecycle_events
      where organization_id = $1 and batch_id = $2 and row_id = $3
      order by updated_at desc`,
    [organizationId, batchId, rowId],
  );

  const lifecycleHistory: RowLifecycleEntryDto[] = historyResult.rows.map((entry) => ({
    timestamp: entry.updated_at,
    lifecycleStage: entry.lifecycle_stage,
    readinessState: entry.readiness_state,
    summary: lifecycleSummary(entry.lifecycle_stage, entry.readiness_state),
  }));

  const validationResults = Array.isArray(readiness.validation_results) ? readiness.validation_results : [];
  const productTypeResult = await getPool().query<{ decision: ProductTypeDecisionDto }>(
    `select decision
       from batch_row_product_type_decisions
      where organization_id = $1 and batch_id = $2 and row_id = $3 and row_revision = $4`,
    [organizationId, batchId, rowId, readiness.row_revision],
  );
  const productTypeDecision = productTypeResult.rows[0]?.decision ?? null;

  const detail: BatchReadinessRowDetailDto = {
    rowId,
    batchId,
    organizationId,
    sourceRowNumber: readiness.source_row_number,
    sourceRowKey: readiness.source_row_key,
    intakeAttempt: intakeRow?.intakeAttempt ?? 1,
    rowRevision: readiness.row_revision,
    sku: readiness.sku ?? intakeRow?.sku ?? "",
    productName: readiness.product_name ?? intakeRow?.productName ?? "",
    brand: readiness.brand ?? intakeRow?.brand ?? "",
    readinessState: readiness.readiness_state,
    lifecycleStage: readiness.lifecycle_stage,
    issueSummaries: Array.isArray(readiness.issue_summaries) ? readiness.issue_summaries : [],
    productTypeDecision,
    issues: buildRowIssues({
      validationResults,
      batchId,
      rowId,
    }),
    validationResults,
    imageEvidence: Array.isArray(readiness.evidence) ? readiness.evidence : [],
    normalizedFields: intakeRow?.normalizedFields ?? [],
    originalImageIds: intakeRow?.originalImageIds ?? [],
    lifecycleHistory,
    evaluatedAt: readiness.evaluated_at,
    updatedAt: readiness.updated_at,
  };

  sendJson(res, 200, detail);
}

async function handleGetReviewContext(req: IncomingMessage, res: ServerResponse, batchId: string) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const organizationId = url.searchParams.get("organizationId") ?? "";
  const userId = url.searchParams.get("userId") ?? "";

  if (!organizationId || !userId) {
    return sendError(res, 400, "MISSING_CONTEXT", "Organization and user context are required to load review context.");
  }

  const result = await getPool().query<{ context: Record<string, unknown>; updated_at: string }>(
    `select context, updated_at::text
       from batch_review_contexts
      where organization_id = $1 and batch_id = $2 and user_id = $3`,
    [organizationId, batchId, userId],
  );

  if (!result.rows[0]) {
    return sendJson(res, 200, null);
  }

  sendJson(res, 200, { context: result.rows[0].context, updatedAt: result.rows[0].updated_at });
}

async function handleUpsertReviewContext(req: IncomingMessage, res: ServerResponse, batchId: string) {
  const input = await parseJson(req);
  const organizationId = String(input.organizationId ?? "");
  const userId = String(input.userId ?? "");
  const context = (input.context ?? {}) as Record<string, unknown>;

  if (!organizationId || !userId) {
    return sendError(res, 400, "MISSING_CONTEXT", "Organization and user context are required to save review context.");
  }

  await getPool().query(
    `insert into batch_review_contexts (organization_id, batch_id, user_id, context)
     values ($1, $2, $3, $4::jsonb)
     on conflict (organization_id, batch_id, user_id) do update set
       context = excluded.context,
       updated_at = now()
     where batch_review_contexts.context is distinct from excluded.context`,
    [organizationId, batchId, userId, JSON.stringify(context)],
  );

  sendJson(res, 200, { ok: true });
}

async function routeApi(req: IncomingMessage, res: ServerResponse) {
  await ensureSchema();

  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = url.pathname;

  if (req.method === "POST" && pathname === "/api/image-assets") {
    return handleCreateImage(req, res);
  }

  const previewMatch = pathname.match(/^\/api\/image-assets\/([^/]+)\/preview$/);

  if (req.method === "GET" && previewMatch) {
    return handlePreview(req, res, previewMatch[1]);
  }

  if (req.method === "POST" && pathname === "/api/batches") {
    return handleCreateBatch(req, res);
  }

  if (req.method === "GET" && pathname === "/api/batches") {
    return handleListBatches(req, res);
  }

  const reviewMatch = pathname.match(/^\/api\/batches\/([^/]+)\/intake-review$/);

  if (req.method === "GET" && reviewMatch) {
    return handleGetReview(req, res, reviewMatch[1]);
  }

  const reprocessMatch = pathname.match(/^\/api\/batches\/([^/]+)\/reprocess$/);

  if (req.method === "POST" && reprocessMatch) {
    return handleReprocess(req, res, reprocessMatch[1]);
  }

  const readinessEvaluateMatch = pathname.match(/^\/api\/batches\/([^/]+)\/readiness\/evaluate$/);

  if (req.method === "POST" && readinessEvaluateMatch) {
    return handleEvaluateReadiness(req, res, readinessEvaluateMatch[1]);
  }

  const reviewContextMatch = pathname.match(/^\/api\/batches\/([^/]+)\/review-context$/);

  if (req.method === "GET" && reviewContextMatch) {
    return handleGetReviewContext(req, res, reviewContextMatch[1]);
  }

  if (req.method === "POST" && reviewContextMatch) {
    return handleUpsertReviewContext(req, res, reviewContextMatch[1]);
  }

  const correctionMatch = pathname.match(/^\/api\/batches\/([^/]+)\/rows\/([^/]+)\/corrections$/);

  if (req.method === "POST" && correctionMatch) {
    return handleCorrectRow(req, res, correctionMatch[1], decodeURIComponent(correctionMatch[2]));
  }

  const readinessRowMatch = pathname.match(/^\/api\/batches\/([^/]+)\/rows\/([^/]+)$/);

  if (req.method === "GET" && readinessRowMatch) {
    return handleGetRowDetail(req, res, readinessRowMatch[1], decodeURIComponent(readinessRowMatch[2]));
  }

  const readinessMatch = pathname.match(/^\/api\/batches\/([^/]+)\/readiness$/);

  if (req.method === "GET" && readinessMatch) {
    return handleGetReadiness(req, res, readinessMatch[1]);
  }

  sendError(res, 404, "NOT_FOUND", "API route was not found.");
}

export function bulkSkuApiPlugin(): Plugin {
  const projectRoot = findProjectRoot(process.cwd());
  loadEnvFiles(projectRoot);

  return {
    name: "bulk-sku-api",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res) => {
        try {
          req.url = `/api${req.url ?? ""}`;
          await routeApi(req, res);
        } catch (error) {
          console.error(error);
          sendError(res, 500, "SERVICE_FAILURE", error instanceof Error ? error.message : "API service failed.");
        }
      });
    },
  };
}
