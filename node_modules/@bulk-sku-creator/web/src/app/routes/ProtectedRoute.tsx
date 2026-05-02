import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { appPaths } from "./paths";

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="text-sm text-muted-foreground" role="status">
          Checking session...
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate to={appPaths.auth} replace state={{ returnTo }} />;
  }

  return <Outlet />;
}
