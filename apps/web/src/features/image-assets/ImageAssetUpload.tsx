import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Clipboard, ImagePlus, RefreshCw, Trash2, Upload, XCircle } from "lucide-react";

import { useOrganizationContext } from "@/app/organizations/OrganizationProvider";
import {
  createImageAsset,
  type ImageAssetApiError,
  type ImageAssetDto,
  validateImageFile,
} from "@/lib/api-client/image-assets";

type UploadPhase = "empty" | "valid" | "invalid" | "uploading" | "uploaded" | "failed";

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeError(error: unknown): ImageAssetApiError {
  if (typeof error === "object" && error && "message" in error && "code" in error) {
    return error as ImageAssetApiError;
  }

  return { code: "UPLOAD_FAILED", message: "Image service could not store the asset. Try again." };
}

export function ImageAssetUpload() {
  const { activeWorkspace } = useOrganizationContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<ImageAssetApiError | null>(null);
  const [uploadedAsset, setUploadedAsset] = useState<ImageAssetDto | null>(null);

  const uploadMutation = useMutation({
    mutationKey: ["imageAssets", activeWorkspace?.id, "create"],
    mutationFn: (file: File) => createImageAsset({ file, organizationId: activeWorkspace?.id ?? "" }),
    onSuccess: (asset) => {
      setUploadedAsset(asset);
    },
  });

  const phase = useMemo<UploadPhase>(() => {
    if (uploadMutation.isPending) {
      return "uploading";
    }

    if (uploadedAsset) {
      return "uploaded";
    }

    if (uploadMutation.isError) {
      return "failed";
    }

    if (validationError) {
      return "invalid";
    }

    if (selectedFile) {
      return "valid";
    }

    return "empty";
  }, [selectedFile, uploadMutation.isError, uploadMutation.isPending, uploadedAsset, validationError]);

  const uploadError = uploadMutation.isError ? normalizeError(uploadMutation.error) : null;
  const currentError = validationError ?? uploadError;

  const statusText = {
    empty: "Choose one supported product image to begin.",
    valid: "Validation passed. Ready to upload through the image service.",
    invalid: currentError?.message ?? "The selected file cannot be uploaded.",
    uploading: "Uploading image through the platform image service...",
    uploaded: "Upload complete. Stable image ID issued.",
    failed: currentError?.message ?? "Image service could not store the asset. Try again.",
  }[phase];

  const onFileChange = (files: FileList | null) => {
    const file = files?.[0] ?? null;

    setSelectedFile(file);
    setUploadedAsset(null);
    uploadMutation.reset();
    setValidationError(validateImageFile(file));
  };

  const upload = () => {
    if (!selectedFile || validationError) {
      return;
    }

    setUploadedAsset(null);
    uploadMutation.mutate(selectedFile);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadedAsset(null);
    setValidationError(null);
    uploadMutation.reset();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const copyImageId = async () => {
    if (!uploadedAsset) {
      return;
    }

    await navigator.clipboard?.writeText(uploadedAsset.image_id);
  };

  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Image assets</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Upload one product image at a time and use the returned internal ID in source spreadsheets.
            </p>
          </div>
          <div className="rounded-sm border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Workspace: <span className="font-medium text-foreground">{activeWorkspace?.name ?? "Unassigned"}</span>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div>
            <label
              htmlFor="image-asset-file"
              className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border-strong bg-muted/30 p-6 text-center transition hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring"
            >
              <ImagePlus className="h-7 w-7 text-muted-foreground" />
              <span className="mt-3 text-sm font-medium text-foreground">Select product image</span>
              <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP. One file per upload.</span>
              <input
                ref={inputRef}
                id="image-asset-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => onFileChange(event.target.files)}
              />
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={upload}
                disabled={!selectedFile || Boolean(validationError) || uploadMutation.isPending || Boolean(uploadedAsset)}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Upload image
              </button>
              {uploadMutation.isError ? (
                <button
                  type="button"
                  onClick={upload}
                  disabled={!selectedFile || Boolean(validationError) || uploadMutation.isPending}
                  className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry upload
                </button>
              ) : null}
              <button
                type="button"
                onClick={clearSelection}
                disabled={!selectedFile && !uploadedAsset && !currentError}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>

          <aside className="rounded-sm border border-border bg-card p-4">
            <div className="label-mono">Upload state</div>
            <div className="mt-3 flex items-start gap-2" role="status" aria-live="polite">
              {phase === "uploaded" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ready" />
              ) : phase === "invalid" || phase === "failed" ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-blocked" />
              ) : (
                <Upload className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground">{statusText}</span>
            </div>

            {currentError ? (
              <div className="mt-3 rounded-sm border border-status-blocked-border bg-status-blocked-bg px-3 py-2 text-sm text-status-blocked" role="alert">
                {currentError.message}
              </div>
            ) : null}

            {selectedFile ? (
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Filename</dt>
                  <dd className="truncate font-medium text-foreground">{selectedFile.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="tabular-nums">{formatBytes(selectedFile.size)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Media type</dt>
                  <dd>{selectedFile.type || "Unknown"}</dd>
                </div>
              </dl>
            ) : null}

            {uploadedAsset ? (
              <div className="mt-4 rounded-sm border border-status-ready-border bg-status-ready-bg p-3">
                <div className="label-mono text-status-ready">image_id</div>
                <div className="mt-1 break-all font-mono text-sm text-foreground">{uploadedAsset.image_id}</div>
                <button
                  type="button"
                  onClick={copyImageId}
                  className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-sm border border-status-ready-border bg-card px-2.5 text-xs font-medium hover:bg-muted"
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  Copy image ID
                </button>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
}
