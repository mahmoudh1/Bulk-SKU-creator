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

function evaluateReadinessRow(row: BatchIntakeReviewDto["rows"][number]): Omit<BatchReadinessRowDto, "evaluatedAt" | "updatedAt"> {
  const issueSummaries: ReadinessIssueSummaryDto[] = [
    ...row.interpretationIssues.map((issue) => ({ code: issue.code, message: issue.message })),
    ...row.imageIssues.map((issue) => ({ code: issue.code, message: issue.message })),
  ];
  const readinessState: ReadinessState = issueSummaries.length > 0 ? "NEEDS_INPUT" : "READY";
  const lifecycleStage: RowLifecycleStage = readinessState === "READY" ? "READY_FOR_SUBMISSION_PREP" : "NEEDS_CORRECTION";
  const imageEvidence = row.resolvedAssets.map((asset) => ({ imageId: asset.imageId, previewRef: asset.previewRef }));

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

    for (const row of review.rows) {
      const base = evaluateReadinessRow(row);
      const persisted = await upsertReadinessRow(client, organizationId, batchId, base);
      await upsertLifecycleEvent(client, organizationId, batchId, base);
      await upsertValidationEvidence(client, organizationId, batchId, base);
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
        evaluated_at::text,
        updated_at::text
      from batch_readiness_results
      where organization_id = $1 and batch_id = $2
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
