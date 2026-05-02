import { Link, useParams } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { rows } from "@/data/mock";
import { prototypeBatchId, prototypeRowId } from "@/lib/mocks/route-defaults";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, RotateCw, XCircle, AlertCircle, Sparkles, CheckCircle2, ImageIcon, FileSearch, Clock } from "lucide-react";

export default function RowInspector() {
  const { id = prototypeBatchId, rowId = prototypeRowId } = useParams();
  const row = rows.find((r) => r.id === rowId) ?? rows.find((r) => r.id === prototypeRowId) ?? rows[0];

  return (
    <AppShell breadcrumbs={<span><Link to={`/batches/${id}/review`} className="hover:underline">AW25 Wave 3</Link> · Row inspector</span>}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] min-h-[calc(100vh-3rem)]">
        <div className="min-w-0">
          {/* Row header */}
          <div className="px-6 pt-5 pb-4 border-b border-border bg-card/40">
            <div className="flex items-center justify-between gap-3 mb-2">
              <Link to={`/batches/${id}/review`} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to triage
              </Link>
              <div className="flex items-center gap-1">
                <button className="h-7 w-7 grid place-items-center rounded-sm border border-border hover:bg-muted"><ChevronLeft className="h-4 w-4"/></button>
                <span className="text-xs text-muted-foreground tabular-nums">Row 23 of 248</span>
                <button className="h-7 w-7 grid place-items-center rounded-sm border border-border hover:bg-muted"><ChevronRight className="h-4 w-4"/></button>
              </div>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="label-mono normal-case">{row.id} · {row.sku}</div>
                <h1 className="text-xl font-semibold mt-1">{row.productName}</h1>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <StatusChip status={row.status} />
                  <span className="text-muted-foreground">{row.brand} · {row.productType} · last edit {row.updatedAt}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5 max-w-[1100px]">
            {/* Source vs final */}
            <section className="panel">
              <header className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2"><FileSearch className="h-4 w-4 text-muted-foreground" />Source data & defaults</h2>
                <span className="text-xs text-muted-foreground">From AW25_homekitchen_wave3.xlsx · line 23</span>
              </header>
              <div className="grid sm:grid-cols-2 divide-x divide-border">
                <dl className="p-4 space-y-2 text-sm">
                  <div className="label-mono">Source spreadsheet values</div>
                  {[
                    ["SKU", row.sku],
                    ["Title", row.productName],
                    ["Brand", row.brand],
                    ["GTIN", row.gtin ?? "—"],
                    ["Capacity (raw)", "1L"],
                    ["Net weight", "640 g"],
                    ["Pkg dims", "32 × 12 × 12 cm"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 py-1 border-b border-border/60 last:border-0">
                      <dt className="text-muted-foreground">{k}</dt><dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <dl className="p-4 space-y-2 text-sm">
                  <div className="label-mono">Workspace defaults applied</div>
                  {[
                    ["Marketplace", "Amazon.eg"],
                    ["Currency", "EGP"],
                    ["Fulfillment", "FBA · Cairo DC"],
                    ["Condition", "New"],
                    ["Quantity", "120"],
                    ["Tax category", "A_GEN_NOTAX"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 py-1 border-b border-border/60 last:border-0">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right">{v} <span className="text-[10px] text-muted-foreground ml-1">default</span></dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* Validation */}
            <section className="panel">
              <header className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Validation</h2>
              </header>
              <ul className="divide-y divide-border">
                {[
                  { sev: "blocker", t: "Capacity unit not specified", d: "Source contains '1L' in title only. Required field capacity_unit is empty." },
                  { sev: "warn", t: "Product type confidence below threshold", d: "Resolved as CARAFE at 71% (threshold 80%). Verify or override." },
                  { sev: "ok", t: "GTIN checksum valid", d: "EAN-13 6224000128865 passed Luhn check." },
                  { sev: "ok", t: "Image set complete", d: "3 images mapped, main image meets resolution minimum." },
                ].map((v, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3 text-sm">
                    {v.sev === "blocker" && <XCircle className="h-4 w-4 mt-0.5 text-status-blocked shrink-0" />}
                    {v.sev === "warn" && <AlertCircle className="h-4 w-4 mt-0.5 text-status-needs-input shrink-0" />}
                    {v.sev === "ok" && <CheckCircle2 className="h-4 w-4 mt-0.5 text-status-ready shrink-0" />}
                    <div>
                      <div className="font-medium">{v.t}</div>
                      <div className="text-xs text-muted-foreground">{v.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* AI augmentation */}
            <section className="panel">
              <header className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-status-augmented" />AI augmentation</h2>
                <span className="text-xs text-muted-foreground">Escalated to stronger model · confidence 0.74</span>
              </header>
              <div className="p-4 grid lg:grid-cols-2 gap-4">
                <div>
                  <div className="label-mono mb-2">Source facts (verified)</div>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc pl-4">
                    <li>Borosilicate glass body</li>
                    <li>1L capacity (per source title)</li>
                    <li>Hearth & Loom brand</li>
                  </ul>
                </div>
                <div>
                  <div className="label-mono mb-2 flex items-center gap-2">AI draft <span className="text-[10px] px-1 py-0.5 rounded-sm bg-status-augmented-bg text-status-augmented border border-status-augmented-border">suggestion only</span></div>
                  <div className="text-sm space-y-1 text-foreground/80">
                    <div className="font-medium">Hearth & Loom 1L Borosilicate Glass Carafe — Heat-Resistant, Drip-Free Spout</div>
                    <ul className="list-disc pl-4 space-y-1 mt-2">
                      <li>1L capacity, ideal for water, juice, or iced tea service</li>
                      <li>Borosilicate glass withstands hot and cold without cracking</li>
                      <li>Wide-mouth design for easy cleaning and ice insertion</li>
                    </ul>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="h-8 px-2.5 rounded-sm bg-primary text-primary-foreground text-xs font-medium">Accept</button>
                    <button className="h-8 px-2.5 rounded-sm border border-border text-xs hover:bg-muted">Edit</button>
                    <button className="h-8 px-2.5 rounded-sm border border-border text-xs hover:bg-muted">Reject</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Image plan */}
            <section className="panel">
              <header className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" />Image plan</h2>
                <Link to={`/batches/${id}/images`} className="text-xs text-primary hover:underline">Open image plan →</Link>
              </header>
              <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="aspect-square rounded-sm border border-border bg-muted/40 grid place-items-center text-xs text-muted-foreground">
                    img_{i}.jpg
                  </div>
                ))}
              </div>
            </section>

            {/* History */}
            <section className="panel">
              <header className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />Lifecycle history</h2>
              </header>
              <ol className="p-4 space-y-3 text-sm">
                {[
                  ["08:12:14", "system", "Escalated to stronger model (confidence 0.62 → 0.74)"],
                  ["08:12:01", "validator", "Blocker raised: missing capacity_unit"],
                  ["08:11:48", "image-svc", "OCR detected '1 L' on packaging (image_3.jpg)"],
                  ["08:11:32", "preprocessor", "Mapped source row 23 → r_88123"],
                  ["08:10:00", "Nour A.", "Uploaded AW25_homekitchen_wave3.xlsx"],
                ].map(([ts, who, what], i) => (
                  <li key={i} className="grid grid-cols-[88px_120px_1fr] gap-3">
                    <span className="label-mono normal-case text-muted-foreground tabular-nums">{ts}</span>
                    <span className="text-xs text-foreground/80">{who}</span>
                    <span>{what}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>

        {/* Sticky action rail */}
        <aside className="border-l border-border bg-card/40 p-4 space-y-4 sticky top-12 self-start max-h-[calc(100vh-3rem)] overflow-y-auto">
          <div>
            <div className="label-mono">Next action</div>
            <button className="mt-2 w-full h-9 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover">Confirm capacity unit</button>
            <button className="mt-2 w-full h-9 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center justify-center gap-1.5">
              <Save className="h-4 w-4" /> Save changes
            </button>
            <button className="mt-2 w-full h-9 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center justify-center gap-1.5">
              <RotateCw className="h-4 w-4" /> Re-validate row
            </button>
          </div>
          <div className="border-t border-border pt-4 space-y-2">
            <button className="w-full h-8 rounded-sm border border-border text-sm hover:bg-muted">Defer to next batch</button>
            <button className="w-full h-8 rounded-sm border border-status-blocked-border text-status-blocked bg-status-blocked-bg text-sm hover:opacity-90">Exclude row</button>
          </div>

          <div className="border-t border-border pt-4">
            <div className="label-mono mb-2">Reason chain</div>
            <ol className="text-xs space-y-1.5 text-muted-foreground">
              <li><span className="text-foreground">Blocker:</span> capacity_unit empty</li>
              <li><span className="text-foreground">Cause:</span> source column unmapped at intake</li>
              <li><span className="text-foreground">Hint:</span> '1 L' detected on packaging image</li>
            </ol>
          </div>

          <div className="border-t border-border pt-4 text-[11px] text-muted-foreground">
            All AI suggestions on this row are clearly separated from source-verified facts. Nothing is submitted until you confirm.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
