import type { ReactNode } from "react";
import { Link, Outlet, matchPath, useLocation } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";
import { AppShell } from "@/components/AppShell";

type BreadcrumbMatch = {
  pattern: string;
  end?: boolean;
  build: (params: Record<string, string | undefined>) => ReactNode;
};

const breadcrumbMatches: BreadcrumbMatch[] = [
  {
    pattern: appPaths.dashboard,
    end: true,
    build: () => "Dashboard",
  },
  {
    pattern: appPaths.batches,
    end: true,
    build: () => (
      <span>
        <Link to={appPaths.dashboard} className="hover:underline">
          Dashboard
        </Link>{" "}
        · Batches
      </span>
    ),
  },
  {
    pattern: appPaths.createBatch,
    end: true,
    build: () => (
      <span>
        <Link to={appPaths.batches} className="hover:underline">
          Batches
        </Link>{" "}
        · Create batch
      </span>
    ),
  },
  {
    pattern: "/batches/:id/mapping",
    end: true,
    build: () => (
      <span>
        <Link to={appPaths.batches} className="hover:underline">
          Batches
        </Link>{" "}
        · Intake mapping
      </span>
    ),
  },
  {
    pattern: "/batches/:id/review",
    end: true,
    build: () => (
      <span>
        <Link to={appPaths.batches} className="hover:underline">
          Batches
        </Link>{" "}
        · Review
      </span>
    ),
  },
  {
    pattern: "/batches/:id/rows/:rowId",
    end: true,
    build: (params) => (
      <span>
        <Link to={`/batches/${params.id}/review`} className="hover:underline">
          Review
        </Link>{" "}
        · Row inspector
      </span>
    ),
  },
  {
    pattern: "/batches/:id/ai-review",
    end: true,
    build: (params) => (
      <span>
        <Link to={`/batches/${params.id}/review`} className="hover:underline">
          Review
        </Link>{" "}
        · AI review
      </span>
    ),
  },
  {
    pattern: "/batches/:id/images",
    end: true,
    build: (params) => (
      <span>
        <Link to={`/batches/${params.id}/review`} className="hover:underline">
          Review
        </Link>{" "}
        · Image plan
      </span>
    ),
  },
  {
    pattern: "/batches/:id/submit",
    end: true,
    build: (params) => (
      <span>
        <Link to={`/batches/${params.id}/review`} className="hover:underline">
          Review
        </Link>{" "}
        · Submission scope
      </span>
    ),
  },
  {
    pattern: appPaths.submissions,
    end: true,
    build: () => "Submission monitor",
  },
  {
    pattern: appPaths.submissionFailures,
    end: true,
    build: () => (
      <span>
        <Link to={appPaths.submissions} className="hover:underline">
          Submission monitor
        </Link>{" "}
        · Failure recovery
      </span>
    ),
  },
  {
    pattern: appPaths.sellerDefaults,
    end: true,
    build: () => "Settings · Seller defaults",
  },
  {
    pattern: appPaths.savedViews,
    end: true,
    build: () => "Settings · Saved views",
  },
  {
    pattern: appPaths.support,
    end: true,
    build: () => "Support · Investigations",
  },
  {
    pattern: appPaths.admin,
    end: true,
    build: () => "Admin & governance",
  },
  {
    pattern: appPaths.states,
    end: true,
    build: () => "Patterns · Empty & loading states",
  },
  {
    pattern: appPaths.mobile,
    end: true,
    build: () => "Mobile companion",
  },
];

function resolveBreadcrumbs(pathname: string): ReactNode {
  for (const entry of breadcrumbMatches) {
    const match = matchPath({ path: entry.pattern, end: entry.end ?? true }, pathname);
    if (match) {
      return entry.build(match.params);
    }
  }

  return "Workspace";
}

export function AppShellLayout() {
  const location = useLocation();
  const breadcrumbs = resolveBreadcrumbs(location.pathname);

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <Outlet />
    </AppShell>
  );
}

