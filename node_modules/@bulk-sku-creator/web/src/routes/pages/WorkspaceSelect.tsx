import { ArrowRight, Building2, Mail, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";

const orgs = [
  { id: "o1", name: "Hearth & Loom Trading", role: "Operator", marketplace: "Amazon.eg", lastActive: "Active now", batches: 12 },
  { id: "o2", name: "Nile Home Goods Co.", role: "Admin", marketplace: "Amazon.eg, Amazon.ae", lastActive: "Yesterday", batches: 28 },
  { id: "o3", name: "Cairo Beauty Distributors", role: "Support", marketplace: "Amazon.eg", lastActive: "3 days ago", batches: 5 },
];

const roleStyle: Record<string, string> = {
  Admin: "border-status-submitted-border bg-status-submitted-bg text-status-submitted",
  Operator: "border-status-ready-border bg-status-ready-bg text-status-ready",
  Support: "border-status-augmented-border bg-status-augmented-bg text-status-augmented",
};

export default function WorkspaceSelect() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-sm border border-primary/20 bg-primary/10">
              <span className="font-bold text-primary">B</span>
            </div>
            <span className="font-semibold">Bulk-SKU-Creator</span>
          </div>
          <h1 className="text-2xl font-semibold">Choose a workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You belong to {orgs.length} organizations. Pick where you want to work.
          </p>
        </div>

        <div className="panel divide-y divide-border">
          {orgs.map((org) => (
            <Link
              key={org.id}
              to={appPaths.dashboard}
              className="group flex items-center gap-4 p-4 transition hover:bg-muted/40"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-border bg-secondary">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-foreground">{org.name}</span>
                  <span className={`rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${roleStyle[org.role]}`}>
                    {org.role}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{org.marketplace}</span>
                  <span>·</span>
                  <span>{org.batches} active batches</span>
                  <span>·</span>
                  <span>{org.lastActive}</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
            </Link>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button className="panel flex items-start gap-3 p-4 text-left hover:bg-muted/40">
            <Plus className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Create new workspace</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Set up a fresh organization for a separate seller account.
              </div>
            </div>
          </button>
          <button className="panel flex items-start gap-3 p-4 text-left hover:bg-muted/40">
            <Mail className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Join with invite code</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Have an invite from your team? Enter the code to join.
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
