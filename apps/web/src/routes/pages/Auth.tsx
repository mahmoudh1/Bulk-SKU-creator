import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { ShieldCheck } from "lucide-react";
import { Navigate } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";

export default function Auth() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-sm border border-sidebar-primary/30 bg-sidebar-primary/15">
            <span className="font-bold text-sidebar-primary">B</span>
          </div>
          <span className="font-semibold text-sidebar-accent-foreground">Bulk-SKU-Creator</span>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-3xl font-semibold leading-tight text-sidebar-accent-foreground">
            Turn messy spreadsheets into submission-ready Amazon listings.
          </h1>
          <p className="leading-relaxed text-sidebar-foreground/70">
            An operational platform for catalog teams. Upload your sheet and product images.
            We validate, augment with explicit AI assistance, flag what needs human input, and
            package every row for Amazon with a full audit trail.
          </p>
          <div className="space-y-2 text-sm text-sidebar-foreground/70">
            <div className="flex items-start gap-2">
              <span className="text-sidebar-primary">-</span>
              <span>Truth-first: source data is never silently overwritten</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sidebar-primary">-</span>
              <span>Every row carries its blocker, suggestion, and evidence</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sidebar-primary">-</span>
              <span>Designed for repeat batches, not one-off uploads</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-sidebar-foreground/50">
          v3.4 | Cairo region | {new Date().getFullYear()} Hearth & Loom Trading
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="grid h-8 w-8 place-items-center rounded-sm border border-primary/20 bg-primary/10">
              <span className="font-bold text-primary">B</span>
            </div>
            <span className="font-semibold">Bulk-SKU-Creator</span>
          </div>

          <h2 className="text-xl font-semibold text-foreground">Sign in to your workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use your organization email to continue.</p>

          <SignedIn>
            <Navigate to={appPaths.workspace} replace />
          </SignedIn>

          <SignedOut>
            <div className="mt-6">
              <SignIn
                routing="hash"
                forceRedirectUrl={appPaths.workspace}
                signUpForceRedirectUrl={appPaths.workspace}
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    cardBox: "w-full shadow-none",
                    card: "w-full rounded-sm border border-border bg-card shadow-sm",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "rounded-sm",
                    formButtonPrimary: "rounded-sm bg-primary hover:bg-primary-hover",
                    footerActionLink: "text-primary hover:text-primary",
                  },
                }}
              />
            </div>
          </SignedOut>

          <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-ready" />
            <span>
              Activity inside Bulk-SKU-Creator is audited and scoped to your organization. Source
              spreadsheets are never shared across workspaces.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
