import { cn } from "@/lib/utils";
import type { Readiness, SubmissionState } from "@/data/mock";
import { CheckCircle2, Sparkles, AlertCircle, XOctagon, FileQuestion, Send, AlertTriangle } from "lucide-react";

const map: Record<Readiness, { label: string; cls: string; Icon: any }> = {
  READY: { label: "Ready", cls: "bg-status-ready-bg text-status-ready border-status-ready-border", Icon: CheckCircle2 },
  READY_WITH_AUGMENTATION: { label: "Ready · augmented", cls: "bg-status-augmented-bg text-status-augmented border-status-augmented-border", Icon: Sparkles },
  NEEDS_INPUT: { label: "Needs input", cls: "bg-status-needs-input-bg text-status-needs-input border-status-needs-input-border", Icon: AlertCircle },
  NOT_ENOUGH_DATA: { label: "Not enough data", cls: "bg-status-blocked-bg text-status-blocked border-status-blocked-border", Icon: FileQuestion },
  BLOCKED_FOR_REVIEW: { label: "Blocked", cls: "bg-status-blocked-bg text-status-blocked border-status-blocked-border", Icon: XOctagon },
  SUBMITTED: { label: "Submitted", cls: "bg-status-submitted-bg text-status-submitted border-status-submitted-border", Icon: Send },
  FAILED_SUBMISSION: { label: "Failed", cls: "bg-status-blocked-bg text-status-blocked border-status-blocked-border", Icon: AlertTriangle },
};

export function StatusChip({ status, compact = false }: { status: Readiness; compact?: boolean }) {
  const m = map[status];
  const Icon = m.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-xs font-medium", m.cls)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {!compact && <span>{m.label}</span>}
    </span>
  );
}

const subMap: Record<SubmissionState, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "bg-status-neutral-bg text-status-neutral border-status-neutral-border" },
  QUEUED: { label: "Queued", cls: "bg-status-submitted-bg text-status-submitted border-status-submitted-border" },
  PROCESSING: { label: "Processing", cls: "bg-status-augmented-bg text-status-augmented border-status-augmented-border" },
  DELAYED: { label: "Delayed", cls: "bg-status-needs-input-bg text-status-needs-input border-status-needs-input-border" },
  RETRYING: { label: "Retrying", cls: "bg-status-needs-input-bg text-status-needs-input border-status-needs-input-border" },
  SUCCEEDED: { label: "Succeeded", cls: "bg-status-ready-bg text-status-ready border-status-ready-border" },
  FAILED: { label: "Failed", cls: "bg-status-blocked-bg text-status-blocked border-status-blocked-border" },
  PARTIAL: { label: "Partial", cls: "bg-status-needs-input-bg text-status-needs-input border-status-needs-input-border" },
};

export function SubmissionChip({ state }: { state: SubmissionState }) {
  const m = subMap[state];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-xs font-medium", m.cls)}>
      {(state === "PROCESSING" || state === "RETRYING" || state === "QUEUED") && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-soft" />
      )}
      {m.label}
    </span>
  );
}
