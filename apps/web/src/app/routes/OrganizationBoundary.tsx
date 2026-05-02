import { useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useOrganizationContext } from "@/app/organizations/OrganizationProvider";
import { appPaths } from "@/app/routes/paths";

export function OrganizationBoundary() {
  const { isLoaded, activeWorkspace, setActiveWorkspace, workspaces } = useOrganizationContext();
  const location = useLocation();
  const didAttemptAutoSet = useRef(false);

  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="text-sm text-muted-foreground" role="status">
          Resolving workspace...
        </div>
      </div>
    );
  }

  if (activeWorkspace) {
    return <Outlet />;
  }

  if (workspaces.length === 1 && !didAttemptAutoSet.current) {
    didAttemptAutoSet.current = true;
    void setActiveWorkspace(workspaces[0].id);
  }

  if (workspaces.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-foreground">No workspace available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in, but it does not belong to any organizations yet.
          </p>
        </div>
      </div>
    );
  }

  if (workspaces.length > 1) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={appPaths.workspace} replace state={{ returnTo }} />;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="text-sm text-muted-foreground" role="status">
        Setting workspace...
      </div>
    </div>
  );
}

