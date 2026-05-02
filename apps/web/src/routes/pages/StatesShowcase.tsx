import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { FolderOpen, Filter, Inbox, LifeBuoy, Bookmark, Plus, Upload, RotateCw, Sparkles, ImageIcon, Send, Clock, AlertCircle } from "lucide-react";

function Empty({ icon: Icon, title, desc, action }: any) {
  return (
    <div className="panel p-8 text-center">
      <div className="mx-auto h-10 w-10 rounded-sm border border-border bg-muted/40 grid place-items-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">{desc}</p>
      {action && (
        <button className="mt-4 h-8 px-3 rounded-sm bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
          {action}
        </button>
      )}
    </div>
  );
}

function Loading({ icon: Icon, title, sub, mode }: any) {
  return (
    <div className="panel p-4">
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-sm grid place-items-center border ${
          mode === "delayed" ? "border-status-needs-input-border bg-status-needs-input-bg/60 text-status-needs-input"
          : mode === "retrying" ? "border-status-needs-input-border bg-status-needs-input-bg/60 text-status-needs-input"
          : mode === "queued" ? "border-status-submitted-border bg-status-submitted-bg/60 text-status-submitted"
          : "border-status-augmented-border bg-status-augmented-bg/60 text-status-augmented"
        }`}>
          <Icon className={`h-4 w-4 ${mode === "processing" || mode === "queued" ? "animate-pulse-soft" : mode === "retrying" ? "animate-spin" : ""}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
          <div className="mt-2 h-1.5 bg-muted rounded-sm overflow-hidden">
            <div className={`h-full ${
              mode === "delayed" ? "bg-status-needs-input/50 w-1/3"
              : mode === "queued" ? "bg-status-submitted/40 w-[15%]"
              : mode === "retrying" ? "bg-status-needs-input/60 w-3/4"
              : "bg-status-augmented/70 w-2/3"
            } animate-pulse-soft`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatesShowcase() {
  return (
    <AppShell breadcrumbs={<span>Patterns · Empty & loading states</span>}>
      <div className="px-6 py-5 max-w-[1280px]">
        <h1 className="text-xl font-semibold">Empty & loading state library</h1>
        <p className="text-sm text-muted-foreground mt-1">Reference patterns. Realistic, calm, never reliant on color alone.</p>

        <h2 className="mt-6 mb-3 text-sm font-semibold label-mono normal-case text-foreground">Empty states</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Empty icon={FolderOpen} title="No batches yet" desc="Upload a spreadsheet and product images to start your first listing batch." action={<><Plus className="h-3.5 w-3.5"/>Create batch</>} />
          <Empty icon={Filter} title="No rows match this filter" desc="Try removing a filter or switch to All rows. Saved views can capture commonly used combinations." action={<>Reset filters</>} />
          <Empty icon={Inbox} title="No failed submissions" desc="Every row in your last submitted batch was accepted by Amazon. Nothing to recover." />
          <Empty icon={LifeBuoy} title="No support cases found" desc="No flagged rows or operator escalations match your search. Try a different SKU or row ID." />
          <Empty icon={Bookmark} title="No saved views yet" desc="Save the filters you use every day to share workflows with the rest of the team." action={<><Plus className="h-3.5 w-3.5"/>Create saved view</>} />
        </div>

        <h2 className="mt-8 mb-3 text-sm font-semibold label-mono normal-case text-foreground">Loading & async states</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Loading icon={Upload} mode="processing" title="Uploading spreadsheet" sub="AW25_homekitchen_wave3.xlsx · 412 KB · 184 of 248 rows parsed" />
          <Loading icon={RotateCw} mode="processing" title="Validation in progress" sub="Checking GTIN, attributes, and image set on 248 rows · 142 done" />
          <Loading icon={Sparkles} mode="processing" title="AI augmentation running" sub="Drafting bullets for 31 augmented rows · 18 done · cost so far $4.12 of $25" />
          <Loading icon={ImageIcon} mode="processing" title="Image processing" sub="Inspecting 612 assets · checking compliance and resolution · 412 done" />
          <Loading icon={Send} mode="queued" title="Submission queued" sub="Waiting for Amazon SP-API window · ~30s estimated" />
          <Loading icon={Clock} mode="delayed" title="Submission delayed by external system" sub="Amazon reports throttling. Auto-retrying with backoff. No action needed yet." />
          <Loading icon={RotateCw} mode="retrying" title="Retrying failed row" sub="r_88126 · attempt 2 of 3 · transient 5xx from Amazon · next retry in 45s" />
          <div className="panel p-4">
            <div className="text-xs text-muted-foreground label-mono mb-2">Skeleton · table</div>
            <div className="space-y-2">
              {[80, 90, 70, 95, 60].map((w, i) => (
                <div key={i} className="flex gap-2">
                  <div className="h-4 bg-muted rounded-sm w-24 animate-pulse-soft" />
                  <div className={`h-4 bg-muted rounded-sm animate-pulse-soft`} style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
