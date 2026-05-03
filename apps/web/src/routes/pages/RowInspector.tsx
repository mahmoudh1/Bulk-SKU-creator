import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { appPaths } from "@/app/routes/paths";
import { useOrganizationContext } from "@/app/organizations/OrganizationProvider";
import { StatusChip } from "@/components/StatusChip";
import { getBatchRowDetail } from "@/lib/api-client/batches";
import { ArrowLeft, AlertTriangle, ExternalLink, FileSearch, ImageIcon, Sparkles, XCircle, Clock } from "lucide-react";

export default function RowInspector() {
  const { id = "", rowId = "" } = useParams();
  const { activeWorkspace } = useOrganizationContext();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const rowQuery = useQuery({
    queryKey: ["batchRowDetail", id, rowId, activeWorkspace?.id],
    queryFn: () => getBatchRowDetail({ batchId: id, rowId, organizationId: activeWorkspace?.id ?? "" }),
    enabled: Boolean(id && rowId && activeWorkspace?.id),
  });

  const backTarget = from ?? `${appPaths.batchReview(id)}${location.search}`;

  if (!id || !rowId) {
    return (
      <div className="p-6">
        <div className="rounded-sm border border-status-blocked-border bg-status-blocked-bg p-4 text-sm text-status-blocked" role="alert">
          Select a batch row before opening the inspector.
        </div>
      </div>
    );
  }

  if (rowQuery.isLoading) {
    return (
      <div className="grid min-h-[320px] place-items-center p-6">
        <div className="text-sm text-muted-foreground" role="status">
          Loading row detail...
        </div>
      </div>
    );
  }

  if (rowQuery.isError || !rowQuery.data) {
    const message =
      typeof rowQuery.error === "object" && rowQuery.error && "message" in rowQuery.error
        ? String(rowQuery.error.message)
        : "Row detail could not load. Run readiness evaluation or try again.";

    return (
      <div className="p-6">
        <div className="rounded-sm border border-status-blocked-border bg-status-blocked-bg p-4 text-sm text-status-blocked" role="alert">
          {message}
        </div>
        <div className="mt-4">
          <Link to={backTarget} className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-sm hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Back to triage
          </Link>
        </div>
      </div>
    );
  }

  const detail = rowQuery.data;
  const blockers = detail.issues.filter((issue) => issue.severity === "BLOCKER");
  const warnings = detail.issues.filter((issue) => issue.severity === "WARNING");
  const primaryIssue = blockers[0] ?? warnings[0] ?? null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] min-h-[calc(100vh-3rem)]">
      <div className="min-w-0">
        <div className="px-6 pt-5 pb-4 border-b border-border bg-card/40">
          <div className="flex items-center justify-between gap-3 mb-2">
            <Link to={backTarget} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to triage
            </Link>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="label-mono normal-case">{detail.rowId} · {detail.sku}</div>
              <h1 className="text-xl font-semibold mt-1">{detail.productName}</h1>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <StatusChip status={detail.readinessState} />
                <span className="text-muted-foreground">{detail.brand} · rev {detail.rowRevision} · updated {detail.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-w-[1100px]">
          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-muted-foreground" />
                Source facts & normalized fields
              </h2>
              <span className="text-xs text-muted-foreground">Source row {detail.sourceRowNumber} · attempt {detail.intakeAttempt}</span>
            </header>
            <div className="grid sm:grid-cols-2 divide-x divide-border">
              <dl className="p-4 space-y-2 text-sm">
                <div className="label-mono">Source identity</div>
                {[
                  ["Row ID", detail.rowId],
                  ["Source row key", detail.sourceRowKey],
                  ["SKU", detail.sku],
                  ["Brand", detail.brand],
                  ["Image IDs", detail.originalImageIds.length > 0 ? detail.originalImageIds.join(", ") : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-1 border-b border-border/60 last:border-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="p-4 text-sm">
                <div className="label-mono mb-2">Normalized fields</div>
                {detail.normalizedFields.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No normalized fields are available for this row revision.</div>
                ) : (
                  <dl className="space-y-2">
                    {detail.normalizedFields.map((field) => (
                      <div key={field.field} className="flex justify-between gap-3 py-1 border-b border-border/60 last:border-0">
                        <dt className="text-muted-foreground">{field.label}</dt>
                        <dd className="text-right">
                          <div className="font-medium text-foreground">{field.normalizedValue}</div>
                          <div className="text-[11px] text-muted-foreground">raw {field.rawValue}</div>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </section>

          <section className="panel">
            <header className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Validation</h2>
            </header>
            {detail.issues.length === 0 ? (
              <div className="p-4 text-sm text-status-ready">No blockers or warnings detected for this row revision.</div>
            ) : (
              <ul className="divide-y divide-border">
                {detail.issues.map((issue) => (
                  <li key={`${issue.code}-${issue.reason}`} className="flex items-start gap-3 px-4 py-3 text-sm">
                    {issue.severity === "BLOCKER" ? (
                      <XCircle className="h-4 w-4 mt-0.5 text-status-blocked shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-status-needs-input shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium">{issue.code}</div>
                      <div className="text-xs text-muted-foreground">{issue.reason}</div>
                      {issue.nextActionHref ? (
                        <Link
                          to={issue.nextActionHref}
                          className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-sm border border-status-needs-input-border bg-card px-2 text-xs font-medium text-status-needs-input hover:bg-muted"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {issue.nextActionLabel}
                        </Link>
                      ) : (
                        <div className="mt-2 text-xs text-muted-foreground">{issue.nextActionLabel}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-status-augmented" />
                AI augmentation
              </h2>
              <span className="text-xs text-muted-foreground">Unavailable</span>
            </header>
            <div className="p-4 text-sm text-muted-foreground">
              AI enrichment and acceptance flows begin in Epic 4. This inspector will surface AI artifacts once they are persisted by the backend.
            </div>
          </section>

          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Image evidence
              </h2>
              <Link to={appPaths.batchImages(id)} className="text-xs text-primary hover:underline">
                Open image plan →
              </Link>
            </header>
            <div className="p-4">
              {detail.imageEvidence.length === 0 ? (
                <div className="text-sm text-muted-foreground">No image evidence is attached to this row revision.</div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {detail.imageEvidence.map((asset) => (
                    <figure key={asset.imageId} className="w-40 rounded-sm border border-border bg-card p-2">
                      <img
                        src={asset.previewRef}
                        alt={`${detail.sku} preview for ${asset.imageId}`}
                        className="h-32 w-full rounded-sm border border-border bg-muted object-cover"
                      />
                      <figcaption className="mt-2 text-xs">
                        <div className="font-mono text-foreground">{asset.imageId}</div>
                        <div className="mt-1 text-muted-foreground">{asset.previewRef}</div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Lifecycle history
              </h2>
            </header>
            <ol className="p-4 space-y-3 text-sm">
              {detail.lifecycleHistory.length === 0 ? (
                <li className="text-muted-foreground">No lifecycle history is available yet.</li>
              ) : (
                detail.lifecycleHistory.map((entry) => (
                  <li key={`${entry.timestamp}-${entry.lifecycleStage}`} className="grid grid-cols-[180px_1fr] gap-3">
                    <span className="label-mono normal-case text-muted-foreground tabular-nums">{entry.timestamp}</span>
                    <span>{entry.summary}</span>
                  </li>
                ))
              )}
            </ol>
          </section>
        </div>
      </div>

      <aside className="border-l border-border bg-card/40 p-4 space-y-4 sticky top-12 self-start max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div>
          <div className="label-mono">Next action</div>
          {primaryIssue?.nextActionHref ? (
            <Link
              to={primaryIssue.nextActionHref}
              className="mt-2 w-full h-9 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center justify-center gap-1.5"
            >
              {primaryIssue.nextActionLabel} <ExternalLink className="h-4 w-4" />
            </Link>
          ) : (
            <div className="mt-2 rounded-sm border border-border bg-card p-3 text-sm text-muted-foreground">
              {primaryIssue?.nextActionLabel ?? "No actions required."}
            </div>
          )}
        </div>
        <div className="border-t border-border pt-4 space-y-2">
          <button type="button" disabled className="w-full h-8 rounded-sm border border-border text-sm text-muted-foreground">
            Defer to next batch
          </button>
          <button type="button" disabled className="w-full h-8 rounded-sm border border-status-blocked-border text-status-blocked bg-status-blocked-bg text-sm opacity-60">
            Exclude row
          </button>
        </div>

        <div className="border-t border-border pt-4">
          <div className="label-mono mb-2">Reason chain</div>
          {primaryIssue ? (
            <ol className="text-xs space-y-1.5 text-muted-foreground">
              <li><span className="text-foreground">Issue:</span> {primaryIssue.code}</li>
              <li><span className="text-foreground">Reason:</span> {primaryIssue.reason}</li>
            </ol>
          ) : (
            <div className="text-xs text-muted-foreground">No reasoning required.</div>
          )}
        </div>

        <div className="border-t border-border pt-4 text-[11px] text-muted-foreground">
          This inspector shows persisted source, readiness, and lifecycle data. Edits and revalidation mutations arrive in later stories.
        </div>
      </aside>
    </div>
  );
}
