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
