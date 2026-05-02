import { useParams } from "react-router-dom";

import { prototypeAiBatchId } from "@/lib/mocks/route-defaults";
import { Sparkles, AlertCircle, CheckCircle2, XCircle, ChevronRight, ShieldAlert } from "lucide-react";

const queue = [
  { id: "r_88122", sku: "HK-CER-MUG-340-CR", title: "Stoneware ceramic mug, cream", confidence: 0.91, status: "pending" },
  { id: "r_88123", sku: "HK-GLS-CAR-1L", title: "Borosilicate glass carafe 1L", confidence: 0.74, status: "pending", low: true, escalated: true },
  { id: "r_88125", sku: "HK-TXT-NPK-04", title: "Linen blend napkin set, 4-pack", confidence: 0.86, status: "pending" },
  { id: "r_88130", sku: "HK-MET-FRY-26", title: "Tri-ply stainless frying pan, 26cm", confidence: 0.82, status: "pending" },
  { id: "r_88133", sku: "HK-WOD-SPC-RK", title: "Bamboo spice rack, 3-tier", confidence: 0.88, status: "accepted" },
];

export default function AIReview() {
  const { id = prototypeAiBatchId } = useParams();
  return (
    <div className="px-6 py-5 max-w-[1400px]">
        <div className="mb-5">
          <h1 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-status-augmented" /> AI augmentation review</h1>
          <p className="text-sm text-muted-foreground mt-1">Inspect what the AI changed. Accept only if the suggestion is consistent with source-verified facts.</p>
        </div>

        <div className="rounded-sm border border-status-augmented-border bg-status-augmented-bg/40 px-3 py-2.5 text-sm flex items-start gap-2 mb-4">
          <ShieldAlert className="h-4 w-4 mt-0.5 text-status-augmented shrink-0" />
          <span className="text-foreground/90">
            AI is allowed to <strong>rephrase</strong> source facts and <strong>structure</strong> bullets. It is <strong>not allowed</strong> to invent specifications, capacities, materials, or claims not present in source data.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Queue */}
          <aside className="panel">
            <header className="px-3 py-2.5 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold">Queue · 31</span>
              <span className="text-xs text-muted-foreground">28 pending</span>
            </header>
            <ul className="max-h-[640px] overflow-y-auto divide-y divide-border">
              {queue.map((q, i) => (
                <li key={q.id} className={`px-3 py-2.5 cursor-pointer hover:bg-muted/40 ${i === 1 ? "bg-status-submitted-bg/60" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="label-mono normal-case">{q.id}</span>
                    {q.status === "accepted"
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-status-ready" />
                      : <span className={`text-[11px] tabular-nums ${q.low ? "text-status-needs-input" : "text-muted-foreground"}`}>{(q.confidence*100).toFixed(0)}%</span>}
                  </div>
                  <div className="text-sm font-medium truncate mt-0.5">{q.title}</div>
                  <div className="text-[11px] text-muted-foreground">{q.sku}</div>
                  {q.escalated && <div className="text-[11px] text-status-augmented mt-1">↑ Escalated to stronger model</div>}
                </li>
              ))}
            </ul>
          </aside>

          {/* Compare */}
          <section className="panel">
            <header className="flex items-start justify-between px-4 py-3 border-b border-border">
              <div>
                <div className="label-mono normal-case">r_88123 · HK-GLS-CAR-1L</div>
                <h2 className="text-base font-semibold">Borosilicate glass carafe 1L</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <span className="text-sm font-semibold tabular-nums text-status-needs-input">74%</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-status-needs-input-bg border border-status-needs-input-border text-status-needs-input">below threshold</span>
              </div>
            </header>

            <div className="grid lg:grid-cols-2 divide-x divide-border">
              <div className="p-4">
                <div className="label-mono mb-2">Source facts (verified)</div>
                <dl className="text-sm space-y-1.5">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Title (raw)</dt><dd className="text-right">Glass carafe 1L</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Brand</dt><dd>Hearth & Loom</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Material (raw)</dt><dd>Borosilicate glass</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Capacity (raw)</dt><dd>1L</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Long description</dt><dd className="text-right max-w-[60%] text-xs text-muted-foreground">Heat-resistant carafe for water, juice, iced tea service. Wide-mouth.</dd></div>
                </dl>
                <div className="mt-4 text-xs text-muted-foreground">
                  Bullets and feature claims may only be derived from these fields.
                </div>
              </div>

              <div className="p-4 bg-status-augmented-bg/20">
                <div className="label-mono mb-2 flex items-center gap-2">
                  AI proposal <span className="text-[10px] px-1 py-0.5 rounded-sm bg-card border border-border text-muted-foreground">draft</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium leading-snug">Hearth & Loom 1L Borosilicate Glass Carafe — Heat-Resistant Pitcher with Drip-Free Spout</div>
                  <ul className="mt-2 space-y-1.5 list-disc pl-4">
                    <li>1 liter capacity ideal for water, juice or iced tea service</li>
                    <li>Borosilicate glass withstands sudden temperature changes</li>
                    <li>Wide mouth for easy cleaning and adding ice</li>
                    <li className="text-status-needs-input">Drip-free spout for clean pouring <span className="text-[11px] text-muted-foreground">⚠ not in source</span></li>
                  </ul>
                </div>

                <div className="mt-4 rounded-sm border border-status-needs-input-border bg-status-needs-input-bg/60 p-2.5 text-xs flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-status-needs-input shrink-0" />
                  <span>1 unverifiable claim detected. Reject this bullet or provide a source.</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button className="h-8 px-2.5 rounded-sm bg-primary text-primary-foreground text-xs font-medium">Accept (3 of 4 bullets)</button>
                  <button className="h-8 px-2.5 rounded-sm border border-border text-xs hover:bg-muted">Edit before accept</button>
                  <button className="h-8 px-2.5 rounded-sm border border-status-blocked-border text-status-blocked bg-status-blocked-bg text-xs">Reject all</button>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
              <span>Trace: model gpt-class-strong, escalated 08:12:14, latency 4.2s</span>
              <button className="text-primary hover:underline inline-flex items-center gap-1">Next row <ChevronRight className="h-3 w-3"/></button>
            </div>
          </section>
        </div>
    </div>
  );
}
