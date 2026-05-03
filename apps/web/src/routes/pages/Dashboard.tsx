import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useOrganizationContext } from "@/app/organizations/OrganizationProvider";
import { appPaths } from "@/app/routes/paths";
import { SubmissionChip } from "@/components/StatusChip";
import { listBatches, type BatchListItemDto } from "@/lib/api-client/batches";
import { AlertOctagon, ArrowRight, Plus, RotateCw } from "lucide-react";

const toneCard: Record<string, string> = {
  neutral: "border-border",
  ready: "border-status-ready-border",
  "needs-input": "border-status-needs-input-border",
  blocked: "border-status-blocked-border",
};

export default function Dashboard() {
  const { activeWorkspace } = useOrganizationContext();
  const [batches, setBatches] = useState<BatchListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeWorkspace?.id) {
      setBatches([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    listBatches(activeWorkspace.id)
      .then((items) => {
        if (!cancelled) {
          setBatches(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBatches([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace?.id]);
  const summary = [
    { label: "Active batches", value: batches.length, hint: activeWorkspace?.name ?? "current workspace", tone: "neutral" },
    { label: "Rows ready", value: batches.reduce((sum, batch) => sum + batch.ready + batch.readyAugmented, 0), hint: "eligible for next step", tone: "ready" },
    { label: "Needs input", value: batches.reduce((sum, batch) => sum + batch.needsInput, 0), hint: "awaiting operator", tone: "needs-input" },
    { label: "Blocked / failed", value: batches.reduce((sum, batch) => sum + batch.blocked + batch.notEnough, 0), hint: "require correction", tone: "blocked" },
  ];
  const priorities = batches
    .filter((batch) => batch.needsInput > 0 || batch.blocked > 0)
    .slice(0, 3)
    .map((batch) => ({
      title: batch.name,
      text: `${batch.needsInput || batch.blocked} intake rows need correction before readiness evaluation.`,
      action: "Review blockers",
      to: appPaths.batchMapping(batch.id),
    }));

  return (
    <div className="max-w-[1400px] px-6 py-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Operational overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Loading workspace data" : `${batches.length} batches in ${activeWorkspace?.name ?? "current workspace"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={appPaths.batches} className="h-9 rounded-sm border border-border bg-card px-3 text-sm hover:bg-muted">
            Resume batch
          </Link>
          <Link
            to={appPaths.createBatch}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Create batch
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className={`panel border-l-2 ${toneCard[item.tone]} p-4`}>
            <div className="label-mono">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{item.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{item.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <section className="panel">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">What needs attention first</h2>
                <p className="text-xs text-muted-foreground">Ranked from persisted intake blockers</p>
              </div>
            </header>
            <div className="divide-y divide-border">
              {priorities.map((priority) => (
                <div key={priority.title} className="flex items-start gap-4 p-4">
                  <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-sm border border-status-blocked-border bg-status-blocked-bg text-status-blocked">
                    <AlertOctagon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{priority.title}</div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{priority.text}</p>
                  </div>
                  <Link to={priority.to} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-sm border border-border px-2.5 text-xs hover:bg-muted">
                    {priority.action} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
              {!isLoading && priorities.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No intake blockers found for this workspace.</div>
              ) : null}
            </div>
          </section>

          <section className="panel">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Recent batches</h2>
              <Link to={appPaths.batches} className="text-xs text-primary hover:underline">
                View all
              </Link>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="label-mono border-b border-border text-left">
                    <th className="px-4 py-2 font-normal">Batch</th>
                    <th className="px-2 py-2 font-normal">Rows</th>
                    <th className="px-2 py-2 font-normal">Ready</th>
                    <th className="px-2 py-2 font-normal">Blocked</th>
                    <th className="px-2 py-2 font-normal">Submission</th>
                    <th className="px-2 py-2 font-normal">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {batches.slice(0, 5).map((batch) => (
                    <tr key={batch.id} className="hover:bg-muted/40">
                      <td className="px-4 py-2.5">
                        <Link to={appPaths.batchReview(batch.id)} className="font-medium text-foreground hover:underline">
                          {batch.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {batch.owner} | {batch.marketplace}
                        </div>
                      </td>
                      <td className="px-2 py-2.5 tabular-nums">{batch.totalRows}</td>
                      <td className="px-2 py-2.5 tabular-nums text-status-ready">{batch.ready + batch.readyAugmented}</td>
                      <td className="px-2 py-2.5 tabular-nums text-status-blocked">{batch.blocked + batch.notEnough}</td>
                      <td className="px-2 py-2.5">
                        <SubmissionChip state={batch.submission} />
                      </td>
                      <td className="px-2 py-2.5 text-xs text-muted-foreground">{batch.lastUpdated}</td>
                    </tr>
                  ))}
                  {!isLoading && batches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No recent batches yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="panel">
            <header className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Live activity</h2>
              <p className="text-xs text-muted-foreground">From persisted workspace batches</p>
            </header>
            <ol className="p-2">
              {batches.slice(0, 5).map((batch) => (
                <li key={batch.id} className="flex items-start gap-3 px-2 py-2 text-sm">
                  <RotateCw className="mt-0.5 h-4 w-4 shrink-0 text-status-augmented" />
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground">{batch.name} updated from intake data</div>
                    <div className="text-[11px] text-muted-foreground">{batch.lastUpdated}</div>
                  </div>
                </li>
              ))}
              {!isLoading && batches.length === 0 ? (
                <li className="px-2 py-2 text-sm text-muted-foreground">No persisted activity yet.</li>
              ) : null}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
