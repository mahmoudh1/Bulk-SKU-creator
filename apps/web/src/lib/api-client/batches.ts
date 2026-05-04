import { findStoredImageAsset } from "@/lib/api-client/image-assets";

export type BatchIntakeStatus =
  | "DRAFT"
  | "UPLOADING"
  | "INTAKE_QUEUED"
  | "INTAKE_PROCESSING"
  | "INTAKE_NEEDS_CORRECTION"
  | "INTAKE_READY"
  | "INTAKE_FAILED"
  | "INTAKE_REPROCESSING";
export type ImageResolutionStatus = "RESOLVED" | "UNRESOLVED";
export type ImageIntakeIssueCode =
  | "IMAGE_ID_NOT_FOUND"
  | "IMAGE_ID_FORBIDDEN"
  | "IMAGE_ASSET_UNREADABLE"
  | "IMAGE_RESOLUTION_PENDING";
export type FieldMappingStatus = "MAPPED" | "LOW_CONFIDENCE" | "UNMAPPED_REQUIRED" | "INVALID_TRANSFORM";
export type RowInterpretationStatus = "READY_FOR_REVIEW" | "NEEDS_CORRECTION";
export type IntakeReprocessAttemptStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
export type IntakeReprocessRowOutcomeStatus = "CORRECTED" | "UNCHANGED" | "STILL_NEEDS_CORRECTION";
export type IntakeInterpretationIssueCode =
  | "UNMAPPED_REQUIRED_FIELD"
  | "LOW_CONFIDENCE_MAPPING"
  | "INVALID_NORMALIZED_VALUE"
  | "UNRESOLVED_IMAGE_REFERENCE"
  | "MISSING_REQUIRED_SOURCE_STRUCTURE";

export type BatchCreateErrorCode =
  | "INVALID_SOURCE_FILE"
  | "UNSUPPORTED_SPREADSHEET_TYPE"
  | "MISSING_REQUIRED_COLUMNS"
  | "MISSING_ORGANIZATION"
  | "MISSING_INITIATING_USER"
  | "INTAKE_FAILED";

export interface BatchApiError {
  code: BatchCreateErrorCode;
  message: string;
}

export interface BatchSourceFileDto {
  sourceFileId: string;
  filename: string;
  mediaType: string;
  sizeBytes: number;
  requiredColumns: string[];
}

export interface CreateBatchRequestDto {
  batchName: string;
  marketplace: string;
  organizationId: string;
  createdBy: string;
  sourceFile: File;
}

export interface CreateBatchResponseDto {
  batchId: string;
  organizationId: string;
  createdBy: string;
  marketplace: string;
  batchName: string;
  sourceFile: BatchSourceFileDto;
  intakeStatus: Extract<BatchIntakeStatus, "INTAKE_QUEUED" | "INTAKE_PROCESSING">;
  createdAt: string;
}

export interface ResolvedImageAssetDto {
  imageId: string;
  previewRef: string;
  filename: string;
  label: string;
  organizationId: string;
  resolutionStatus: "RESOLVED";
}

export interface ImageIntakeIssueDto {
  code: ImageIntakeIssueCode;
  message: string;
  originalImageId: string;
  recoveryHint: string;
}

export interface FieldMappingDto {
  sourceColumn: string;
  internalField: string;
  confidence: number;
  status: FieldMappingStatus;
  sampleRawValue: string;
  sampleNormalizedValue: string;
  issueCode?: IntakeInterpretationIssueCode;
  issueMessage?: string;
}

export interface NormalizedFieldDto {
  field: string;
  label: string;
  rawValue: string;
  normalizedValue: string;
  confidence: number;
  status: FieldMappingStatus;
  issueCode?: IntakeInterpretationIssueCode;
  issueMessage?: string;
}

export interface RowInterpretationIssueDto {
  code: IntakeInterpretationIssueCode;
  label: string;
  field?: string;
  message: string;
  correctionHint: string;
}

export interface BatchIntakeRowDto {
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
  normalizedFields: NormalizedFieldDto[];
  interpretationStatus: RowInterpretationStatus;
  interpretationIssues: RowInterpretationIssueDto[];
  resolvedAssets: ResolvedImageAssetDto[];
  imageIssues: ImageIntakeIssueDto[];
}

export interface IntakeBlockerSummaryDto {
  code: IntakeInterpretationIssueCode | ImageIntakeIssueCode | "SERVICE_FAILURE";
  label: string;
  affectedRows: number;
  firstRowId?: string;
}

export interface BatchIntakeReviewDto {
  batchId: string;
  organizationId: string;
  intakeStatus: BatchIntakeStatus;
  sourceFile: Pick<BatchSourceFileDto, "sourceFileId" | "filename">;
  fieldMappings: FieldMappingDto[];
  rows: BatchIntakeRowDto[];
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
    blockers: IntakeBlockerSummaryDto[];
    nextCorrectionRowId?: string;
  };
}

export interface GetBatchIntakeReviewInput {
  batchId: string;
  organizationId: string;
}

export interface ImageIdCorrectionDto {
  originalValue: string;
  correctedValue: string;
}

export interface FieldMappingCorrectionDto {
  field: string;
  originalValue: string;
  correctedValue: string;
}

export interface IntakeCorrectionDto {
  rowId: string;
  sourceRowNumber: number;
  rowRevision: number;
  imageIdCorrection?: ImageIdCorrectionDto;
  fieldMappingCorrections: FieldMappingCorrectionDto[];
}

export interface ReprocessBatchIntakeInput {
  batchId: string;
  organizationId: string;
  corrections: IntakeCorrectionDto[];
}

