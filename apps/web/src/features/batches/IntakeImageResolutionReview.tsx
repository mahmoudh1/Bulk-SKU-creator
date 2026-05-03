import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Image as ImageIcon, PencilLine, RotateCw } from "lucide-react";

import { useOrganizationContext } from "@/app/organizations/OrganizationProvider";
import { appPaths } from "@/app/routes/paths";
import {
  getBatchIntakeReview,
  reprocessBatchIntake,
  type BatchIntakeReviewDto,
  type BatchIntakeRowDto,
  type FieldMappingStatus,
  type IntakeReprocessAttemptDto,
  type IntakeReprocessRowOutcomeStatus,
  type ReprocessBatchIntakeInput,
} from "@/lib/api-client/batches";

const mappingStatusLabel: Record<FieldMappingStatus, string> = {
  MAPPED: "Mapped",
  LOW_CONFIDENCE: "Low confidence",
  UNMAPPED_REQUIRED: "Unmapped required",
  INVALID_TRANSFORM: "Invalid transform",
};

function statusClass(status: FieldMappingStatus) {
  if (status === "MAPPED") {
    return "border-status-ready-border bg-status-ready-bg text-status-ready";
  }

  if (status === "LOW_CONFIDENCE") {
    return "border-status-needs-input-border bg-status-needs-input-bg text-status-needs-input";
  }

  return "border-status-blocked-border bg-status-blocked-bg text-status-blocked";
}

function StatusPill({ status }: { status: FieldMappingStatus }) {
  return (
    <span className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${statusClass(status)}`}>
      {mappingStatusLabel[status]}
    </span>
  );
}

function AssetCell({ row }: { row: BatchIntakeRowDto }) {
  if (row.resolvedAssets.length > 0) {
    return (
      <div className="flex flex-wrap gap-2">
        {row.resolvedAssets.map((asset) => (
          <figure key={asset.imageId} className="flex items-center gap-2 rounded-sm border border-status-ready-border bg-status-ready-bg p-2">
            <img
              src={asset.previewRef}
              alt={`${row.sku} preview for ${asset.imageId}`}
              className="h-12 w-12 rounded-sm border border-border bg-card object-cover"
            />
            <figcaption className="min-w-0 text-xs">
              <div className="font-mono text-foreground">{asset.imageId}</div>
              <div className="mt-0.5 text-muted-foreground">{asset.filename}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-status-ready">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Resolved
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {row.imageIssues.map((issue) => (
        <div key={`${issue.code}-${issue.originalImageId}`} className="rounded-sm border border-status-blocked-border bg-status-blocked-bg p-2 text-xs">
          <div className="font-mono text-foreground">{issue.originalImageId}</div>
          <div className="mt-1 flex items-center gap-1 font-medium text-status-blocked">
            <AlertCircle className="h-3.5 w-3.5" />
            {issue.message}
          </div>
          <div className="mt-1 text-muted-foreground">{issue.recoveryHint}</div>
        </div>
      ))}
    </div>
  );
}

function NormalizedFieldsCell({ row }: { row: BatchIntakeRowDto }) {
  return (
    <div className="space-y-2">
      {row.normalizedFields.map((field) => (
        <div key={field.field} className="rounded-sm border border-border bg-card p-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{field.label}: {field.normalizedValue}</span>
            <StatusPill status={field.status} />
          </div>
          <div className="mt-1 text-muted-foreground">
            Raw: {field.rawValue} | Confidence {Math.round(field.confidence * 100)}%
          </div>
          {field.issueMessage ? <div className="mt-1 text-status-needs-input">{field.issueMessage}</div> : null}
        </div>
      ))}
    </div>
  );
}

function InterpretationIssuesCell({ row }: { row: BatchIntakeRowDto }) {
  if (row.interpretationIssues.length === 0 && row.imageIssues.length === 0) {
    return <span className="text-status-ready">No intake issues</span>;
  }

  return (
    <div className="space-y-2">
      {row.interpretationIssues.map((issue) => (
        <div key={`${issue.code}-${issue.field ?? row.rowId}`} className="rounded-sm border border-status-needs-input-border bg-status-needs-input-bg p-2 text-xs">
          <div className="font-medium text-status-needs-input">{issue.label}</div>
          <div className="mt-1 text-foreground">{issue.message}</div>
          <div className="mt-1 text-muted-foreground">{issue.correctionHint}</div>
        </div>
      ))}
      {row.imageIssues.length > 0 ? (
        <Link
          to={`${appPaths.batchMapping(row.batchId)}?correction=${row.rowId}`}
          aria-label={`Review correction path for ${row.rowId}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-status-needs-input-border bg-card px-2.5 text-xs font-medium text-status-needs-input hover:bg-muted"
        >
          <PencilLine className="h-3.5 w-3.5" />
          Review correction path
        </Link>
      ) : null}
    </div>
  );
}

