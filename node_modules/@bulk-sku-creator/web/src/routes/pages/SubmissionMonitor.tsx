import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { SubmissionChip } from "@/components/StatusChip";
import { submissionEvents, rows } from "@/data/mock";
import { CheckCircle2, AlertCircle, AlertOctagon, RotateCw, Clock } from "lucide-react";

const rowResults = [
  { id: "r_88121", title: "Stoneware mug, navy", state: "SUCCEEDED" as const, msg: "Created · ASIN B0CXMUG02N" },
  { id: "r_88122", title: "Stoneware mug, cream", state: "SUCCEEDED" as const, msg: "Created · ASIN B0CXMUG02C" },
  { id: "r_88124", title: "Acacia cutting board", state: "SUCCEEDED" as const, msg: "Created · ASIN B0CXCTB30" },
  { id: "r_88129", title: "Stoneware dinner plate, charcoal", state: "PROCESSING" as const, msg: "Awaiting Amazon catalog confirmation" },
  { id: "r_88133", title: "Bamboo spice rack, 3-tier", state: "DELAYED" as const, msg: "External taxonomy service slow — auto-monitoring" },
  { id: "r_88131", title: "Tri-ply frying pan, 28cm", state: "FAILED" as const, msg: "IMAGE_RESOLUTION_TOO_LOW (main image)" },
  { id: "r_88126", title: "Stainless steel whisk, 12-inch", state: "RETRYING" as const, msg: "Transient 5xx — retry 2 of 3 in 45s" },
  { id: "r_88134", title: "Airtight pantry container 2L", state: "SUCCEEDED" as const, msg: "Created · ASIN B0CXSTR2L" },
];

const lvl: Record<string, string> = {
  info: "text-muted-foreground",
  warn: "text-status-needs-input",
  error: "text-status-blocked",
};

export default function SubmissionMonitor() {
  return (
    <AppShell breadcrumbs={<span><Link to="/batches" className="hover:underline">Batches</Link> · AW25 Wave 3 · Submission</span>}>
      <div className="px-6 py-5 max-w-[1400px]">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold">Submission monitor</h1>
            <p className="text-sm text-muted-foreground mt-1">Feed 50029847221 · started 08:42 · live</p>
          </div>
          <div className="flex items-center gap-2">
            <SubmissionChip state="PROCESSING" />
            <button className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted">Pause auto-retry</button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          {[
            { l: "Submitted", v: 193, c: "text-foreground" },
            { l: "Succeeded", v: 174, c: "text-status-ready" },
            { l: "Processing", v: 8, c: "text-status-augmented" },
            { l: "Delayed / retrying", v: 3, c: "text-status-needs-input" },
            { l: "Failed", v: 8, c: "text-status-blocked" },
          ].map((s) => (
            <div key={s.l} className="panel p-4">
              <div className="label-mono">{s.l}</div>
              <div className={`mt-1 text-2xl font-semibold tabular-nums ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4">
          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Row results</h2>
              <div className="flex items-center gap-1">
                {["All", "Succeeded", "Pending", "Delayed", "Failed", "Retrying"].map((f, i) => (
                  <button key={f} className={`h-7 px-2.5 text-xs rounded-sm border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-muted"}`}>{f}</button>
                ))}
              </div>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="label-mono border-b border-border bg-muted/30 text-left">
                  <th className="px-4 py-2 font-normal">Row</th>
                  <th className="px-2 py-2 font-normal">Product</th>
                  <th className="px-2 py-2 font-normal">State</th>
                  <th className="px-2 py-2 font-normal">Message</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {rowResults.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 label-mono normal-case">{r.id}</td>
                      <td className="px-2 py-2.5">{r.title}</td>
                      <td className="px-2 py-2.5"><SubmissionChip state={r.state} /></td>
                      <td className="px-2 py-2.5 text-xs text-muted-foreground">{r.msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Auto-refresh every 15s · last update just now</span>
              <Link to="/submissions/failures" className="text-primary hover:underline">Open failure recovery →</Link>
            </div>
          </section>

          <aside className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Submission timeline</h2>
            </header>
            <ol className="p-4 space-y-3 text-sm">
              {submissionEvents.map((e, i) => (
                <li key={i} className="grid grid-cols-[64px_1fr] gap-3">
                  <span className="label-mono normal-case text-muted-foreground tabular-nums">{e.ts}</span>
                  <span className={lvl[e.level]}>{e.message}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
