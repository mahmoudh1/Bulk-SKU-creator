import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import { appPaths } from "@/app/routes/paths";
import { StatusChip, SubmissionChip } from "@/components/StatusChip";
import { rows, batches } from "@/data/mock";
import { prototypeBatchId, prototypeRowId } from "@/lib/mocks/route-defaults";
import { ArrowRight, Search, Filter, Send, Sparkles, AlertOctagon, ExternalLink, X, ChevronRight, RotateCw } from "lucide-react";

const filterChips = [
  { label: "All rows", count: 248, active: true },
  { label: "Ready", count: 162, tone: "ready" },
  { label: "Ready · augmented", count: 31, tone: "augmented" },
  { label: "Needs input", count: 28, tone: "needs-input" },
  { label: "Blocked", count: 19, tone: "blocked" },
  { label: "Not enough data", count: 8, tone: "blocked" },
];

const toneCls: Record<string, string> = {
  ready: "border-status-ready-border text-status-ready",
  augmented: "border-status-augmented-border text-status-augmented",
  "needs-input": "border-status-needs-input-border text-status-needs-input",
  blocked: "border-status-blocked-border text-status-blocked",
};

export default function TriageWorkspace() {
  const { id = prototypeBatchId } = useParams();
  const batch = batches.find((b) => b.id === id) ?? batches[0];
  const [selected, setSelected] = useState(rows.find((row) => row.id === prototypeRowId) ?? rows[0]);

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
        {/* Batch header */}
        <div className="px-6 pt-5 pb-4 border-b border-border bg-card/40">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground label-mono">
                <span>{batch.id}</span><span>·</span><span>{batch.marketplace}</span><span>·</span><span>Owner {batch.owner}</span>
              </div>
              <h1 className="mt-1 text-xl font-semibold truncate">{batch.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <SubmissionChip state={batch.submission} />
                <span className="text-muted-foreground">Last processed {batch.lastUpdated}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={appPaths.batchAiReview(batch.id)}
                className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center gap-1.5"
              >
                <Sparkles className="h-4 w-4 text-status-augmented" /> AI review (31)
              </Link>
              <button className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center gap-1.5">
                <RotateCw className="h-4 w-4" /> Re-validate
              </button>
              <Link
                to={appPaths.batchSubmit(batch.id)}
                className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" /> Prepare submission
              </Link>
            </div>
          </div>

          {/* Status summary bar */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { l: "Ready", v: 162, c: "bg-status-ready" },
              { l: "Ready · augmented", v: 31, c: "bg-status-augmented" },
              { l: "Needs input", v: 28, c: "bg-status-needs-input" },
              { l: "Blocked", v: 19, c: "bg-status-blocked" },
              { l: "Not enough data", v: 8, c: "bg-status-blocked/70" },
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

          {/* Guided priority banner */}
          <div className="mt-3 flex items-start gap-3 rounded-sm border border-status-needs-input-border bg-status-needs-input-bg/60 px-3 py-2.5 text-sm">
            <AlertOctagon className="h-4 w-4 mt-0.5 text-status-needs-input shrink-0" />
            <div className="flex-1">
              <span className="font-medium text-foreground">Fix these first:</span>
              <span className="text-foreground/80"> 19 GTIN/structure blockers, then 28 missing-unit confirmations. Estimated 25 minutes to clear before submission scope freeze.</span>
            </div>
            <button className="text-xs text-primary hover:underline shrink-0">Show only blockers</button>
          </div>
        </div>

        {/* Body: table + side panel */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_420px] min-h-0">
          {/* Triage table */}
          <div className="flex flex-col min-w-0 border-r border-border">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-card/40">
              <div className="flex items-center gap-2 px-2 h-8 rounded-sm border border-border bg-background w-72">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Row ID, SKU, product name…" />
              </div>
              <button className="h-8 px-2.5 rounded-sm border border-border bg-background text-xs hover:bg-muted inline-flex items-center gap-1.5">
                <Filter className="h-3 w-3" /> Add filter
              </button>
              <div className="flex items-center gap-1.5 ml-1 overflow-x-auto">
                {filterChips.map((f) => (
                  <button key={f.label}
                    className={`h-7 px-2.5 rounded-sm text-xs whitespace-nowrap border inline-flex items-center gap-1.5 ${
                      f.active ? "bg-primary text-primary-foreground border-primary" :
                      f.tone ? `bg-card hover:bg-muted ${toneCls[f.tone]}` : "bg-card border-border hover:bg-muted"
                    }`}>
                    <span>{f.label}</span>
                    <span className="tabular-nums opacity-80">{f.count}</span>
                  </button>
                ))}
              </div>
              <div className="ml-auto text-xs text-muted-foreground">Showing 14 of 248</div>
            </div>

            <div className="flex-1 overflow-auto">
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
                  {rows.map((r) => {
                    const isSel = selected.id === r.id;
                    return (
                      <tr key={r.id}
                          onClick={() => setSelected(r)}
                          className={`cursor-pointer ${isSel ? "bg-status-submitted-bg/60" : "hover:bg-muted/40"}`}>
                        <td className="px-3 py-2.5"><input type="checkbox" className="accent-primary" onClick={(e) => e.stopPropagation()} /></td>
                        <td className="px-2 py-2.5">
                          <div className="label-mono normal-case text-foreground">{r.id}</div>
                          <div className="text-[11px] text-muted-foreground">{r.sku}</div>
                        </td>
                        <td className="px-2 py-2.5 max-w-[280px]">
                          <div className="font-medium truncate">{r.productName}</div>
                          <div className="text-[11px] text-muted-foreground">{r.brand} · {r.imagesCount} images</div>
                        </td>
                        <td className="px-2 py-2.5"><StatusChip status={r.status} /></td>
                        <td className="px-2 py-2.5 text-xs text-muted-foreground max-w-[280px] truncate">
                          {r.blocker ?? <span className="text-status-ready">All checks passed</span>}
                        </td>
                        <td className="px-2 py-2.5">
                          {r.aiState === "NONE"
                            ? <span className="text-[11px] text-muted-foreground">—</span>
                            : <span className="inline-flex items-center gap-1 text-[11px] text-status-augmented"><Sparkles className="h-3 w-3"/>{r.aiState.toLowerCase()}</span>}
                        </td>
                        <td className="px-2 py-2.5">
                          <div className="text-xs text-foreground">{r.productType}</div>
                          <div className="text-[11px] text-muted-foreground tabular-nums">conf {(r.productTypeConfidence*100).toFixed(0)}%</div>
                        </td>
                        <td className="px-2 py-2.5 text-right text-xs text-muted-foreground tabular-nums">{r.updatedAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bulk action bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border bg-muted/40 text-sm">
              <span className="text-muted-foreground">Select rows for bulk action</span>
              <div className="flex items-center gap-2">
                <button className="h-8 px-2.5 rounded-sm border border-border bg-card text-xs hover:bg-muted">Re-validate</button>
                <button className="h-8 px-2.5 rounded-sm border border-border bg-card text-xs hover:bg-muted">Accept AI drafts</button>
                <button className="h-8 px-2.5 rounded-sm border border-border bg-card text-xs hover:bg-muted">Defer</button>
                <button className="h-8 px-2.5 rounded-sm border border-status-blocked-border text-status-blocked bg-status-blocked-bg text-xs hover:opacity-90">Exclude</button>
              </div>
            </div>
          </div>

          {/* Side panel: row preview */}
          <aside className="bg-card overflow-y-auto">
            <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
              <div className="min-w-0">
                <div className="label-mono normal-case">{selected.id} · {selected.sku}</div>
                <div className="font-medium truncate">{selected.productName}</div>
                <div className="mt-1.5"><StatusChip status={selected.status} /></div>
              </div>
              <Link
                to={appPaths.batchRow(batch.id, selected.id)}
                className="text-xs h-8 px-2.5 rounded-sm border border-border hover:bg-muted inline-flex items-center gap-1 shrink-0"
              >
                Open <ExternalLink className="h-3 w-3" />
              </Link>
            </header>

            <div className="p-4 space-y-4">
              <section>
                <h3 className="label-mono mb-2">Blocker / next action</h3>
                <div className="rounded-sm border border-status-needs-input-border bg-status-needs-input-bg/50 p-3 text-sm">
                  <div className="font-medium text-foreground">{selected.blocker ?? "All validation checks passed."}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Source listed capacity as <code className="bg-card px-1 rounded-sm">"1L"</code> in description but capacity unit column is empty.
                    Confirm <strong>liter (L)</strong> to proceed.
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="h-8 px-2.5 rounded-sm bg-primary text-primary-foreground text-xs font-medium">Confirm: liter</button>
                    <button className="h-8 px-2.5 rounded-sm border border-border bg-card text-xs hover:bg-muted">Confirm: milliliter</button>
                    <button className="h-8 px-2.5 rounded-sm border border-border bg-card text-xs hover:bg-muted">Other…</button>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="label-mono mb-2">Source facts</h3>
                <dl className="text-sm divide-y divide-border border border-border rounded-sm">
                  {[
                    ["Brand", selected.brand],
                    ["Product type", `${selected.productType} (conf ${(selected.productTypeConfidence*100).toFixed(0)}%)`],
                    ["GTIN", selected.gtin ?? "—"],
                    ["Images", `${selected.imagesCount} matched`],
                    ["Owner", selected.owner],
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
                  {[
                    ["08:12", "Validator flagged missing capacity_unit"],
                    ["08:12", "Stronger model escalation triggered (low confidence)"],
                    ["08:11", "Image #3 OCR detected '1 L' on packaging — suggestion only"],
                    ["08:10", "Source row imported from AW25_homekitchen_wave3.xlsx, line 23"],
                  ].map(([ts, t], i) => (
                    <li key={i} className="flex gap-3">
                      <span className="label-mono normal-case text-muted-foreground tabular-nums w-12 shrink-0">{ts}</span>
                      <span className="text-foreground">{t}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <Link to={appPaths.batchRow(batch.id, selected.id)} className="flex items-center justify-between text-sm text-primary hover:underline">
                <span>Open full row inspector</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
  );
}
