import { Search, AlertOctagon, FileSearch, MessageSquare } from "lucide-react";

const cases = [
  { id: "SC-1042", row: "r_88131", title: "Frying pan main image rejected on Amazon.eg", severity: "high", opened: "2h ago", status: "Open" },
  { id: "SC-1041", row: "r_88123", title: "Carafe — taxonomy mismatch CARAFE → DRINKWARE_OTHER", severity: "medium", opened: "3h ago", status: "Investigating" },
  { id: "SC-1038", row: "r_88122", title: "AI bullet contained unverifiable claim, removed", severity: "low", opened: "Yesterday", status: "Resolved" },
  { id: "SC-1029", row: "r_88126", title: "GTIN checksum failure — supplier sheet", severity: "medium", opened: "2 days ago", status: "Open" },
];

const sevCls: Record<string, string> = {
  high: "bg-status-blocked-bg text-status-blocked border-status-blocked-border",
  medium: "bg-status-needs-input-bg text-status-needs-input border-status-needs-input-border",
  low: "bg-status-neutral-bg text-status-neutral border-status-neutral-border",
};

export default function SupportInvestigation() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_360px] min-h-[calc(100vh-3rem)]">
        {/* Left: cases */}
        <aside className="border-r border-border bg-card/40 flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 px-2 h-8 rounded-sm border border-border bg-background">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Search row ID, SKU, case…" />
            </div>
            <div className="mt-2 flex gap-1 text-xs">
              {["All", "Open", "Mine", "Resolved"].map((f, i) => (
                <button key={f} className={`h-7 px-2.5 rounded-sm border ${i === 1 ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-muted"}`}>{f}</button>
              ))}
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto divide-y divide-border">
            {cases.map((c, i) => (
              <li key={c.id} className={`p-3 cursor-pointer ${i === 0 ? "bg-status-submitted-bg/40" : "hover:bg-muted/40"}`}>
                <div className="flex items-center justify-between">
                  <span className="label-mono normal-case">{c.id}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${sevCls[c.severity]}`}>{c.severity}</span>
                </div>
                <div className="text-sm font-medium mt-1 leading-snug">{c.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{c.row} · {c.opened} · {c.status}</div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Center: investigation */}
        <main className="overflow-y-auto">
          <div className="px-6 py-5 border-b border-border bg-card/40">
            <div className="label-mono normal-case">SC-1042 · linked to r_88131</div>
            <h1 className="text-lg font-semibold mt-1">Frying pan main image rejected on Amazon.eg</h1>
            <p className="text-sm text-muted-foreground mt-1">Severity high · opened by Hassan M. · 2h ago</p>
          </div>

          <div className="p-6 space-y-5 max-w-[820px]">
            <section className="panel">
              <header className="px-4 py-3 border-b border-border flex items-center gap-2"><FileSearch className="h-4 w-4"/><h2 className="text-sm font-semibold">Row history (end-to-end)</h2></header>
              <ol className="p-4 text-sm space-y-3">
                {[
                  ["2026-04-22 08:51", "Amazon", "Feed response: IMAGE_RESOLUTION_TOO_LOW (800×800)"],
                  ["2026-04-22 08:42", "system", "Row included in submission scope (193 rows)"],
                  ["2026-04-22 08:14", "Hassan M.", "Accepted AI-drafted bullets"],
                  ["2026-04-22 08:11", "image-svc", "img_1.jpg ingested at 800×800 — flagged as warning, not blocker"],
                  ["2026-04-22 08:10", "Hassan M.", "Source row imported"],
                ].map((e, i) => (
                  <li key={i} className="grid grid-cols-[150px_120px_1fr] gap-3">
                    <span className="label-mono normal-case text-muted-foreground tabular-nums">{e[0]}</span>
                    <span className="text-xs text-foreground/80">{e[1]}</span>
                    <span>{e[2]}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="panel">
              <header className="px-4 py-3 border-b border-border"><h2 className="text-sm font-semibold">Submission packaging summary</h2></header>
              <pre className="text-[11px] m-4 bg-muted/60 border border-border rounded-sm p-3 overflow-x-auto"><code>{`feed_id: 50029847221
row: r_88131
sku: HK-MET-FRY-28
product_type: FRYING_PAN
main_image: cdn://b_2041/r_88131/img_1.jpg (800x800)
gallery: [img_2 (1500x1500), img_3 (1500x1500), img_4 (1200x1200)]
amazon_response: {
  status: "INVALID",
  code: "IMAGE_RESOLUTION_TOO_LOW",
  attribute: "main_image",
  detail: "min 1000x1000 required"
}`}</code></pre>
            </section>

            <section className="panel">
              <header className="px-4 py-3 border-b border-border"><h2 className="text-sm font-semibold">Suggested remediation</h2></header>
              <ol className="p-4 text-sm space-y-2 list-decimal pl-9">
                <li>Replace img_1 with high-resolution master from supplier portal.</li>
                <li>Raise validator severity for image resolution from <em>warn</em> to <em>blocker</em> to prevent recurrence.</li>
                <li>Retry r_88131 once corrected.</li>
              </ol>
            </section>
          </div>
        </main>

        {/* Right: trace / events */}
        <aside className="border-l border-border bg-card/40 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold flex items-center gap-2"><AlertOctagon className="h-4 w-4 text-status-blocked"/>Evidence trace</h3>
          </div>
          <ul className="p-3 space-y-2 text-xs">
            {[
              ["08:51:03", "amazon-sp-api", "rejected main_image"],
              ["08:42:18", "submission-svc", "feedId 50029847221 accepted by Amazon"],
              ["08:42:11", "submission-svc", "queued 193 rows"],
              ["08:11:48", "image-svc", "img_1 below recommended resolution (warning)"],
              ["08:10:00", "intake", "row imported from xlsx line 31"],
            ].map((e, i) => (
              <li key={i} className="border border-border rounded-sm p-2 bg-card">
                <div className="flex items-center justify-between">
                  <span className="label-mono normal-case tabular-nums">{e[0]}</span>
                  <span className="text-muted-foreground">{e[1]}</span>
                </div>
                <div className="text-foreground mt-1">{e[2]}</div>
              </li>
            ))}
          </ul>
          <div className="p-3 border-t border-border">
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5"/>Internal notes</h4>
            <textarea className="w-full h-20 rounded-sm border border-input bg-card p-2 text-xs" placeholder="Add a note for the operator…" />
            <button className="mt-2 w-full h-8 rounded-sm bg-primary text-primary-foreground text-xs font-medium">Post note</button>
          </div>
        </aside>
      </div>
  );
}
