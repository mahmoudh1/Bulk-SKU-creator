import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

import { appPaths } from "@/app/routes/paths";
import { useOrganizationContext } from "@/app/organizations/OrganizationProvider";
import { StatusChip, SubmissionChip } from "@/components/StatusChip";
import { Search, Filter, Send, Sparkles, AlertOctagon, ExternalLink, X, ChevronRight, RotateCw } from "lucide-react";
import { getBatchReadiness, getBatchReviewContext, saveBatchReviewContext, type BatchReadinessRowDto, type ReadinessState } from "@/lib/api-client/batches";

const toneCls: Record<string, string> = {
  ready: "border-status-ready-border text-status-ready",
  augmented: "border-status-augmented-border text-status-augmented",
  "needs-input": "border-status-needs-input-border text-status-needs-input",
  blocked: "border-status-blocked-border text-status-blocked",
};

const readinessPriority: Record<ReadinessState, number> = {
  BLOCKED_FOR_REVIEW: 0,
  NOT_ENOUGH_DATA: 1,
  NEEDS_INPUT: 2,
  READY_WITH_AUGMENTATION: 3,
  READY: 4,
};

function formatUpdatedAt(value: string) {
  const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return isoMatch ? isoMatch[2] : value;
}

function rowMatchesSearch(row: BatchReadinessRowDto, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    row.rowId.toLowerCase().includes(normalized) ||
    row.sku.toLowerCase().includes(normalized) ||
    row.productName.toLowerCase().includes(normalized) ||
    row.brand.toLowerCase().includes(normalized)
  );
}

function issuePreview(row: BatchReadinessRowDto) {
  const [first] = row.issueSummaries;
  return first?.message ?? null;
}