export interface IntakeReprocessRowOutcomeDto {
  rowId: string;
  sourceRowNumber: number;
  previousRowRevision: number;
  rowRevision: number;
  attemptNumber: number;
  sku: string;
  status: IntakeReprocessRowOutcomeStatus;
  imageIds: string[];
  message: string;
  issueSummaries: string[];
}

export interface IntakeReprocessAttemptDto {
  attemptId: string;
  attemptNumber: number;
  batchId: string;
  organizationId: string;
  status: IntakeReprocessAttemptStatus;
  startedAt: string;
  completedAt: string | null;
  correlationId: string;
  rowOutcomes: IntakeReprocessRowOutcomeDto[];
  summary: {
    correctedRows: number;
    unchangedRows: number;
    remainingIssueRows: number;
  };
}

const supportedSpreadsheetTypes = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

const requiredColumns = ["sku", "name", "brand", "image_id"] as const;

export interface BatchListItemDto {
  id: string;
  name: string;
  marketplace: string;
  owner: string;
  createdAt: string;
  lastUpdated: string;
  totalRows: number;
  ready: number;
  readyAugmented: number;
  needsInput: number;
  blocked: number;
  notEnough: number;
  submission: "DRAFT" | "QUEUED" | "PROCESSING" | "DELAYED" | "RETRYING" | "SUCCEEDED" | "FAILED" | "PARTIAL";
}

function shouldUseLocalFallback() {
  return import.meta.env.MODE === "test";
}

async function parseApiError(response: Response): Promise<BatchApiError> {
  try {
    const body = (await response.json()) as BatchApiError;

    if (body?.code && body?.message) {
      return body;
    }
  } catch {
    // Fall through to a stable client-facing error.
  }

  return { code: "INTAKE_FAILED", message: "Batch intake could not start. Replace the file or try again." };
}

function hasSupportedSpreadsheetExtension(filename: string) {
  return /\.(csv|xlsx)$/i.test(filename);
}

function normalizeIdPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function validateBatchSpreadsheet(file: File | null): BatchApiError | null {
  if (!file) {
    return { code: "INVALID_SOURCE_FILE", message: "Select a spreadsheet before starting intake." };
  }

  if (!supportedSpreadsheetTypes.includes(file.type as (typeof supportedSpreadsheetTypes)[number]) && !hasSupportedSpreadsheetExtension(file.name)) {
    return {
      code: "UNSUPPORTED_SPREADSHEET_TYPE",
      message: "Unsupported spreadsheet type. Upload a CSV or XLSX file.",
    };
  }

  if (file.size === 0) {
    return { code: "INVALID_SOURCE_FILE", message: "The spreadsheet is empty. Replace it with a populated source file." };
  }

  return null;
}

async function readFileText(file: File) {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function readSpreadsheetHeader(file: File) {
  const text = await readFileText(file);
  const [header = ""] = text.split(/\r?\n/);

  return header
    .split(",")
    .map((column) => column.trim().toLowerCase())
    .filter(Boolean);
}

type SourceRow = Record<string, string>;

const batchReviewStorageKey = "bulk-sku-creator:batch-intake-reviews:v1";

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseCsv(text: string) {
  const [headerLine = "", ...bodyLines] = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = headerLine.split(",").map((column) => column.trim());
  const normalizedHeaders = headers.map((column) => column.toLowerCase());
  const rows = bodyLines.map((line): SourceRow => {
    const values = line.split(",").map((value) => value.trim());

    return normalizedHeaders.reduce<SourceRow>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });

  return { headers: normalizedHeaders, rows };
}

function readStoredReviews(): Record<string, BatchIntakeReviewDto> {
  if (!canUseBrowserStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(batchReviewStorageKey);
    return raw ? (JSON.parse(raw) as Record<string, BatchIntakeReviewDto>) : {};
  } catch {
    return {};
  }
}

function writeStoredReview(review: BatchIntakeReviewDto) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(
    batchReviewStorageKey,
    JSON.stringify({
      ...readStoredReviews(),
      [review.batchId]: review,
    }),
  );
}

function loadStoredReview(batchId: string, organizationId: string) {
  const review = readStoredReviews()[batchId];

  if (!review || review.organizationId !== organizationId) {
    return null;
  }

  return review;
}

