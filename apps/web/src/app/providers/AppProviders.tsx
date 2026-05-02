import type { PropsWithChildren } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";

import { appPaths } from "@/app/routes/paths";
import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { getClerkPublishableKey } from "./clerk";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/query/queryClient";

const clerkPublishableKey = getClerkPublishableKey();

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      signInUrl={appPaths.auth}
      signUpUrl={appPaths.auth}
      afterSignOutUrl={appPaths.auth}
    >
      <OrganizationProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </OrganizationProvider>
    </ClerkProvider>
  );
}
