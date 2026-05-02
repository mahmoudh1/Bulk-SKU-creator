import { Link, useParams } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";
import { StatusChip } from "@/components/StatusChip";
import { rows } from "@/data/mock";
import { prototypeBatchId } from "@/lib/mocks/route-defaults";
import { Send, ArrowLeft, AlertOctagon, CheckCircle2, AlertCircle } from "lucide-react";

export default function SubmissionScope() {
  const { id = prototypeBatchId } = useParams();
  const eligible = rows.filter((r) => r.status === "READY" || r.status === "READY_WITH_AUGMENTATION");
  const excluded = rows.filter((r) => r.status === "BLOCKED_FOR_REVIEW" || r.status === "NOT_ENOUGH_DATA" || r.status === "NEEDS_INPUT");

  return (
    <div className="px-6 py-5 max-w-[1400px]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="label-mono">Step 3 of 3</div>
            <h1 className="text-xl font-semibold mt-1">Confirm what will be submitted</h1>
            <p className="text-sm text-muted-foreground mt-1">Review the exact scope being sent to Amazon.eg. Excluded rows remain in the batch and can be resolved later.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={appPaths.batchReview(id)} className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4"/>Back to review</Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { l: "Submitting", v: 193, sub: "rows ready or augmented", tone: "ready" },
            { l: "Excluded", v: 55, sub: "blocked / needs input / not enough data", tone: "blocked" },
            { l: "Warnings", v: 6, sub: "augmented but reviewable", tone: "needs-input" },
            { l: "Marketplace", v: "Amazon.eg", sub: "POST_PRODUCT_DATA feed", tone: "neutral" },
          ].map((c) => (
            <div key={c.l} className={`panel p-4 border-l-2 ${
              c.tone === "ready" ? "border-status-ready-border" :
              c.tone === "blocked" ? "border-status-blocked-border" :
              c.tone === "needs-input" ? "border-status-needs-input-border" : "border-border"}`}>
              <div className="label-mono">{c.l}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{c.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-status-ready"/>Included rows · {eligible.length} of 14 shown</h2>
              <span className="text-xs text-muted-foreground">193 total</span>
            </header>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead><tr className="label-mono border-b border-border bg-muted/40 text-left">
                  <th className="px-3 py-2 font-normal">Row</th><th className="px-2 py-2 font-normal">Product</th><th className="px-2 py-2 font-normal">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {eligible.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 label-mono normal-case">{r.id}</td>
                      <td className="px-2 py-2 truncate max-w-[260px]">{r.productName}</td>
                      <td className="px-2 py-2"><StatusChip status={r.status} compact /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2"><AlertOctagon className="h-4 w-4 text-status-blocked"/>Excluded rows · with reason</h2>
              <span className="text-xs text-muted-foreground">55 total</span>
            </header>
            <ul className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {excluded.map((r) => (
                <li key={r.id} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{r.productName}</span>
                    <StatusChip status={r.status} compact />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{r.id} · {r.blocker}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Confirmation */}
        <section className="mt-5 panel p-5">
          <div className="flex items-start gap-3 mb-4 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 text-status-needs-input shrink-0" />
            <div>
              <div className="font-medium">Once submitted, listing creation cannot be cancelled mid-feed.</div>
              <div className="text-muted-foreground">Amazon may take up to 4 hours to fully process the feed. Excluded rows are saved in the batch and can be resolved without restarting.</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-primary" defaultChecked />
              I confirm 193 rows for submission to Amazon.eg
            </label>
            <div className="flex items-center gap-2">
              <Link to={appPaths.batchReview(id)} className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted">Back to review</Link>
              <Link to={appPaths.submissions} className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
                <Send className="h-4 w-4" /> Confirm submission
              </Link>
            </div>
          </div>
        </section>
      </div>
  );
}
