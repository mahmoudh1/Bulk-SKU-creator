import { Link } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";
import { TrendingUp, AlertOctagon, ShieldCheck, Settings, ArrowRight } from "lucide-react";

const blockers = [
  { name: "Missing capacity unit", count: 38, trend: "+12%" },
  { name: "GTIN checksum failure", count: 24, trend: "-4%" },
  { name: "Image below resolution minimum", count: 19, trend: "+22%" },
  { name: "Product type confidence below threshold", count: 17, trend: "-3%" },
  { name: "Color_map missing for BOWL/PLATE", count: 11, trend: "+8%" },
];

const policy = [
  { name: "AI confidence floor enforced", status: "ok", detail: "0 violations in last 7 days" },
  { name: "Image transforms truth-preserving", status: "ok", detail: "All transforms reverted on operator reject" },
  { name: "Cost guardrail per batch", status: "warn", detail: "1 batch reached 80% of $25 cap" },
  { name: "Source data immutability", status: "ok", detail: "0 source overrides without audit note" },
];

const audit = [
  { ts: "Today 09:14", actor: "Lina R.", action: "Raised AI confidence floor 0.70 → 0.75" },
  { ts: "Yesterday", actor: "Karim D.", action: "Promoted image-resolution rule from warn → blocker" },
  { ts: "2 days ago", actor: "system", action: "Auto-escalated 14 rows to stronger model" },
  { ts: "5 days ago", actor: "Hassan M.", action: "Added support case SC-1029 (GTIN supplier issue)" },
];

export default function AdminGovernance() {
  return (
    <div className="px-6 py-5 max-w-[1400px]">
        <div className="mb-5">
          <h1 className="text-xl font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>Admin & governance</h1>
          <p className="text-sm text-muted-foreground mt-1">Where the team is losing time, and what configuration is enforcing quality.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { l: "Batch throughput · 7d", v: "1,284", sub: "rows submitted" },
            { l: "First-pass success", v: "87%", sub: "+2.4% vs prior 7d" },
            { l: "Avg time to clear blocker", v: "11m", sub: "−3m vs prior 7d" },
            { l: "Open support cases", v: "6", sub: "2 high severity" },
          ].map((c) => (
            <div key={c.l} className="panel p-4">
              <div className="label-mono">{c.l}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{c.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2"><AlertOctagon className="h-4 w-4 text-status-blocked"/>Common blockers</h2>
              <span className="text-xs text-muted-foreground">last 7 days</span>
            </header>
            <ul className="divide-y divide-border">
              {blockers.map((b) => (
                <li key={b.name} className="px-4 py-3 flex items-center gap-3 text-sm">
                  <span className="flex-1 truncate">{b.name}</span>
                  <span className="tabular-nums w-12 text-right">{b.count}</span>
                  <span className={`tabular-nums w-14 text-right text-xs ${b.trend.startsWith("+") ? "text-status-blocked" : "text-status-ready"}`}>{b.trend}</span>
                  <div className="w-32 h-1.5 bg-muted rounded-sm overflow-hidden">
                    <div className="h-full bg-status-blocked/70" style={{ width: `${Math.min(100, b.count * 2.5)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-status-ready"/>Policy enforcement</h2>
              <span className="text-xs text-muted-foreground">last 7 days</span>
            </header>
            <ul className="divide-y divide-border">
              {policy.map((p) => (
                <li key={p.name} className="px-4 py-3 flex items-start gap-3 text-sm">
                  <span className={`mt-1 h-2 w-2 rounded-sm ${p.status === "ok" ? "bg-status-ready" : "bg-status-needs-input"}`} />
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          <section className="panel">
            <header className="px-4 py-3 border-b border-border"><h2 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4"/>Image issues over time</h2></header>
            <div className="p-4">
              <div className="flex items-end gap-2 h-32">
                {[6, 8, 12, 7, 14, 18, 22, 19, 11, 13, 17, 24, 19, 16].map((v, i) => (
                  <div key={i} className="flex-1 bg-status-blocked/60 rounded-t-sm" style={{ height: `${v * 4}px` }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>14d ago</span><span>today</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Image-resolution issues climbing. Recommend tightening intake check and notifying suppliers.</p>
            </div>
          </section>

          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Settings className="h-4 w-4"/>Recent config & escalations</h2>
              <Link to={appPaths.sellerDefaults} className="text-xs text-primary hover:underline inline-flex items-center gap-0.5">
                Manage defaults <ArrowRight className="h-3 w-3" />
              </Link>
            </header>
            <ol className="divide-y divide-border text-sm">
              {audit.map((a, i) => (
                <li key={i} className="px-4 py-3">
                  <div className="text-foreground">{a.action}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.actor} · {a.ts}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>
    </div>
  );
}