export default function TriageWorkspace() {
  const { id } = useParams();
  const { activeWorkspace } = useOrganizationContext();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userId } = useAuth();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [readinessFilter, setReadinessFilter] = useState<ReadinessState | "ALL">(
    (searchParams.get("readiness") as ReadinessState | "ALL" | null) ?? "ALL",
  );
  const [onlyIssues, setOnlyIssues] = useState(searchParams.get("issues") === "1");
  const [sort, setSort] = useState<"priority" | "updated">((searchParams.get("sort") as "priority" | "updated" | null) ?? "priority");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(searchParams.get("row"));

  const updateSearchParams = (next: Record<string, string | null>) => {
    const updated = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(next)) {
      if (!value) {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    }

    setSearchParams(updated, { replace: true });
  };

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    const readinessParam = searchParams.get("readiness");
    const isKnownReadiness =
      readinessParam === "READY" ||
      readinessParam === "READY_WITH_AUGMENTATION" ||
      readinessParam === "NEEDS_INPUT" ||
      readinessParam === "NOT_ENOUGH_DATA" ||
      readinessParam === "BLOCKED_FOR_REVIEW" ||
      readinessParam === "ALL" ||
      readinessParam === null;
    setReadinessFilter(isKnownReadiness ? ((readinessParam as ReadinessState | "ALL" | null) ?? "ALL") : "ALL");
    setOnlyIssues(searchParams.get("issues") === "1");
    const sortParam = searchParams.get("sort");
    setSort(sortParam === "updated" ? "updated" : "priority");
    setSelectedRowId(searchParams.get("row"));
  }, [searchParams]);

  const readinessQuery = useQuery({
    queryKey: ["batchReadiness", id, activeWorkspace?.id],
    queryFn: () => getBatchReadiness({ batchId: id ?? "", organizationId: activeWorkspace?.id ?? "" }),
    enabled: Boolean(id && activeWorkspace?.id),
  });

  const evaluation = readinessQuery.data;
  const rows = useMemo(() => evaluation?.rows ?? [], [evaluation]);
  const summary = useMemo(
    () => evaluation?.summary ?? { totalRows: 0, ready: 0, readyAugmented: 0, needsInput: 0, blocked: 0, notEnoughData: 0 },
    [evaluation],
  );
  const batchId = id ?? "";
  const returnContext = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!batchId || !activeWorkspace?.id || !userId) {
      return;
    }

    if (location.search) {
      return;
    }

    let cancelled = false;

    getBatchReviewContext({ batchId, organizationId: activeWorkspace.id, userId })
      .then((stored) => {
        if (cancelled || !stored?.context) {
          return;
        }

        const nextEntries = Object.entries(stored.context).filter(([key, value]) => key !== "lv" && value);
        if (nextEntries.length === 0) {
          return;
        }

        setSearchParams(new URLSearchParams(nextEntries), { replace: true });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace?.id, batchId, location.search, setSearchParams, userId]);

  useEffect(() => {
    if (!batchId || !activeWorkspace?.id || !userId) {
      return;
    }

    const handle = window.setTimeout(() => {
      const context: Record<string, string> = {
        ...(search ? { q: search } : {}),
        ...(readinessFilter !== "ALL" ? { readiness: readinessFilter } : {}),
        ...(onlyIssues ? { issues: "1" } : {}),
        ...(sort !== "priority" ? { sort } : {}),
        ...(selectedRowId ? { row: selectedRowId } : {}),
        lv: new Date().toISOString(),
      };

      saveBatchReviewContext({ batchId, organizationId: activeWorkspace.id, userId, context }).catch(() => undefined);
    }, 250);

    return () => {
      window.clearTimeout(handle);
    };
  }, [activeWorkspace?.id, batchId, onlyIssues, readinessFilter, search, selectedRowId, sort, userId]);

  const filteredRows = useMemo(() => {
    const base = rows.filter((row) => rowMatchesSearch(row, search));
    const readinessFiltered = readinessFilter === "ALL" ? base : base.filter((row) => row.readinessState === readinessFilter);
    const issueFiltered = onlyIssues ? readinessFiltered.filter((row) => row.issueSummaries.length > 0 || row.readinessState !== "READY") : readinessFiltered;

    if (sort === "updated") {
      return [...issueFiltered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    return [...issueFiltered].sort((a, b) => {
      const priority = readinessPriority[a.readinessState] - readinessPriority[b.readinessState];

      if (priority !== 0) {
        return priority;
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [onlyIssues, readinessFilter, rows, search, sort]);

  const selected = useMemo(() => {
    const match = selectedRowId ? rows.find((row) => row.rowId === selectedRowId) : null;
    return match ?? filteredRows[0] ?? null;
  }, [filteredRows, rows, selectedRowId]);

  const selectedHidden = useMemo(() => {
    if (!selectedRowId) {
      return false;
    }

    return !filteredRows.some((row) => row.rowId === selectedRowId);
  }, [filteredRows, selectedRowId]);

  const readyForSubmission = summary.blocked + summary.needsInput + summary.notEnoughData === 0;

  const filterChips = useMemo(
    () => [
      { label: "All rows", value: "ALL" as const, count: summary.totalRows },
      { label: "Ready", value: "READY" as const, count: summary.ready, tone: "ready" as const },
      { label: "Ready · augmented", value: "READY_WITH_AUGMENTATION" as const, count: summary.readyAugmented, tone: "augmented" as const },
      { label: "Needs input", value: "NEEDS_INPUT" as const, count: summary.needsInput, tone: "needs-input" as const },
      { label: "Blocked", value: "BLOCKED_FOR_REVIEW" as const, count: summary.blocked, tone: "blocked" as const },
      { label: "Not enough data", value: "NOT_ENOUGH_DATA" as const, count: summary.notEnoughData, tone: "blocked" as const },
    ],
    [summary],
  );

  if (!batchId) {
    return (
      <div className="p-6">
        <div className="rounded-sm border border-status-blocked-border bg-status-blocked-bg p-4 text-sm text-status-blocked" role="alert">
          Select a batch before opening triage.
        </div>
      </div>
    );
  }

  if (readinessQuery.isLoading) {
    return (
      <div className="grid min-h-[320px] place-items-center p-6">
        <div className="text-sm text-muted-foreground" role="status">
          Loading batch readiness...
        </div>
      </div>
    );
  }

  if (readinessQuery.isError || !evaluation || !selected) {
    const message =
      typeof readinessQuery.error === "object" && readinessQuery.error && "message" in readinessQuery.error
        ? String(readinessQuery.error.message)
        : "Batch readiness could not load. Run readiness evaluation or try again.";

    return (
      <div className="p-6">
        <div className="rounded-sm border border-status-blocked-border bg-status-blocked-bg p-4 text-sm text-status-blocked" role="alert">
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
        <div className="px-6 pt-5 pb-4 border-b border-border bg-card/40">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground label-mono">
                <span>{batchId}</span>
                <span>·</span>
                <span>{activeWorkspace?.name ?? "Workspace"}</span>
              </div>
              <h1 className="mt-1 text-xl font-semibold truncate">Batch triage</h1>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <SubmissionChip state="DRAFT" />
                <span className="text-muted-foreground">Last updated {formatUpdatedAt(evaluation.updatedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={appPaths.batchAiReview(batchId)}
                className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center gap-1.5"
              >
                <Sparkles className="h-4 w-4 text-status-augmented" /> AI review
              </Link>
              <button type="button" className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center gap-1.5" disabled>
                <RotateCw className="h-4 w-4" /> Re-validate
              </button>
              <Link
                to={appPaths.batchSubmit(batchId)}
                aria-disabled={readyForSubmission ? undefined : "true"}
                tabIndex={readyForSubmission ? undefined : -1}
                className={`h-9 px-3 rounded-sm text-sm font-medium inline-flex items-center gap-1.5 ${
                  readyForSubmission ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "cursor-not-allowed border border-border bg-muted text-muted-foreground"
                }`}
              >
                <Send className="h-4 w-4" /> Prepare submission
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { l: "Ready", v: summary.ready, c: "bg-status-ready" },
              { l: "Ready · augmented", v: summary.readyAugmented, c: "bg-status-augmented" },
              { l: "Needs input", v: summary.needsInput, c: "bg-status-needs-input" },
              { l: "Blocked", v: summary.blocked, c: "bg-status-blocked" },
              { l: "Not enough data", v: summary.notEnoughData, c: "bg-status-blocked/70" },
              { l: "Submitted", v: 0, c: "bg-status-submitted" },
            ].map((s) => (
              <div key={s.l} className="panel px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-sm ${s.c}`} />
                  <span className="text-[11px] text-muted-foreground">{s.l}</span>
                </div>
                <div className="mt-0.5 text-lg font-semibold tabular-nums">{s.v}</div>
              </div>
            ))}
          </div>

          {summary.blocked + summary.needsInput + summary.notEnoughData > 0 ? (
            <div className="mt-3 flex items-start gap-3 rounded-sm border border-status-needs-input-border bg-status-needs-input-bg/60 px-3 py-2.5 text-sm">
              <AlertOctagon className="h-4 w-4 mt-0.5 text-status-needs-input shrink-0" />
              <div className="flex-1">
                <span className="font-medium text-foreground">Fix these first:</span>
                <span className="text-foreground/80"> {summary.blocked} blocked rows, then {summary.needsInput} needs input.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOnlyIssues(true);
                  updateSearchParams({ issues: "1" });
                }}
                className="text-xs text-primary hover:underline shrink-0"
              >
                Show only blockers
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_420px] min-h-0">
          <div className="flex flex-col min-w-0 border-r border-border">
            <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-card/40">
              <div className="flex items-center gap-2 px-2 h-8 rounded-sm border border-border bg-background w-72">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => {
                    const next = event.target.value;
                    setSearch(next);
                    updateSearchParams({ q: next || null });
                  }}
                  className="flex-1 bg-transparent text-sm outline-none"
                  placeholder="Row ID, SKU, product name…"
                />
              </div>
              <button className="h-8 px-2.5 rounded-sm border border-border bg-background text-xs hover:bg-muted inline-flex items-center gap-1.5">
                <Filter className="h-3 w-3" /> Add filter
              </button>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Sort
                  <select
                    value={sort}
                    onChange={(event) => {
                      const next = event.target.value as "priority" | "updated";
                      setSort(next);
                      updateSearchParams({ sort: next === "priority" ? null : next });
                    }}
                    className="h-8 rounded-sm border border-border bg-background px-2 text-xs text-foreground"
                  >
                    <option value="priority">Priority</option>
                    <option value="updated">Updated</option>
                  </select>
                </label>
                {onlyIssues ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOnlyIssues(false);
                      updateSearchParams({ issues: null });
                    }}
                    className="h-8 px-2.5 rounded-sm border border-border bg-background text-xs hover:bg-muted inline-flex items-center gap-1.5"
                  >
                    <X className="h-3 w-3" />
                    Clear blockers
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5 ml-1 overflow-x-auto">
                {filterChips.map((f) => {
                  const active = readinessFilter === f.value;

                  return (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => {
                        setReadinessFilter(f.value);
                        updateSearchParams({ readiness: f.value === "ALL" ? null : f.value });
                      }}
                      className={`h-7 px-2.5 rounded-sm text-xs whitespace-nowrap border inline-flex items-center gap-1.5 ${
                        active ? "bg-primary text-primary-foreground border-primary" : f.tone ? `bg-card hover:bg-muted ${toneCls[f.tone]}` : "bg-card border-border hover:bg-muted"
                      }`}
                    >
                    <span>{f.label}</span>
                    <span className="tabular-nums opacity-80">{f.count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                Showing {filteredRows.length} of {summary.totalRows}
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {selectedHidden ? (
                <div className="px-4 py-2 border-b border-border bg-status-needs-input-bg/30 text-xs text-muted-foreground flex items-center justify-between gap-3">
                  <span>Selected row is hidden by current filters.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRowId(null);
                      updateSearchParams({ row: null });
                    }}
                    className="text-primary hover:underline"
                  >
                    Clear selection
                  </button>
                </div>
              ) : null}
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-b border-border z-10">
                  <tr className="text-left label-mono">
                    <th className="px-3 py-2 font-normal w-8"><input type="checkbox" className="accent-primary" /></th>
                    <th className="px-2 py-2 font-normal">Row</th>
                    <th className="px-2 py-2 font-normal">Product</th>
                    <th className="px-2 py-2 font-normal">Status</th>
                    <th className="px-2 py-2 font-normal">Blocker / next action</th>
                    <th className="px-2 py-2 font-normal">AI</th>
                    <th className="px-2 py-2 font-normal">Type</th>
                    <th className="px-2 py-2 font-normal text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRows.map((r) => {
                    const isSel = selected.rowId === r.rowId;
                    const blockerText = issuePreview(r);
                    return (
                      <tr key={r.rowId}
                          onClick={() => {
                            setSelectedRowId(r.rowId);
                            updateSearchParams({ row: r.rowId });
                          }}
                          className={`cursor-pointer ${isSel ? "bg-status-submitted-bg/60" : "hover:bg-muted/40"}`}>
                        <td className="px-3 py-2.5"><input type="checkbox" className="accent-primary" onClick={(e) => e.stopPropagation()} /></td>
                        <td className="px-2 py-2.5">
                          <div className="label-mono normal-case text-foreground">{r.rowId}</div>
                          <div className="text-[11px] text-muted-foreground">{r.sku}</div>
                        </td>
                        <td className="px-2 py-2.5 max-w-[280px]">
                          <div className="font-medium truncate">{r.productName}</div>
                          <div className="text-[11px] text-muted-foreground">{r.brand} · {r.imageEvidence.length} images</div>
                        </td>
                        <td className="px-2 py-2.5"><StatusChip status={r.readinessState} /></td>
                        <td className="px-2 py-2.5 text-xs text-muted-foreground max-w-[280px] truncate">
                          {blockerText ? blockerText : <span className="text-status-ready">All checks passed</span>}
                        </td>
                        <td className="px-2 py-2.5">
                          <span className="text-[11px] text-muted-foreground">—</span>
                        </td>
                        <td className="px-2 py-2.5">
                          <div className="text-xs text-muted-foreground">—</div>
                        </td>
                        <td className="px-2 py-2.5 text-right text-xs text-muted-foreground tabular-nums">{formatUpdatedAt(r.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border bg-muted/40 text-sm">
              <span className="text-muted-foreground">Select rows for bulk action</span>
              <div className="flex items-center gap-2">
                <button type="button" className="h-8 px-2.5 rounded-sm border border-border bg-card text-xs hover:bg-muted" disabled>Re-validate</button>
                <button type="button" className="h-8 px-2.5 rounded-sm border border-border bg-card text-xs hover:bg-muted" disabled>Accept AI drafts</button>
                <button type="button" className="h-8 px-2.5 rounded-sm border border-border bg-card text-xs hover:bg-muted" disabled>Defer</button>
                <button type="button" className="h-8 px-2.5 rounded-sm border border-status-blocked-border text-status-blocked bg-status-blocked-bg text-xs hover:opacity-90" disabled>Exclude</button>
              </div>
            </div>
          </div>

          <aside className="bg-card overflow-y-auto">
            <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
              <div className="min-w-0">
                <div className="label-mono normal-case">{selected.rowId} · {selected.sku}</div>
                <div className="font-medium truncate">{selected.productName}</div>
                <div className="mt-1.5"><StatusChip status={selected.readinessState} /></div>
              </div>
              <Link
                to={appPaths.batchRow(batchId, selected.rowId)}
                state={{ from: returnContext }}
                className="text-xs h-8 px-2.5 rounded-sm border border-border hover:bg-muted inline-flex items-center gap-1 shrink-0"
              >
                Open <ExternalLink className="h-3 w-3" />
              </Link>
            </header>

            <div className="p-4 space-y-4">
              <section>
                <h3 className="label-mono mb-2">Blocker / next action</h3>
                <div className="rounded-sm border border-status-needs-input-border bg-status-needs-input-bg/50 p-3 text-sm">
                  <div className="font-medium text-foreground">{issuePreview(selected) ?? "All validation checks passed."}</div>
                  {selected.issueSummaries.length > 1 ? (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {selected.issueSummaries.slice(1, 3).map((issue) => (
                        <div key={`${issue.code}-${issue.message}`}>{issue.message}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>

              <section>
                <h3 className="label-mono mb-2">Source facts</h3>
                <dl className="text-sm divide-y divide-border border border-border rounded-sm">
                  {[
                    ["Brand", selected.brand],
                    ["SKU", selected.sku],
                    ["Images", `${selected.imageEvidence.length} matched`],
                    ["Updated", formatUpdatedAt(selected.updatedAt)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 px-3 py-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h3 className="label-mono mb-2">Evidence trail</h3>
                <ol className="text-xs space-y-2">
                  {selected.imageEvidence.slice(0, 4).map((item) => (
                    <li key={item.imageId} className="flex gap-3">
                      <span className="label-mono normal-case text-muted-foreground tabular-nums w-12 shrink-0">img</span>
                      <span className="text-foreground">{item.imageId}</span>
                    </li>
                  ))}
                  {selected.imageEvidence.length === 0 ? <li className="text-muted-foreground">No image evidence attached.</li> : null}
                </ol>
              </section>

              <Link
                to={appPaths.batchRow(batchId, selected.rowId)}
                state={{ from: returnContext }}
                className="flex items-center justify-between text-sm text-primary hover:underline"
              >
                <span>Open full row inspector</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
  );
}