function sourceValue(row: SourceRow, ...keys: string[]) {
  return keys.map((key) => row[key]).find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

function buildFieldMappings(headers: string[], firstRow: SourceRow | undefined): FieldMappingDto[] {
  const mapHeader = (sourceColumn: string, internalField: string, sampleValue: string): FieldMappingDto => ({
    sourceColumn,
    internalField,
    confidence: 1,
    status: "MAPPED",
    sampleRawValue: sampleValue,
    sampleNormalizedValue: sampleValue,
  });

  return headers.map((header) => {
    if (header === "sku") {
      return mapHeader(header, "sku", sourceValue(firstRow ?? {}, "sku"));
    }

    if (header === "name") {
      return mapHeader(header, "title", sourceValue(firstRow ?? {}, "name"));
    }

    if (header === "brand") {
      return mapHeader(header, "brand", sourceValue(firstRow ?? {}, "brand"));
    }

    if (header === "image_id") {
      return mapHeader(header, "image references", sourceValue(firstRow ?? {}, "image_id"));
    }

    return mapHeader(header, header.replace(/_/g, " "), sourceValue(firstRow ?? {}, header));
  });
}

function resolveImageReferences(imageIds: string[], organizationId: string) {
  const resolvedAssets: ResolvedImageAssetDto[] = [];
  const imageIssues: ImageIntakeIssueDto[] = [];

  imageIds.forEach((imageId) => {
    const asset = findStoredImageAsset(imageId, organizationId);

    if (asset) {
      resolvedAssets.push({
        imageId: asset.image_id,
        previewRef: `/api/image-assets/${asset.image_id}/preview`,
        filename: asset.filename,
        label: "Main image",
        organizationId,
        resolutionStatus: "RESOLVED",
      });
      return;
    }

    imageIssues.push({
      code: "IMAGE_ID_NOT_FOUND",
      message: "Image ID not found",
      originalImageId: imageId,
      recoveryHint: "Upload the image through the image service or correct the spreadsheet image_id, then reprocess intake.",
    });
  });

  return { resolvedAssets, imageIssues };
}

function buildRowsFromSource(batchId: string, organizationId: string, rows: SourceRow[]): BatchIntakeRowDto[] {
  return rows.map((sourceRow, index) => {
    const rowId = `src-row-${index + 1}`;
    const imageIds = sourceValue(sourceRow, "image_id")
      .split(/[;\s]+/)
      .map((imageId) => imageId.trim())
      .filter(Boolean);
    const { resolvedAssets, imageIssues } = resolveImageReferences(imageIds, organizationId);
    const interpretationIssues: RowInterpretationIssueDto[] = imageIssues.map((issue) => ({
      code: "UNRESOLVED_IMAGE_REFERENCE",
      label: "Unresolved image reference",
      field: "image references",
      message: issue.message,
      correctionHint: issue.recoveryHint,
    }));

    return {
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
    };
  });
}

function buildReviewSummary(fieldMappings: FieldMappingDto[], rows: BatchIntakeRowDto[]): BatchIntakeReviewDto["summary"] {
  return {
    totalRows: rows.length,
    resolvedImageCount: rows.reduce((sum, row) => sum + row.resolvedAssets.length, 0),
    issueCount: rows.reduce((sum, row) => sum + row.imageIssues.length, 0),
    mappingIssueCount:
      fieldMappings.filter((mapping) => mapping.status !== "MAPPED").length +
      rows.reduce((sum, row) => sum + row.interpretationIssues.length, 0),
  };
}

function resolveReviewStatus(rows: BatchIntakeRowDto[]): BatchIntakeStatus {
  return rows.some((row) => row.interpretationIssues.length > 0 || row.imageIssues.length > 0) ? "INTAKE_NEEDS_CORRECTION" : "INTAKE_READY";
}

function finalizeReview(review: Omit<BatchIntakeReviewDto, "summary" | "handoff">): BatchIntakeReviewDto {
  const summary = buildReviewSummary(review.fieldMappings, review.rows);

  return {
    ...review,
    summary,
    handoff: buildHandoffSummary(review.intakeStatus, review.rows),
  };
}

export async function createBatchFromSpreadsheet(input: CreateBatchRequestDto): Promise<CreateBatchResponseDto> {
  if (!input.organizationId) {
    throw { code: "MISSING_ORGANIZATION", message: "Select an active workspace before creating a batch." } satisfies BatchApiError;
  }

  if (!input.createdBy) {
    throw { code: "MISSING_INITIATING_USER", message: "Sign in again before creating a batch." } satisfies BatchApiError;
  }

  const validationError = validateBatchSpreadsheet(input.sourceFile);

  if (validationError) {
    throw validationError;
  }

  if (!/\.csv$/i.test(input.sourceFile.name) && input.sourceFile.type !== "text/csv") {
    throw {
      code: "UNSUPPORTED_SPREADSHEET_TYPE",
      message: "CSV intake is available in this local app build. Export XLSX sources to CSV before starting intake.",
    } satisfies BatchApiError;
  }

  if (!shouldUseLocalFallback()) {
    const formData = new FormData();
    formData.append("batchName", input.batchName);
    formData.append("marketplace", input.marketplace);
    formData.append("organizationId", input.organizationId);
    formData.append("createdBy", input.createdBy);
    formData.append("sourceFile", input.sourceFile);

    const response = await fetch("/api/batches", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return (await response.json()) as CreateBatchResponseDto;
  }

  const columns = await readSpreadsheetHeader(input.sourceFile);
  const missingColumns = requiredColumns.filter((column) => !columns.includes(column));

  if (missingColumns.length > 0) {
    throw {
      code: "MISSING_REQUIRED_COLUMNS",
      message: `Spreadsheet is missing required ${missingColumns.join(", ")} column. Include image_id values issued by the image service.`,
    } satisfies BatchApiError;
  }

  const text = await readFileText(input.sourceFile);
  const { headers, rows: sourceRows } = parseCsv(text);
  const safeFileName = normalizeIdPart(input.sourceFile.name.replace(/\.(csv|xlsx)$/i, ""));
  const batchId = `batch_${input.organizationId}_${safeFileName}`;
  const fieldMappings = buildFieldMappings(headers, sourceRows[0]);
  const rows = buildRowsFromSource(batchId, input.organizationId, sourceRows);
  const intakeStatus = resolveReviewStatus(rows);
  const sourceFile = {
    sourceFileId: `src_${batchId}`,
    filename: input.sourceFile.name,
    mediaType: input.sourceFile.type || "application/octet-stream",
    sizeBytes: input.sourceFile.size,
    requiredColumns: [...requiredColumns],
  };

  writeStoredReview(
    finalizeReview({
      batchId,
      organizationId: input.organizationId,
      intakeStatus,
      sourceFile,
      fieldMappings,
      rows,
    }),
  );

  return {
    batchId,
    organizationId: input.organizationId,
    createdBy: input.createdBy,
    marketplace: input.marketplace,
    batchName: input.batchName,
    sourceFile,
    intakeStatus: "INTAKE_PROCESSING",
    createdAt: new Date().toISOString(),
  };
}

function summarizeIntakeBlockers(rows: BatchIntakeRowDto[]): IntakeBlockerSummaryDto[] {
  const byCode = new Map<IntakeInterpretationIssueCode, { label: string; rowIds: Set<string>; firstRowId?: string }>();

  rows.forEach((row) => {
    row.interpretationIssues.forEach((issue) => {
      const current = byCode.get(issue.code) ?? { label: issue.label, rowIds: new Set<string>(), firstRowId: row.rowId };

      current.rowIds.add(row.rowId);
      current.firstRowId ??= row.rowId;
      byCode.set(issue.code, current);
    });
  });

  return Array.from(byCode.entries()).map(([code, summary]) => ({
    code,
    label: summary.label,
    affectedRows: summary.rowIds.size,
    firstRowId: summary.firstRowId,
  }));
}

function buildHandoffSummary(intakeStatus: BatchIntakeStatus, rows: BatchIntakeRowDto[]): BatchIntakeReviewDto["handoff"] {
  const blockers = summarizeIntakeBlockers(rows);
  const blockerCount = rows.reduce((sum, row) => sum + row.interpretationIssues.length, 0);
  const blockerRowCount = new Set(rows.filter((row) => row.interpretationIssues.length > 0).map((row) => row.rowId)).size;
  const nextCorrectionRowId = blockers.find((blocker) => blocker.firstRowId)?.firstRowId;

  if (intakeStatus === "INTAKE_QUEUED") {
    return {
      readyForReadinessEvaluation: false,
      statusLabel: "Intake queued",
      statusDetail: "Waiting for intake worker.",
      blockerCount,
      blockerRowCount,
      blockers,
      nextCorrectionRowId,
    };
  }

  if (intakeStatus === "INTAKE_PROCESSING") {
    return {
      readyForReadinessEvaluation: false,
      statusLabel: "Intake processing",
      statusDetail: "Normalizing rows and resolving image references.",
      blockerCount,
      blockerRowCount,
      blockers,
      nextCorrectionRowId,
    };
  }

  if (intakeStatus === "INTAKE_REPROCESSING") {
    return {
      readyForReadinessEvaluation: false,
      statusLabel: "Intake reprocessing",
      statusDetail: "Applying corrections from the latest attempt.",
      blockerCount,
      blockerRowCount,
      blockers,
      nextCorrectionRowId,
    };
  }

  if (intakeStatus === "INTAKE_FAILED") {
    return {
      readyForReadinessEvaluation: false,
      statusLabel: "Intake failed",
      statusDetail: "Retry intake after reviewing service failure.",
      blockerCount: blockerCount || 1,
      blockerRowCount,
      blockers: blockers.length > 0 ? blockers : [{ code: "SERVICE_FAILURE", label: "Service failure", affectedRows: 0 }],
      nextCorrectionRowId,
    };
  }

  if (intakeStatus === "INTAKE_READY") {
    return {
      readyForReadinessEvaluation: true,
      statusLabel: "Intake ready",
      statusDetail: "Ready for readiness evaluation.",
      blockerCount: 0,
      blockerRowCount: 0,
      blockers: [],
      nextCorrectionRowId: undefined,
    };
  }

  return {
    readyForReadinessEvaluation: false,
    statusLabel: "Intake needs correction",
    statusDetail: `${blockerCount} blockers across ${blockerRowCount} rows must be corrected before readiness evaluation.`,
    blockerCount,
    blockerRowCount,
    blockers,
    nextCorrectionRowId,
  };
}

export async function getBatchIntakeReview({ batchId, organizationId }: GetBatchIntakeReviewInput): Promise<BatchIntakeReviewDto> {
  if (!shouldUseLocalFallback()) {
    const response = await fetch(`/api/batches/${encodeURIComponent(batchId)}/intake-review?organizationId=${encodeURIComponent(organizationId)}`);

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return (await response.json()) as BatchIntakeReviewDto;
  }

  const review = loadStoredReview(batchId, organizationId);

  if (!review) {
    throw {
      code: "INTAKE_FAILED",
      message: "Batch intake data was not found. Create the batch from a spreadsheet before opening mapping.",
    } satisfies BatchApiError;
  }

  return finalizeReview({
    batchId: review.batchId,
    organizationId: review.organizationId,
    intakeStatus: review.intakeStatus,
    sourceFile: review.sourceFile,
    fieldMappings: review.fieldMappings,
    rows: review.rows,
  });
}

export async function reprocessBatchIntake({ batchId, organizationId, corrections }: ReprocessBatchIntakeInput): Promise<IntakeReprocessAttemptDto> {
  if (!shouldUseLocalFallback()) {
    const response = await fetch(`/api/batches/${encodeURIComponent(batchId)}/reprocess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, corrections }),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return (await response.json()) as IntakeReprocessAttemptDto;
  }

  const review = loadStoredReview(batchId, organizationId);

  if (!review) {
    throw {
      code: "INTAKE_FAILED",
      message: "Batch intake data was not found. Create the batch from a spreadsheet before reprocessing.",
    } satisfies BatchApiError;
  }

  const baseRows = review.rows;
  const correctionByRow = new Map(corrections.map((correction) => [correction.rowId, correction]));
  const attemptNumber = 2;

  const rowOutcomes = baseRows.map((row): IntakeReprocessRowOutcomeDto => {
    const correction = correctionByRow.get(row.rowId);

    if (!correction) {
      return {
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
      };
    }

    const correctedImageId = correction.imageIdCorrection?.correctedValue.trim();
    const stillMissing = Boolean(correction.imageIdCorrection) && (!correctedImageId || !findStoredImageAsset(correctedImageId, organizationId));

    if (stillMissing) {
      return {
        rowId: row.rowId,
        sourceRowNumber: row.sourceRowNumber,
        previousRowRevision: row.rowRevision,
        rowRevision: row.rowRevision + 1,
        attemptNumber,
        sku: row.sku,
        status: "STILL_NEEDS_CORRECTION",
        imageIds: correctedImageId ? [correctedImageId] : row.originalImageIds,
        message: "Batch remains recoverable",
        issueSummaries: ["Image ID not found after reprocess"],
      };
    }

    return {
      rowId: row.rowId,
      sourceRowNumber: row.sourceRowNumber,
      previousRowRevision: row.rowRevision,
      rowRevision: row.rowRevision + 1,
      attemptNumber,
      sku: row.sku,
      status: "CORRECTED",
      imageIds: correctedImageId ? [correctedImageId] : row.originalImageIds,
      message: "Corrected row reprocessed",
      issueSummaries: [],
    };
  });

  const remainingIssueRows = rowOutcomes.filter((outcome) => outcome.status === "STILL_NEEDS_CORRECTION").length;
  const updatedRows = baseRows.map((row) => {
    const outcome = rowOutcomes.find((rowOutcome) => rowOutcome.rowId === row.rowId);

    if (!outcome || outcome.status !== "CORRECTED") {
      return row;
    }

    const { resolvedAssets, imageIssues } = resolveImageReferences(outcome.imageIds, organizationId);

    return {
      ...row,
      intakeAttempt: attemptNumber,
      rowRevision: outcome.rowRevision,
      originalImageIds: outcome.imageIds,
      interpretationStatus: imageIssues.length > 0 ? "NEEDS_CORRECTION" : "READY_FOR_REVIEW",
      interpretationIssues: imageIssues.map((issue) => ({
        code: "UNRESOLVED_IMAGE_REFERENCE",
        label: "Unresolved image reference",
        field: "image references",
        message: issue.message,
        correctionHint: issue.recoveryHint,
      })),
      resolvedAssets,
      imageIssues,
    } satisfies BatchIntakeRowDto;
  });

  writeStoredReview(
    finalizeReview({
      batchId: review.batchId,
      organizationId: review.organizationId,
      intakeStatus: resolveReviewStatus(updatedRows),
      sourceFile: review.sourceFile,
      fieldMappings: review.fieldMappings,
      rows: updatedRows,
    }),
  );

  return {
    attemptId: `intake-attempt-${batchId}-${attemptNumber}`,
    attemptNumber,
    batchId,
    organizationId,
    status: remainingIssueRows > 0 ? "FAILED" : "COMPLETED",
    startedAt: new Date("2026-05-03T16:10:00.000Z").toISOString(),
    completedAt: new Date("2026-05-03T16:10:08.000Z").toISOString(),
    correlationId: `intake-reprocess-${batchId}-${attemptNumber}`,
    rowOutcomes,
    summary: {
      correctedRows: rowOutcomes.filter((outcome) => outcome.status === "CORRECTED").length,
      unchangedRows: rowOutcomes.filter((outcome) => outcome.status === "UNCHANGED").length,
      remainingIssueRows,
    },
  };
}

export async function listBatches(organizationId: string): Promise<BatchListItemDto[]> {
  if (!organizationId) {
    return [];
  }

  if (shouldUseLocalFallback()) {
    return Object.values(readStoredReviews())
      .filter((review) => review.organizationId === organizationId)
      .map((review) => ({
        id: review.batchId,
        name: review.batchId,
        marketplace: "Amazon.eg",
        owner: "Current user",
        createdAt: review.sourceFile.filename,
        lastUpdated: review.intakeStatus,
        totalRows: review.summary.totalRows,
        ready: review.rows.filter((row) => row.interpretationStatus === "READY_FOR_REVIEW").length,
        readyAugmented: 0,
        needsInput: review.handoff.blockerRowCount,
        blocked: review.summary.issueCount,
        notEnough: 0,
      submission: "DRAFT",
      }));
  }

  const response = await fetch(`/api/batches?organizationId=${encodeURIComponent(organizationId)}`);

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as BatchListItemDto[];
}

export type ReadinessState = "READY" | "READY_WITH_AUGMENTATION" | "NEEDS_INPUT" | "NOT_ENOUGH_DATA" | "BLOCKED_FOR_REVIEW";
export type RowLifecycleStage = "INTAKE_READY" | "READINESS_EVALUATED" | "NEEDS_CORRECTION" | "READY_FOR_SUBMISSION_PREP";

export interface ReadinessIssueSummaryDto {
  code: string;
  message: string;
}

export interface ReadinessImageEvidenceDto {
  imageId: string;
  previewRef: string;
}

export interface ProductTypeCandidateDto {
  productType: string;
  confidence: number;
}

export interface ProductTypeDecisionDto {
  candidates: ProductTypeCandidateDto[];
  threshold: number;
  selectedValue: string;
  confirmedValue: string | null;
  confirmationRequired: boolean;
  reason: string;
  decidedBy: string | null;
}

export interface BatchReadinessRowDto {
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

export interface BatchReadinessEvaluationDto {
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

export interface EvaluateBatchReadinessInput {
  batchId: string;
  organizationId: string;
}

export type RowIssueSeverity = "BLOCKER" | "WARNING";

export interface RowIssueDetailDto {
  severity: RowIssueSeverity;
  code: string;
  reason: string;
  nextActionLabel: string;
  nextActionHref?: string;
}

export interface RowLifecycleEntryDto {
  timestamp: string;
  lifecycleStage: RowLifecycleStage;
  readinessState: ReadinessState;
  summary: string;
}

export interface BatchReadinessRowDetailDto {
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
  imageEvidence: ReadinessImageEvidenceDto[];
  normalizedFields: NormalizedFieldDto[];
  originalImageIds: string[];
  lifecycleHistory: RowLifecycleEntryDto[];
  evaluatedAt: string;
  updatedAt: string;
}

const batchReadinessStorageKey = "bulk-sku-creator:batch-readiness-evaluations:v1";
const batchReviewContextStorageKey = "bulk-sku-creator:batch-review-contexts:v1";

function readStoredReadiness(): Record<string, BatchReadinessEvaluationDto> {
  if (!canUseBrowserStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(batchReadinessStorageKey);
    return raw ? (JSON.parse(raw) as Record<string, BatchReadinessEvaluationDto>) : {};
  } catch {
    return {};
  }
}

export interface BatchReviewContextDto {
  batchId: string;
  organizationId: string;
  userId: string;
  context: Record<string, string>;
  updatedAt: string;
}

function readStoredReviewContexts(): Record<string, BatchReviewContextDto> {
  if (!canUseBrowserStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(batchReviewContextStorageKey);
    return raw ? (JSON.parse(raw) as Record<string, BatchReviewContextDto>) : {};
  } catch {
    return {};
  }
}

function writeStoredReviewContext(entry: BatchReviewContextDto) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(
    batchReviewContextStorageKey,
    JSON.stringify({
      ...readStoredReviewContexts(),
      [`${entry.organizationId}:${entry.userId}:${entry.batchId}`]: entry,
    }),
  );
}

function loadStoredReviewContext(batchId: string, organizationId: string, userId: string) {
  return readStoredReviewContexts()[`${organizationId}:${userId}:${batchId}`] ?? null;
}

function writeStoredReadiness(evaluation: BatchReadinessEvaluationDto) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(
    batchReadinessStorageKey,
    JSON.stringify({
      ...readStoredReadiness(),
      [evaluation.batchId]: evaluation,
    }),
  );
}

function loadStoredReadiness(batchId: string, organizationId: string) {
  const evaluation = readStoredReadiness()[batchId];

  if (!evaluation || evaluation.organizationId !== organizationId) {
    return null;
  }

  return evaluation;
}

function readinessStableHash(
  row: Pick<
    BatchReadinessRowDto,
    "readinessState" | "lifecycleStage" | "issueSummaries" | "imageEvidence" | "rowRevision" | "sku" | "productName" | "brand"
  >,
) {
  return JSON.stringify({
    readinessState: row.readinessState,
    lifecycleStage: row.lifecycleStage,
    issueSummaries: row.issueSummaries,
    imageEvidence: row.imageEvidence,
    rowRevision: row.rowRevision,
    sku: row.sku,
    productName: row.productName,
    brand: row.brand,
  });
}

function normalizedValueForField(row: BatchIntakeRowDto, field: string) {
  const match = row.normalizedFields.find((item) => item.field === field);
  return {
    raw: match?.rawValue ?? "",
    normalized: match?.normalizedValue ?? "",
  };
}

function computeProductTypeDecisionLocal(row: BatchIntakeRowDto, decidedBy: string | null): ProductTypeDecisionDto {
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

function evaluateReadinessRow(row: BatchIntakeRowDto): Omit<BatchReadinessRowDto, "evaluatedAt" | "updatedAt"> {
  const productTypeDecision = computeProductTypeDecisionLocal(row, null);
  const issueSummaries: ReadinessIssueSummaryDto[] = [
    ...row.interpretationIssues.map((issue) => ({ code: issue.code, message: issue.message })),
    ...row.imageIssues.map((issue) => ({ code: issue.code, message: issue.message })),
  ];

  if (productTypeDecision.confirmationRequired) {
    issueSummaries.push({
      code: "PRODUCT_TYPE_CONFIRMATION_REQUIRED",
      message: "Product type requires manual confirmation",
    });
  }
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

export async function evaluateBatchReadiness({ batchId, organizationId }: EvaluateBatchReadinessInput): Promise<BatchReadinessEvaluationDto> {
  if (!batchId || !organizationId) {
    throw { code: "INTAKE_FAILED", message: "Batch readiness evaluation requires a batch and workspace." } satisfies BatchApiError;
  }

  if (!shouldUseLocalFallback()) {
    const response = await fetch(`/api/batches/${encodeURIComponent(batchId)}/readiness/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId }),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return (await response.json()) as BatchReadinessEvaluationDto;
  }

  const review = loadStoredReview(batchId, organizationId);

  if (!review) {
    throw {
      code: "INTAKE_FAILED",
      message: "Batch intake data was not found. Create the batch from a spreadsheet before running readiness evaluation.",
    } satisfies BatchApiError;
  }

  const previous = loadStoredReadiness(batchId, organizationId);
  const now = new Date("2026-05-03T18:45:00.000Z").toISOString();
  const rows = review.rows.map((row) => {
    const base = evaluateReadinessRow(row);
    const existing = previous?.rows.find((item) => item.rowId === base.rowId && item.rowRevision === base.rowRevision);

    if (existing && readinessStableHash(existing) === readinessStableHash(base)) {
      return existing;
    }

    const updatedAt = existing?.updatedAt ?? now;
    const evaluatedAt = existing?.evaluatedAt ?? now;

    return { ...base, evaluatedAt, updatedAt: existing ? now : updatedAt };
  });

  const updatedAt = previous && rows.every((row) => previous.rows.some((prevRow) => prevRow.rowId === row.rowId && prevRow.rowRevision === row.rowRevision && readinessStableHash(prevRow) === readinessStableHash(row)))
    ? previous.updatedAt
    : now;
  const evaluatedAt = previous?.evaluatedAt ?? now;

  const evaluation: BatchReadinessEvaluationDto = {
    batchId,
    organizationId,
    rows,
    summary: buildReadinessSummary(rows),
    evaluatedAt,
    updatedAt,
  };

  writeStoredReadiness(evaluation);
  return evaluation;
}

export async function getBatchReadiness({ batchId, organizationId }: EvaluateBatchReadinessInput): Promise<BatchReadinessEvaluationDto> {
  if (!batchId || !organizationId) {
    throw { code: "INTAKE_FAILED", message: "Batch readiness evaluation requires a batch and workspace." } satisfies BatchApiError;
  }

  if (!shouldUseLocalFallback()) {
    const response = await fetch(`/api/batches/${encodeURIComponent(batchId)}/readiness?organizationId=${encodeURIComponent(organizationId)}`);

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return (await response.json()) as BatchReadinessEvaluationDto;
  }

  const readiness = loadStoredReadiness(batchId, organizationId);

  if (!readiness) {
    throw {
      code: "INTAKE_FAILED",
      message: "Batch readiness data was not found. Run readiness evaluation before opening the triage workspace.",
    } satisfies BatchApiError;
  }

  return readiness;
}

export async function getBatchReviewContext(input: { batchId: string; organizationId: string; userId: string }): Promise<BatchReviewContextDto | null> {
  if (!input.batchId || !input.organizationId || !input.userId) {
    throw { code: "INTAKE_FAILED", message: "Batch review context requires a batch, workspace, and user." } satisfies BatchApiError;
  }

  if (!shouldUseLocalFallback()) {
    const response = await fetch(
      `/api/batches/${encodeURIComponent(input.batchId)}/review-context?organizationId=${encodeURIComponent(input.organizationId)}&userId=${encodeURIComponent(input.userId)}`,
    );

    if (!response.ok) {
      throw await parseApiError(response);
    }

    const payload = (await response.json()) as { context: Record<string, string>; updatedAt: string } | null;

    if (!payload) {
      return null;
    }

    return {
      batchId: input.batchId,
      organizationId: input.organizationId,
      userId: input.userId,
      context: payload.context ?? {},
      updatedAt: payload.updatedAt,
    };
  }

  return loadStoredReviewContext(input.batchId, input.organizationId, input.userId);
}

export async function saveBatchReviewContext(input: { batchId: string; organizationId: string; userId: string; context: Record<string, string> }) {
  if (!input.batchId || !input.organizationId || !input.userId) {
    throw { code: "INTAKE_FAILED", message: "Batch review context requires a batch, workspace, and user." } satisfies BatchApiError;
  }

  if (!shouldUseLocalFallback()) {
    const response = await fetch(`/api/batches/${encodeURIComponent(input.batchId)}/review-context`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: input.organizationId,
        userId: input.userId,
        context: input.context,
      }),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    await response.json();
    return;
  }

  writeStoredReviewContext({
    batchId: input.batchId,
    organizationId: input.organizationId,
    userId: input.userId,
    context: input.context,
    updatedAt: new Date().toISOString(),
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

function buildRowIssues(input: { issueSummaries: ReadinessIssueSummaryDto[]; readinessState: ReadinessState; batchId: string; rowId: string }): RowIssueDetailDto[] {
  return input.issueSummaries.map((issue) => {
    const needsCorrection = input.readinessState !== "READY" && input.readinessState !== "READY_WITH_AUGMENTATION";
    const nextActionLabel = needsCorrection ? "Review correction path" : "Review readiness state";
    const nextActionHref = needsCorrection ? `/batches/${encodeURIComponent(input.batchId)}/mapping?correction=${encodeURIComponent(input.rowId)}` : undefined;

    return {
      severity: needsCorrection ? "BLOCKER" : "WARNING",
      code: issue.code,
      reason: issue.message,
      nextActionLabel,
      nextActionHref,
    };
  });
}

export interface GetBatchRowDetailInput {
  batchId: string;
  rowId: string;
  organizationId: string;
}

export interface CorrectBatchRowInput {
  batchId: string;
  rowId: string;
  organizationId: string;
  baseRowRevision: number;
  createdBy?: string;
  patch: {
    title?: string;
    brand?: string;
    gtin?: string;
    productType?: string;
    forcedMatchAsin?: string;
    imageIds?: string[];
  };
}

function upsertNormalizedField(normalizedFields: NormalizedFieldDto[], field: string, label: string, value: string) {
  const trimmed = value ?? "";
  const index = normalizedFields.findIndex((item) => item.field === field);
  const next = {
    field,
    label,
    rawValue: trimmed,
    normalizedValue: trimmed,
    confidence: 1,
    status: "MAPPED" as const,
  };

  if (index === -1) {
    return [...normalizedFields, next];
  }

  const updated = [...normalizedFields];
  updated[index] = { ...updated[index], ...next };
  return updated;
}

function applyRowPatchLocal(row: BatchIntakeRowDto, organizationId: string, patch: CorrectBatchRowInput["patch"]): BatchIntakeRowDto {
  let normalizedFields = row.normalizedFields;
  let productName = row.productName;
  let brand = row.brand;
  let originalImageIds = row.originalImageIds;
  let resolvedAssets = row.resolvedAssets;
  let imageIssues = row.imageIssues;
  let interpretationIssues = row.interpretationIssues;
  let interpretationStatus = row.interpretationStatus;

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
    const images = resolveImageReferences(originalImageIds, organizationId);
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
    ...row,
    intakeAttempt: row.intakeAttempt + 1,
    rowRevision: row.rowRevision + 1,
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

export async function getBatchRowDetail({ batchId, rowId, organizationId }: GetBatchRowDetailInput): Promise<BatchReadinessRowDetailDto> {
  if (!batchId || !rowId || !organizationId) {
    throw { code: "INTAKE_FAILED", message: "Row detail requires a batch, row, and workspace." } satisfies BatchApiError;
  }

  if (!shouldUseLocalFallback()) {
    const response = await fetch(
      `/api/batches/${encodeURIComponent(batchId)}/rows/${encodeURIComponent(rowId)}?organizationId=${encodeURIComponent(organizationId)}`,
    );

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return (await response.json()) as BatchReadinessRowDetailDto;
  }

  const readiness = loadStoredReadiness(batchId, organizationId);
  const review = loadStoredReview(batchId, organizationId);

  const readinessRow = readiness?.rows.find((row) => row.rowId === rowId);

  if (!readinessRow || !readiness) {
    throw {
      code: "INTAKE_FAILED",
      message: "Row detail was not found. Run readiness evaluation before opening the inspector.",
    } satisfies BatchApiError;
  }

  const intakeRow =
    review?.rows.find((row) => row.rowId === rowId && row.rowRevision === readinessRow.rowRevision) ??
    review?.rows.find((row) => row.rowId === rowId) ??
    null;

  const issueSummaries = readinessRow.issueSummaries;
  const productTypeDecision = intakeRow ? computeProductTypeDecisionLocal(intakeRow, null) : null;
  const lifecycleHistory: RowLifecycleEntryDto[] = [
    {
      timestamp: readinessRow.updatedAt,
      lifecycleStage: readinessRow.lifecycleStage,
      readinessState: readinessRow.readinessState,
      summary: lifecycleSummary(readinessRow.lifecycleStage, readinessRow.readinessState),
    },
  ];

  return {
    rowId: readinessRow.rowId,
    batchId,
    organizationId,
    sourceRowNumber: readinessRow.sourceRowNumber,
    sourceRowKey: readinessRow.sourceRowKey,
    intakeAttempt: intakeRow?.intakeAttempt ?? 1,
    rowRevision: readinessRow.rowRevision,
    sku: readinessRow.sku,
    productName: readinessRow.productName,
    brand: readinessRow.brand,
    readinessState: readinessRow.readinessState,
    lifecycleStage: readinessRow.lifecycleStage,
    issueSummaries,
    productTypeDecision,
    issues: buildRowIssues({ issueSummaries, readinessState: readinessRow.readinessState, batchId, rowId }),
    imageEvidence: readinessRow.imageEvidence,
    normalizedFields: intakeRow?.normalizedFields ?? [],
    originalImageIds: intakeRow?.originalImageIds ?? [],
    lifecycleHistory,
    evaluatedAt: readiness.evaluatedAt,
    updatedAt: readinessRow.updatedAt,
  };
}

export async function correctBatchRow(input: CorrectBatchRowInput): Promise<BatchReadinessRowDetailDto> {
  if (!input.batchId || !input.rowId || !input.organizationId) {
    throw { code: "INTAKE_FAILED", message: "Row correction requires a batch, row, and workspace." } satisfies BatchApiError;
  }

  if (!shouldUseLocalFallback()) {
    const response = await fetch(`/api/batches/${encodeURIComponent(input.batchId)}/rows/${encodeURIComponent(input.rowId)}/corrections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: input.organizationId,
        createdBy: input.createdBy,
        baseRowRevision: input.baseRowRevision,
        patch: input.patch,
      }),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    await response.json();
    return getBatchRowDetail({ batchId: input.batchId, rowId: input.rowId, organizationId: input.organizationId });
  }

  const review = loadStoredReview(input.batchId, input.organizationId);

  if (!review) {
    throw {
      code: "INTAKE_FAILED",
      message: "Batch intake data was not found. Create the batch from a spreadsheet before correcting rows.",
    } satisfies BatchApiError;
  }

  const rowIndex = review.rows.findIndex((row) => row.rowId === input.rowId);

  if (rowIndex === -1) {
    throw { code: "INTAKE_FAILED", message: "Row could not be found for correction." } satisfies BatchApiError;
  }

  const current = review.rows[rowIndex];

  if (input.baseRowRevision && current.rowRevision !== input.baseRowRevision) {
    throw { code: "INTAKE_FAILED", message: "Row revision is stale. Refresh before applying corrections." } satisfies BatchApiError;
  }

  const updatedRow = applyRowPatchLocal(current, input.organizationId, input.patch);
  const updatedRows = [...review.rows];
  updatedRows[rowIndex] = updatedRow;

  const updatedReview = finalizeReview({
    batchId: review.batchId,
    organizationId: review.organizationId,
    sourceFile: review.sourceFile,
    fieldMappings: review.fieldMappings,
    intakeStatus: resolveReviewStatus(updatedRows),
    rows: updatedRows,
  });

  writeStoredReview(updatedReview);
  await evaluateBatchReadiness({ batchId: input.batchId, organizationId: input.organizationId });

  return getBatchRowDetail({ batchId: input.batchId, rowId: input.rowId, organizationId: input.organizationId });
}
