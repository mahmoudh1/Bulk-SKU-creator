import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useOrganizationContext } from "@/app/organizations/OrganizationProvider";
import { appPaths } from "@/app/routes/paths";
import { SubmissionChip } from "@/components/StatusChip";
import { listBatches, type BatchListItemDto } from "@/lib/api-client/batches";
import { Plus, Search, SlidersHorizontal, FolderOpen } from "lucide-react";

export default function BatchesList() {
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

  return (
    <div className="px-6 py-6 max-w-[1400px]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Batches</h1>
          <p className="text-sm text-muted-foreground mt-1">All listing batches across the workspace.</p>
        </div>
        <Link
          to={appPaths.createBatch}
          className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Create batch
        </Link>
      </div>

      <div className="panel">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2 px-2 h-8 rounded-sm border border-border bg-background flex-1 min-w-[220px] max-w-md">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Search batch name, owner, ID…" />
          </div>
          {["All status", "Marketplace: Amazon.eg", "Owner: Anyone", "Last 30 days"].map((f) => (
            <button
              key={f}
              className="h-8 px-2.5 rounded-sm border border-border bg-background text-xs text-foreground hover:bg-muted inline-flex items-center gap-1.5"
            >
              <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
              {f}
            </button>
          ))}
          <div className="ml-auto text-xs text-muted-foreground">
            {isLoading ? "Loading batches" : `${batches.length} batches`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left label-mono border-b border-border bg-muted/40">
                <th className="px-4 py-2 font-normal">Batch</th>
                <th className="px-2 py-2 font-normal">Created</th>
                <th className="px-2 py-2 font-normal">Owner</th>
                <th className="px-2 py-2 font-normal text-right">Rows</th>
                <th className="px-2 py-2 font-normal text-right">Ready</th>
                <th className="px-2 py-2 font-normal text-right">Needs input</th>
                <th className="px-2 py-2 font-normal text-right">Blocked</th>
                <th className="px-2 py-2 font-normal">Submission</th>
                <th className="px-2 py-2 font-normal">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link to={appPaths.batchReview(b.id)} className="font-medium hover:underline">
                      {b.name}
                    </Link>
                    <div className="text-[11px] text-muted-foreground label-mono">
                      {b.id} · {b.marketplace}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{b.createdAt}</td>
                  <td className="px-2 py-3">{b.owner}</td>
                  <td className="px-2 py-3 text-right tabular-nums">{b.totalRows}</td>
                  <td className="px-2 py-3 text-right tabular-nums text-status-ready">
                    {b.ready}
                    <span className="text-muted-foreground"> + {b.readyAugmented}</span>
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums text-status-needs-input">{b.needsInput}</td>
                  <td className="px-2 py-3 text-right tabular-nums text-status-blocked">{b.blocked + b.notEnough}</td>
                  <td className="px-2 py-3">
                    <SubmissionChip state={b.submission} />
                  </td>
                  <td className="px-2 py-3 text-muted-foreground text-xs">{b.lastUpdated}</td>
                </tr>
              ))}
              {!isLoading && batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No batches found for this workspace. Create a batch from a spreadsheet to populate this list.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
        <FolderOpen className="h-3 w-3" /> Archived batches are kept for 90 days.
      </div>
    </div>
  );
}
