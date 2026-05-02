import { useMemo, useState } from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useOrganizationContext } from "@/app/organizations/OrganizationProvider";
import { appPaths } from "@/app/routes/paths";

export default function WorkspaceSelect() {
  const { isLoaded, activeWorkspace, setActiveWorkspace, workspaces } = useOrganizationContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);

  const returnTo = useMemo(() => {
    if (!location.state || typeof location.state !== "object") {
      return null;
    }

    const candidate = (location.state as { returnTo?: unknown }).returnTo;
    return typeof candidate === "string" && candidate.trim() ? candidate : null;
  }, [location.state]);

  const targetPath = returnTo ?? appPaths.dashboard;

  const roleStyle = useMemo<Record<string, string>>(
    () => ({
      admin: "border-status-submitted-border bg-status-submitted-bg text-status-submitted",
      operator: "border-status-ready-border bg-status-ready-bg text-status-ready",
      support: "border-status-augmented-border bg-status-augmented-bg text-status-augmented",
      member: "border-border bg-secondary text-foreground/70",
    }),
    [],
  );

  const resolveRoleTone = (role: string | null) => {
    const normalized = (role ?? "").toLowerCase();

    if (normalized.includes("admin")) {
      return "admin";
    }

    if (normalized.includes("support")) {
      return "support";
    }

    if (normalized.includes("operator")) {
      return "operator";
    }

    return "member";
  };

  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="text-sm text-muted-foreground" role="status">
          Loading workspaces...
        </div>
      </div>
    );
  }

  if (activeWorkspace) {
    return <Navigate to={targetPath} replace />;
  }

  if (workspaces.length === 1) {
    return <Navigate to={targetPath} replace />;
  }

  if (workspaces.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-sm border border-primary/20 bg-primary/10">
              <span className="font-bold text-primary">B</span>
            </div>
            <span className="font-semibold">Bulk-SKU-Creator</span>
          </div>
          <h1 className="text-2xl font-semibold">No workspaces found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in, but it does not belong to any organizations.
          </p>
        </div>
      </div>
    );
  }

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
            You belong to {workspaces.length} organizations. Pick where you want to work.
          </p>
        </div>

        <div className="panel divide-y divide-border">
          {workspaces.map((workspace) => {
            const roleTone = resolveRoleTone(workspace.membershipRole);
            const label = workspace.membershipRole ?? "Member";
            const pending = pendingWorkspaceId === workspace.id;

            return (
              <button
                key={workspace.id}
                type="button"
                className="group flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={pendingWorkspaceId !== null && !pending}
                onClick={async () => {
                  setPendingWorkspaceId(workspace.id);
                  await setActiveWorkspace(workspace.id);
                  navigate(targetPath, { replace: true });
                }}
              >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-border bg-secondary">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-foreground">{workspace.name}</span>
                  <span className={`rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${roleStyle[roleTone]}`}>
                    {label}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="truncate">{workspace.slug ? `@${workspace.slug}` : "Workspace"}</span>
                  {pending ? (
                    <>
                      <span>·</span>
                      <span>Setting active workspace...</span>
                    </>
                  ) : null}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
