import { useState } from "react";
import { Link } from "react-router-dom";
import { StatusChip, SubmissionChip } from "@/components/StatusChip";
import { Menu, Bell, ChevronRight, ArrowLeft, X } from "lucide-react";

const attention = [
  { id: "r_88131", title: "Tri-ply frying pan, 28cm", status: "FAILED_SUBMISSION" as const, sub: "Image below 1000×1000" },
  { id: "r_88123", title: "Borosilicate glass carafe 1L", status: "NEEDS_INPUT" as const, sub: "Confirm capacity unit" },
  { id: "r_88126", title: "Stainless steel whisk, 12-inch", status: "BLOCKED_FOR_REVIEW" as const, sub: "GTIN checksum failed" },
  { id: "r_88128", title: "Reactive glaze bowl, 22cm", status: "NOT_ENOUGH_DATA" as const, sub: "Main image unreadable" },
];

export default function MobileCompanion() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md min-h-screen border-x border-border bg-background flex flex-col">
        {/* mobile shell */}
        <header className="h-12 flex items-center gap-2 px-3 border-b border-border bg-card sticky top-0 z-10">
          <button className="h-8 w-8 grid place-items-center rounded-sm hover:bg-muted"><Menu className="h-4 w-4"/></button>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground leading-none">Hearth & Loom</div>
            <div className="text-sm font-semibold leading-tight">AW25 Wave 3</div>
          </div>
          <button className="h-8 w-8 grid place-items-center rounded-sm hover:bg-muted"><Bell className="h-4 w-4"/></button>
        </header>

        <main className="flex-1 p-3 space-y-3 pb-20">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Ready", v: 193, c: "text-status-ready", b: "border-status-ready-border" },
              { l: "Blocked", v: 27, c: "text-status-blocked", b: "border-status-blocked-border" },
              { l: "Failed", v: 8, c: "text-status-blocked", b: "border-status-blocked-border" },
            ].map((s) => (
              <div key={s.l} className={`panel p-2.5 border-l-2 ${s.b}`}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                <div className={`text-xl font-semibold tabular-nums ${s.c}`}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Submission state */}
          <div className="panel p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="label-mono">Last submission</div>
                <div className="text-sm font-medium mt-0.5">Feed 50029847221</div>
              </div>
              <SubmissionChip state="PROCESSING" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              193 rows in flight · 174 succeeded · 8 failed · 11 pending
            </p>
          </div>

          {/* Needs attention */}
          <section>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-sm font-semibold">Needs your attention</h2>
              <span className="text-xs text-muted-foreground">{attention.length}</span>
            </div>
            <ul className="space-y-2">
              {attention.map((a) => (
                <li key={a.id}>
                  <button onClick={() => setOpen(a.id)} className="w-full panel p-3 text-left hover:bg-muted/40 transition flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusChip status={a.status} compact />
                        <span className="label-mono normal-case">{a.id}</span>
                      </div>
                      <div className="font-medium text-sm truncate">{a.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.sub}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <div className="panel p-3 text-xs text-muted-foreground">
            Heavy editing (mapping, AI review, image plan) is reserved for the desktop workspace.
            <Link to="/dashboard" className="block mt-2 text-primary hover:underline">Open desktop workspace →</Link>
          </div>
        </main>

        {/* Drawer */}
        {open && (() => {
          const a = attention.find((x) => x.id === open)!;
          return (
            <div className="fixed inset-0 z-20 flex items-end justify-center bg-foreground/30">
              <div className="w-full max-w-md bg-card rounded-t-md border-t border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setOpen(null)} className="text-xs text-muted-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3"/>Back</button>
                  <button onClick={() => setOpen(null)} className="h-7 w-7 grid place-items-center rounded-sm hover:bg-muted"><X className="h-4 w-4"/></button>
                </div>
                <div className="label-mono normal-case">{a.id}</div>
                <h3 className="text-base font-semibold">{a.title}</h3>
                <div className="mt-2"><StatusChip status={a.status} /></div>
                <p className="mt-3 text-sm text-foreground/80">{a.sub}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="h-9 rounded-sm border border-border bg-card text-sm hover:bg-muted">Defer</button>
                  <button className="h-9 rounded-sm bg-primary text-primary-foreground text-sm font-medium">Open in desktop</button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
