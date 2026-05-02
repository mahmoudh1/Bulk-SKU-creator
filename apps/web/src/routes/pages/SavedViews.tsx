import { Link } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";
import { AppShell } from "@/components/AppShell";
import { prototypeBatchId } from "@/lib/mocks/route-defaults";
import { Bookmark, Plus, Copy, Edit2, Trash2 } from "lucide-react";

const views = [
  { name: "Blockers I own", scope: "Personal", filters: ["Status: BLOCKED_FOR_REVIEW", "Owner: me", "Marketplace: Amazon.eg"], lastUsed: "20 min ago", owner: "Nour A." },
  { name: "AI drafts pending review", scope: "Org", filters: ["AI state: DRAFTED", "Status: READY_WITH_AUGMENTATION"], lastUsed: "2 h ago", owner: "Lina R." },
  { name: "Image resolution failures", scope: "Org", filters: ["Failure reason: IMAGE_RESOLUTION_TOO_LOW"], lastUsed: "Yesterday", owner: "Karim D." },
  { name: "Carafes & drinkware", scope: "Personal", filters: ["Product type: CARAFE, DRINKING_CUP, BOWL"], lastUsed: "3 days ago", owner: "Nour A." },
  { name: "Needs supplier follow-up", scope: "Org", filters: ["Blocker: GTIN", "Blocker: Image"], lastUsed: "1 week ago", owner: "Hassan M." },
];

export default function SavedViews() {
  return (
    <AppShell breadcrumbs={<span><Link to="/dashboard" className="hover:underline">Dashboard</Link> · Settings · Saved views</span>}>
      <div className="px-6 py-5 max-w-[1100px]">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2"><Bookmark className="h-5 w-5 text-primary"/>Saved views</h1>
            <p className="text-sm text-muted-foreground mt-1">Recurring triage views, available across batches.</p>
          </div>
          <button className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4"/> New view
          </button>
        </div>

        <div className="panel">
          <table className="w-full text-sm">
            <thead><tr className="label-mono border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 font-normal">Name</th>
              <th className="px-2 py-2 font-normal">Scope</th>
              <th className="px-2 py-2 font-normal">Filters</th>
              <th className="px-2 py-2 font-normal">Owner</th>
              <th className="px-2 py-2 font-normal">Last used</th>
              <th className="px-2 py-2 font-normal w-32"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {views.map((v) => (
                <tr key={v.name} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-2 py-3">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-sm border font-medium ${
                      v.scope === "Org"
                        ? "bg-status-submitted-bg text-status-submitted border-status-submitted-border"
                        : "bg-status-neutral-bg text-status-neutral border-status-neutral-border"
                    }`}>{v.scope}</span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[420px]">
                      {v.filters.map((f) => (
                        <span key={f} className="text-[11px] px-1.5 py-0.5 rounded-sm border border-border bg-card text-muted-foreground">{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{v.owner}</td>
                  <td className="px-2 py-3 text-muted-foreground text-xs">{v.lastUsed}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={appPaths.batchReview(prototypeBatchId)} className="h-7 px-2 text-xs rounded-sm bg-primary text-primary-foreground">Apply</Link>
                      <button className="h-7 w-7 grid place-items-center rounded-sm border border-border hover:bg-muted"><Edit2 className="h-3 w-3"/></button>
                      <button className="h-7 w-7 grid place-items-center rounded-sm border border-border hover:bg-muted"><Copy className="h-3 w-3"/></button>
                      <button className="h-7 w-7 grid place-items-center rounded-sm border border-border hover:bg-muted text-status-blocked"><Trash2 className="h-3 w-3"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
