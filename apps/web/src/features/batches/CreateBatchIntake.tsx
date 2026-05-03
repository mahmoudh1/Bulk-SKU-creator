import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, FileSpreadsheet, ImageIcon, RefreshCw, Trash2, Upload } from "lucide-react";

import { useOrganizationContext } from "@/app/organizations/OrganizationProvider";
import { appPaths } from "@/app/routes/paths";
import {
  createBatchFromSpreadsheet,
  type BatchApiError,
  type BatchIntakeStatus,
  validateBatchSpreadsheet,
} from "@/lib/api-client/batches";

type LocalState = "EMPTY" | "VALID" | "INVALID" | BatchIntakeStatus;

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeError(error: unknown): BatchApiError {
  if (typeof error === "object" && error && "code" in error && "message" in error) {
    return error as BatchApiError;
  }

  return { code: "INTAKE_FAILED", message: "Batch intake could not start. Replace the file or try again." };
}

export function CreateBatchIntake() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { activeWorkspace } = useOrganizationContext();
  const { userId } = useAuth();
  const [batchName, setBatchName] = useState("AW25 Home & Kitchen - Wave 4");
  const [marketplace] = useState("Amazon.eg");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<BatchApiError | null>(null);
  const [intakeState, setIntakeState] = useState<LocalState>("EMPTY");

  const createMutation = useMutation({
    mutationKey: ["batches", activeWorkspace?.id, "create"],
    mutationFn: async () => {
      if (!sourceFile) {
        throw { code: "INVALID_SOURCE_FILE", message: "Select a spreadsheet before starting intake." } satisfies BatchApiError;
      }

      setIntakeState("UPLOADING");
      await Promise.resolve();
      setIntakeState("INTAKE_QUEUED");

      return createBatchFromSpreadsheet({
        batchName,
        marketplace,
        organizationId: activeWorkspace?.id ?? "",
        createdBy: userId ?? "",
        sourceFile,
      });
    },
    onSuccess: async (batch) => {
      setIntakeState("INTAKE_PROCESSING");
      await new Promise((resolve) => window.setTimeout(resolve, 20));
      navigate(appPaths.batchMapping(batch.batchId), { replace: false });
    },
    onError: () => {
      setIntakeState("INTAKE_FAILED");
    },
  });

  const mutationError = createMutation.isError ? normalizeError(createMutation.error) : null;
  const currentError = validationError ?? mutationError;
  const canStart = Boolean(sourceFile) && !validationError && !createMutation.isPending;

  const statusText = useMemo(() => {
    if (currentError) {
      return currentError.message;
    }

    switch (intakeState) {
      case "EMPTY":
        return "Select a spreadsheet with image_id references to begin.";
      case "VALID":
        return "Spreadsheet structure is ready. Intake can start.";
      case "UPLOADING":
        return "Uploading source file and creating the batch record...";
      case "INTAKE_QUEUED":
        return "Upload accepted. Intake processing is queued.";
      case "INTAKE_PROCESSING":
        return "Upload accepted. Intake processing has started.";
      case "INTAKE_FAILED":
        return "Batch intake failed. Replace the file or retry.";
      case "DRAFT":
      case "INVALID":
      default:
        return "Review the source file before starting intake.";
    }
  }, [currentError, intakeState]);

  const onFileChange = (files: FileList | null) => {
    const file = files?.[0] ?? null;
    const error = validateBatchSpreadsheet(file);

    setSourceFile(file);
    setValidationError(error);
    createMutation.reset();
    setIntakeState(error ? "INVALID" : file ? "VALID" : "EMPTY");
  };

  const replaceFile = () => {
    setSourceFile(null);
    setValidationError(null);
    createMutation.reset();
    setIntakeState("EMPTY");

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  const startIntake = () => {
    if (!canStart) {
      return;
    }

    createMutation.mutate();
  };

  return (
    <div className="max-w-[1280px] px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Start a new batch</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Create a batch from a source spreadsheet that references image IDs issued by the in-app image service.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="panel p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="batch-name" className="label-mono">
                  Batch name
                </label>
                <input
                  id="batch-name"
                  value={batchName}
                  onChange={(event) => setBatchName(event.target.value)}
                  className="mt-1 h-9 w-full rounded-sm border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="label-mono">Marketplace</label>
                <div className="mt-1 flex h-9 items-center justify-between rounded-sm border border-border bg-muted/40 px-3 text-sm">
                  <span>{marketplace}</span>
                  <span className="text-[11px] text-muted-foreground">workspace default</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-needs-input" />
              <span>
                Required spreadsheet columns: SKU, product name, brand, and <strong className="text-foreground">image_id</strong>.
                External image URLs and filename-only image matching are not accepted for this flow.
              </span>
            </div>
          </section>

          <section className="panel p-5">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <FileSpreadsheet className="h-4 w-4 text-primary" /> Source spreadsheet
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  CSV or XLSX. Rows must reference image IDs created under the active workspace.
                </p>
              </div>
            </header>

            <label
              htmlFor="batch-source-file"
              className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border-strong bg-muted/30 p-6 text-center transition hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="mt-2 text-sm font-medium">Select spreadsheet</span>
              <span className="text-xs text-muted-foreground">CSV or XLSX, max 25MB</span>
              <input
                ref={inputRef}
                id="batch-source-file"
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={(event) => onFileChange(event.target.files)}
              />
            </label>

            {sourceFile ? (
              <div className="mt-3 rounded-sm border border-border bg-card p-3 text-sm">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{sourceFile.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {formatBytes(sourceFile.size)} | persisted as source-file metadata after intake starts
                    </div>
                  </div>
                  {validationError ? (
                    <span className="text-xs font-medium text-status-blocked">Needs replacement</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-status-ready">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Structure ready
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={startIntake}
                disabled={!canStart}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
              >
                <ArrowRight className="h-4 w-4" />
                Start intake
              </button>
              <button
                type="button"
                onClick={replaceFile}
                disabled={!sourceFile && !currentError}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Replace file
              </button>
              {mutationError ? (
                <button
                  type="button"
                  onClick={startIntake}
                  disabled={!canStart}
                  className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry intake
                </button>
              ) : null}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="h-4 w-4 text-primary" /> Image ID requirement
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Product images must be uploaded before batch creation. Reference returned image IDs in the spreadsheet instead of image URLs or filenames.
            </p>
            <Link to={appPaths.imageAssets} className="mt-3 inline-block text-xs text-primary hover:underline">
              Upload image assets
            </Link>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="panel p-4">
            <h3 className="text-sm font-semibold">Intake status</h3>
            <div className="mt-3 flex items-start gap-2" role="status" aria-live="polite">
              {currentError ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-blocked" />
              ) : intakeState === "INTAKE_PROCESSING" || intakeState === "INTAKE_QUEUED" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ready" />
              ) : (
                <Upload className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="text-sm">{statusText}</span>
            </div>
            {currentError ? (
              <div className="mt-3 rounded-sm border border-status-blocked-border bg-status-blocked-bg px-3 py-2 text-sm text-status-blocked" role="alert">
                {currentError.message}
              </div>
            ) : null}
          </section>

          <section className="panel p-4">
            <h3 className="text-sm font-semibold">What happens next</h3>
            <ol className="mt-3 space-y-3 text-sm">
              {[
                "Persist source-file metadata to the batch record",
                "Queue intake processing under the active workspace",
                "Detect source columns and preserve row identity",
                "Open mapping once intake is accepted",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border bg-secondary text-[11px] font-medium tabular-nums">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