const outcomeLabel: Record<IntakeReprocessRowOutcomeStatus, string> = {
  CORRECTED: "Corrected",
  UNCHANGED: "Unchanged",
  STILL_NEEDS_CORRECTION: "Still needs correction",
};

function outcomeClass(status: IntakeReprocessRowOutcomeStatus) {
  if (status === "CORRECTED") {
    return "border-status-ready-border bg-status-ready-bg text-status-ready";
  }

  if (status === "UNCHANGED") {
    return "border-status-neutral-border bg-status-neutral-bg text-status-neutral";
  }

  return "border-status-needs-input-border bg-status-needs-input-bg text-status-needs-input";
}

function PostReprocessOutcomes({ attempt }: { attempt: IntakeReprocessAttemptDto }) {
  return (
    <section className="panel">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Post-reprocess outcomes</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Corrected rows receive a new revision. Unaffected rows remain stable under the same batch.
        </p>
      </header>
      <div className="overflow-x-auto">
        <table aria-label="Post-reprocess outcomes" className="w-full text-sm">
          <thead>
            <tr className="label-mono border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 font-normal">Row</th>
              <th className="px-2 py-2 font-normal">Attempt</th>
              <th className="px-2 py-2 font-normal">Outcome</th>
              <th className="px-2 py-2 font-normal">Image references</th>
              <th className="px-2 py-2 font-normal">Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {attempt.rowOutcomes.map((outcome) => (
              <tr key={outcome.rowId} className={outcome.status === "STILL_NEEDS_CORRECTION" ? "bg-status-needs-input-bg/40" : ""}>
                <td className="px-4 py-3 align-top">
                  <div className="font-mono text-xs">{outcome.rowId}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Source row {outcome.sourceRowNumber}</div>
                </td>
                <td className="px-2 py-3 align-top">
                  <div className="text-xs">Attempt {outcome.attemptNumber}</div>
                  <div className="mt-1 text-xs text-muted-foreground">rev {outcome.rowRevision}</div>
                </td>
                <td className="px-2 py-3 align-top">
                  <span className={`inline-flex rounded-sm border px-1.5 py-0.5 text-xs font-medium ${outcomeClass(outcome.status)}`}>
                    {outcomeLabel[outcome.status]}
                  </span>
                  <div className="mt-2 text-xs text-muted-foreground">{outcome.message}</div>
                  {outcome.issueSummaries.map((issue) => (
                    <div key={issue} className="mt-1 text-xs text-status-needs-input">
                      {issue}
                    </div>
                  ))}
                  {outcome.status === "STILL_NEEDS_CORRECTION" ? (
                    <Link
                      to={`${appPaths.batchMapping(attempt.batchId)}?correction=${outcome.rowId}`}
                      aria-label={`Correct remaining issues for ${outcome.rowId}`}
                      className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-sm border border-status-needs-input-border bg-card px-2 text-xs font-medium text-status-needs-input hover:bg-muted"
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                      Correct remaining issues
                    </Link>
                  ) : null}
                </td>
                <td className="px-2 py-3 align-top font-mono text-xs">{outcome.imageIds.join(", ")}</td>
                <td className="px-2 py-3 align-top text-xs text-muted-foreground">
                  SKU {outcome.sku} | Previous rev {outcome.previousRowRevision} | batch {attempt.batchId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function IntakeHandoffStatus({ review }: { review: BatchIntakeReviewDto }) {
  const handoff = review.handoff;
  const correctionPath = handoff.nextCorrectionRowId
    ? `${appPaths.batchMapping(review.batchId)}?correction=${handoff.nextCorrectionRowId}`
    : appPaths.batchMapping(review.batchId);
  const readinessPath = handoff.readyForReadinessEvaluation ? appPaths.batchReview(review.batchId) : appPaths.batchMapping(review.batchId);

  return (
    <section className="panel mb-4 p-4" role="region" aria-label="Intake handoff status">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="label-mono text-xs text-muted-foreground">Intake handoff status</div>
          <h2 className="mt-1 text-lg font-semibold">{handoff.statusLabel}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{handoff.statusDetail}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-sm border border-border bg-card px-2 py-1">
              Batch {review.batchId}
            </span>
            <span className="rounded-sm border border-border bg-card px-2 py-1">
              {handoff.blockerCount} blockers{handoff.blockerRowCount > 0 ? ` across ${handoff.blockerRowCount} rows` : ""}
            </span>
            <span className="rounded-sm border border-border bg-card px-2 py-1">
              {review.summary.totalRows} rows in intake scope
            </span>
          </div>
          {handoff.blockers.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm">
              {handoff.blockers.map((blocker) => (
                <li key={blocker.code} className="text-status-needs-input">
                  {blocker.label}: {blocker.affectedRows} {blocker.affectedRows === 1 ? "row" : "rows"}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            to={readinessPath}
            aria-disabled={handoff.readyForReadinessEvaluation ? undefined : "true"}
            tabIndex={handoff.readyForReadinessEvaluation ? undefined : -1}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-sm px-3 text-sm font-medium ${
              handoff.readyForReadinessEvaluation
                ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                : "cursor-not-allowed border border-border bg-muted text-muted-foreground"
            }`}
          >
            Continue to readiness evaluation <ArrowRight className="h-4 w-4" />
          </Link>
          {!handoff.readyForReadinessEvaluation && handoff.nextCorrectionRowId ? (
            <Link
              to={correctionPath}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-sm border border-status-needs-input-border bg-card px-3 text-sm font-medium text-status-needs-input hover:bg-muted"
            >
              <PencilLine className="h-4 w-4" />
              Correct intake blockers
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function IntakeImageResolutionReview() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { activeWorkspace } = useOrganizationContext();
  const queryClient = useQueryClient();
  const [imageCorrections, setImageCorrections] = useState<Record<string, string>>({});
  const [fieldCorrections, setFieldCorrections] = useState<Record<string, string>>({});

  const reviewQuery = useQuery({
    queryKey: ["batchIntake", id, activeWorkspace?.id, "imageResolution"],
    queryFn: () => getBatchIntakeReview({ batchId: id, organizationId: activeWorkspace?.id ?? "" }),
    enabled: Boolean(id && activeWorkspace?.id),
  });

  const reprocessMutation = useMutation<IntakeReprocessAttemptDto, Error, ReprocessBatchIntakeInput>({
    mutationFn: (input) => reprocessBatchIntake(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["batchIntake", id, activeWorkspace?.id] });
    },
  });

  if (reviewQuery.isLoading) {
    return (
      <div className="grid min-h-[320px] place-items-center p-6">
        <div className="text-sm text-muted-foreground" role="status">
          Resolving spreadsheet image IDs...
        </div>
      </div>
    );
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    const message =
      typeof reviewQuery.error === "object" && reviewQuery.error && "message" in reviewQuery.error
        ? String(reviewQuery.error.message)
        : "Image resolution could not load. Retry intake review when the service is available.";

    return (
      <div className="p-6">
        <div className="rounded-sm border border-status-blocked-border bg-status-blocked-bg p-4 text-sm text-status-blocked" role="alert">
          {message}
        </div>
      </div>
    );
  }

  const review = reviewQuery.data;
  const correctionRowId = searchParams.get("correction");
  const selectedCorrectionRow =
    review.rows.find((row) => row.rowId === correctionRowId) ??
    review.rows.find((row) => row.interpretationIssues.length > 0 || row.imageIssues.length > 0);

  const selectedFieldIssue = selectedCorrectionRow?.interpretationIssues.find((issue) => issue.code === "LOW_CONFIDENCE_MAPPING");
  const selectedImageIssue = selectedCorrectionRow?.imageIssues[0];
  const selectedImageCorrection =
    selectedCorrectionRow && selectedImageIssue
      ? imageCorrections[selectedCorrectionRow.rowId] ?? selectedImageIssue.originalImageId
      : "";
  const selectedFieldCorrection =
    selectedCorrectionRow && selectedFieldIssue?.field
      ? fieldCorrections[selectedCorrectionRow.rowId] ?? selectedFieldIssue.field
      : "";

  function submitReprocess() {
    if (!selectedCorrectionRow || !activeWorkspace?.id) {
      return;
    }

    reprocessMutation.mutate({
      batchId: review.batchId,
      organizationId: activeWorkspace.id,
      corrections: [
        {
          rowId: selectedCorrectionRow.rowId,
          sourceRowNumber: selectedCorrectionRow.sourceRowNumber,
          rowRevision: selectedCorrectionRow.rowRevision,
          imageIdCorrection: selectedImageIssue
            ? {
                originalValue: selectedImageIssue.originalImageId,
                correctedValue: selectedImageCorrection,
              }
            : undefined,
          fieldMappingCorrections:
            selectedFieldIssue?.field && selectedFieldCorrection
              ? [
                  {
                    field: selectedFieldIssue.field,
                    originalValue: selectedFieldIssue.field,
                    correctedValue: selectedFieldCorrection,
                  },
                ]
              : [],
        },
      ],
    });
  }

  return (
    <div className="max-w-[1400px] px-6 py-5">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="label-mono text-xs text-muted-foreground">Step 2 of 3 | Normalization checkpoint</div>
          <h1 className="mt-1 text-xl font-semibold">Review intake mapping</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Confirm source field mapping, normalized row output, and server-resolved image assets before deeper processing continues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={appPaths.createBatch} className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-sm hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link
            to={appPaths.batchReview(review.batchId)}
            aria-disabled={review.handoff.readyForReadinessEvaluation ? undefined : "true"}
            tabIndex={review.handoff.readyForReadinessEvaluation ? undefined : -1}
            className={`inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm font-medium ${
              review.handoff.readyForReadinessEvaluation
                ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                : "cursor-not-allowed border border-border bg-muted text-muted-foreground"
            }`}
          >
            Continue to readiness <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <IntakeHandoffStatus review={review} />

      {review.summary.mappingIssueCount > 0 ? (
        <div className="mb-4 rounded-sm border border-status-needs-input-border bg-status-needs-input-bg px-3 py-2.5 text-sm text-status-needs-input" role="alert">
          Correct mapping issues before reprocessing. Rows remain traceable to the uploaded source and can be reviewed through the correction path.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
        <section className="panel">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Detected field mappings</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Source columns are mapped to the intake model by the backend and remain reviewable before reprocessing.
            </p>
          </header>
          <div className="overflow-x-auto">
            <table aria-label="Detected field mappings" className="w-full text-sm">
              <thead>
                <tr className="label-mono border-b border-border bg-muted/30 text-left">
                  <th className="px-4 py-2 font-normal">Source column</th>
                  <th className="px-2 py-2 font-normal">Model field</th>
                  <th className="px-2 py-2 font-normal">Confidence</th>
                  <th className="px-2 py-2 font-normal">Status</th>
                  <th className="px-2 py-2 font-normal">Sample</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {review.fieldMappings.map((mapping) => (
                  <tr key={`${mapping.sourceColumn}-${mapping.internalField}`} className={mapping.status !== "MAPPED" ? "bg-status-needs-input-bg/40" : ""}>
                    <td className="px-4 py-3 font-mono text-xs">{mapping.sourceColumn}</td>
                    <td className="px-2 py-3">{mapping.internalField}</td>
                    <td className="px-2 py-3 tabular-nums">{Math.round(mapping.confidence * 100)}%</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <StatusPill status={mapping.status} />
                        {mapping.issueMessage ? <span className="text-xs text-status-needs-input">{mapping.issueMessage}</span> : null}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="max-w-xs text-xs">
                        <div className="text-muted-foreground">Raw: {mapping.sampleRawValue}</div>
                        <div className="mt-0.5 text-foreground">Normalized: {mapping.sampleNormalizedValue}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Normalized rows and linked image references</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Each row keeps source identity, normalized fields, and platform-controlled image previews together.
            </p>
          </header>
          <div className="overflow-x-auto">
            <table aria-label="Normalized row review" className="w-full text-sm">
              <thead>
                <tr className="label-mono border-b border-border bg-muted/30 text-left">
                  <th className="px-4 py-2 font-normal">Source identity</th>
                  <th className="px-2 py-2 font-normal">Normalized output</th>
                  <th className="px-2 py-2 font-normal">Image references</th>
                  <th className="px-2 py-2 font-normal">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {review.rows.map((row) => (
                  <tr
                    key={row.rowId}
                    className={row.interpretationStatus === "NEEDS_CORRECTION" || row.imageIssues.length > 0 ? "bg-status-needs-input-bg/40" : ""}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-mono text-xs text-foreground">{row.rowId}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Source row {row.sourceRowNumber}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Attempt {row.intakeAttempt} rev {row.rowRevision}</div>
                      <div className="mt-2 font-mono text-xs">{row.sku}</div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="font-medium">{row.productName}</div>
                      <div className="text-xs text-muted-foreground">{row.brand}</div>
                      <div className="mt-3">
                        <NormalizedFieldsCell row={row} />
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="mb-2 text-xs text-muted-foreground">
                        Original image_id {row.originalImageIds.join(", ")}
                      </div>
                      <AssetCell row={row} />
                    </td>
                    <td className="px-2 py-3 align-top">
                      <InterpretationIssuesCell row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        </div>

        <aside className="space-y-4">
          <section className="panel p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <PencilLine className="h-4 w-4 text-status-needs-input" />
              Correct intake issue
            </h2>
            {selectedCorrectionRow ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-sm border border-border bg-card p-2 text-xs">
                  <div className="font-mono text-foreground">{selectedCorrectionRow.rowId}</div>
                  <div className="mt-1 text-muted-foreground">
                    Source row {selectedCorrectionRow.sourceRowNumber} | rev {selectedCorrectionRow.rowRevision}
                  </div>
                </div>
                {selectedImageIssue ? (
                  <label className="block text-xs font-medium">
                    Corrected image_id for {selectedCorrectionRow.rowId}
                    <input
                      value={selectedImageCorrection}
                      onChange={(event) =>
                        setImageCorrections((current) => ({
                          ...current,
                          [selectedCorrectionRow.rowId]: event.target.value,
                        }))
                      }
                      className="mt-1 h-9 w-full rounded-sm border border-border bg-background px-2 font-mono text-sm"
                    />
                    <span className="mt-1 block text-muted-foreground">Original value: {selectedImageIssue.originalImageId}</span>
                  </label>
                ) : null}
                {selectedFieldIssue?.field ? (
                  <label className="block text-xs font-medium">
                    Corrected model field for {selectedCorrectionRow.rowId}
                    <input
                      value={selectedFieldCorrection}
                      onChange={(event) =>
                        setFieldCorrections((current) => ({
                          ...current,
                          [selectedCorrectionRow.rowId]: event.target.value,
                        }))
                      }
                      className="mt-1 h-9 w-full rounded-sm border border-border bg-background px-2 text-sm"
                    />
                    <span className="mt-1 block text-muted-foreground">Original mapping: {selectedFieldIssue.field}</span>
                  </label>
                ) : null}
                <button
                  type="button"
                  onClick={submitReprocess}
                  disabled={reprocessMutation.isPending}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-sm bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RotateCw className="h-4 w-4" />
                  Reprocess intake
                </button>
                {reprocessMutation.isPending ? (
                  <div className="text-xs text-status-augmented" role="status">
                    Attempt 2 queued for existing batch...
                  </div>
                ) : null}
                {reprocessMutation.data ? (
                  <div className="rounded-sm border border-status-ready-border bg-status-ready-bg p-2 text-xs text-status-ready" role="status">
                    Attempt {reprocessMutation.data.attemptNumber} {reprocessMutation.data.status.toLowerCase()}. Correlation{" "}
                    {reprocessMutation.data.correlationId}.
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No fixable intake issues are currently selected.</p>
            )}
          </section>

          <section className="panel p-4">
            <h2 className="text-sm font-semibold">Intake summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Source file</dt>
                <dd className="text-right font-medium">{review.sourceFile.filename}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Rows checked</dt>
                <dd className="tabular-nums">{review.summary.totalRows}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Resolved assets</dt>
                <dd className="tabular-nums text-status-ready">{review.summary.resolvedImageCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Image issues</dt>
                <dd className="tabular-nums text-status-needs-input">{review.summary.issueCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Mapping issues</dt>
                <dd className="tabular-nums text-status-needs-input">{review.summary.mappingIssueCount}</dd>
              </div>
            </dl>
          </section>

          <section className="panel p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="h-4 w-4 text-primary" />
              Access model
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Image IDs are resolved server-side against assets owned by {activeWorkspace?.name ?? "the active workspace"}.
              Inaccessible image IDs remain visible as row-level issues for correction.
            </p>
          </section>
        </aside>
      </div>

      {reprocessMutation.data ? (
        <div className="mt-4">
          <PostReprocessOutcomes attempt={reprocessMutation.data} />
        </div>
      ) : null}
    </div>
  );
}
