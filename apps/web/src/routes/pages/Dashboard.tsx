import { Link } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";
import { StatusChip, SubmissionChip } from "@/components/StatusChip";
import { batches } from "@/data/mock";
import { prototypeAiBatchId, prototypeBatchId } from "@/lib/mocks/route-defaults";
import { ArrowRight, Plus, AlertOctagon, RotateCw, CheckCircle2, AlertCircle, FileQuestion } from "lucide-react";

const summary = [
  { label: "Active batches", value: 6, hint: "across 4 owners", tone: "neutral" },
  { label: "Rows ready", value: 887, hint: "eligible for submission", tone: "ready" },
  { label: "Needs input", value: 72, hint: "awaiting operator", tone: "needs-input" },
  { label: "Blocked / failed", value: 63, hint: "require investigation", tone: "blocked" },
];

const toneCard: Record<string, string> = {
  neutral: "border-border",
  ready: "border-status-ready-border",
  "needs-input": "border-status-needs-input-border",
  blocked: "border-status-blocked-border",
};

const priorities = [
  { kind: "blocked", title: "AW25 Home & Kitchen — Wave 3", text: "19 rows blocked: GTIN checksum and missing capacity units. Estimated 25 min to clear.", action: "Review blockers", to: appPaths.batchReview(prototypeBatchId) },
  { kind: "failed", title: "Toys & games — back-to-school", text: "8 rows failed Amazon validation (image resolution). Retry after replacing main images.", action: "Open failures", to: appPaths.submissionFailures },
  { kind: "ai", title: "Pet supplies Q2 launch", text: "44 AI-augmented rows awaiting human approval before submission scope freeze.", action: "Review AI drafts", to: appPaths.batchAiReview(prototypeAiBatchId) },
];

const activity = [
  { ts: "08:46", text: "Submission delayed: Amazon SP-API throttling (Beauty restock)", icon: AlertCircle, tone: "text-status-needs-input" },
  { ts: "08:43", text: "Feed accepted: 193 rows in flight (AW25 Wave 3)", icon: CheckCircle2, tone: "text-status-ready" },
  { ts: "08:14", text: "Nour A. accepted AI bullets on r_88122", icon: CheckCircle2, tone: "text-status-ready" },
  { ts: "08:12", text: "Escalated r_88123 to stronger model (low confidence)", icon: RotateCw, tone: "text-status-augmented" },
  { ts: "08:07", text: "Validator: GTIN checksum failed on r_88126", icon: AlertOctagon, tone: "text-status-blocked" },
];

export default function Dashboard() {
  return (
    <div className="px-6 py-6 max-w-[1400px]">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Operational overview</h1>
            <p className="text-sm text-muted-foreground mt-1">Tuesday, 22 Apr 2026 · 8 batches in progress · 1 submission live</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={appPaths.batches} className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted">
              Resume batch
            </Link>
            <Link
              to={appPaths.createBatch}
              className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Create batch
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {summary.map((s) => (
            <div key={s.label} className={`panel border-l-2 ${toneCard[s.tone]} p-4`}>
              <div className="label-mono">{s.label}</div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
          <div className="space-y-4">
            <section className="panel">
              <header className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <h2 className="text-sm font-semibold">What needs attention first</h2>
                  <p className="text-xs text-muted-foreground">Ranked by submission deadline impact</p>
                </div>
              </header>
              <div className="divide-y divide-border">
                {priorities.map((p) => (
                  <div key={p.title} className="p-4 flex items-start gap-4">
                    <div className={`mt-0.5 h-8 w-8 rounded-sm grid place-items-center border ${
                      p.kind === "blocked" ? "bg-status-blocked-bg border-status-blocked-border text-status-blocked"
                      : p.kind === "failed" ? "bg-status-blocked-bg border-status-blocked-border text-status-blocked"
                      : "bg-status-augmented-bg border-status-augmented-border text-status-augmented"
                    }`}>
                      {p.kind === "ai" ? <RotateCw className="h-4 w-4" /> : <AlertOctagon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{p.title}</div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.text}</p>
                    </div>
                    <Link to={p.to} className="text-xs h-8 px-2.5 rounded-sm border border-border hover:bg-muted inline-flex items-center gap-1 shrink-0">
                      {p.action} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <header className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Recent batches</h2>
                <Link to={appPaths.batches} className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left label-mono border-b border-border">
                      <th className="px-4 py-2 font-normal">Batch</th>
                      <th className="px-2 py-2 font-normal">Rows</th>
                      <th className="px-2 py-2 font-normal">Ready</th>
                      <th className="px-2 py-2 font-normal">Blocked</th>
                      <th className="px-2 py-2 font-normal">Submission</th>
                      <th className="px-2 py-2 font-normal">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {batches.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-muted/40">
                        <td className="px-4 py-2.5">
                          <Link to={appPaths.batchReview(b.id)} className="font-medium text-foreground hover:underline">
                            {b.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{b.owner} · {b.marketplace}</div>
                        </td>
                        <td className="px-2 py-2.5 tabular-nums">{b.totalRows}</td>
                        <td className="px-2 py-2.5 tabular-nums text-status-ready">{b.ready + b.readyAugmented}</td>
                        <td className="px-2 py-2.5 tabular-nums text-status-blocked">{b.blocked + b.notEnough}</td>
                        <td className="px-2 py-2.5"><SubmissionChip state={b.submission} /></td>
                        <td className="px-2 py-2.5 text-muted-foreground text-xs">{b.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="panel">
              <header className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Live activity</h2>
                <p className="text-xs text-muted-foreground">From across the workspace</p>
              </header>
              <ol className="p-2">
                {activity.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <li key={i} className="flex items-start gap-3 px-2 py-2 text-sm">
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${a.tone}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground">{a.text}</div>
                        <div className="text-[11px] text-muted-foreground tabular-nums">{a.ts}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="panel p-4">
              <h2 className="text-sm font-semibold mb-3">Readiness mix · last 7 days</h2>
              <div className="space-y-2">
                {[
                  { label: "Ready", value: 64, cls: "bg-status-ready" },
                  { label: "Ready · augmented", value: 18, cls: "bg-status-augmented" },
                  { label: "Needs input", value: 9, cls: "bg-status-needs-input" },
                  { label: "Blocked", value: 6, cls: "bg-status-blocked" },
                  { label: "Not enough data", value: 3, cls: "bg-status-blocked/70" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground">{r.label}</span>
                      <span className="text-muted-foreground tabular-nums">{r.value}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-sm overflow-hidden">
                      <div className={`h-full ${r.cls}`} style={{ width: `${r.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
  );
}
