import type { ReactNode } from "react";
import { Bell, HelpCircle, Search } from "lucide-react";

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function AppShell({ children, breadcrumbs }: { children: ReactNode; breadcrumbs?: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 items-center gap-3 border-b border-border bg-card/60 px-3 backdrop-blur">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
              {breadcrumbs ?? <span>Hearth &amp; Loom Trading · Operations</span>}
            </div>
            <div className="hidden w-72 items-center gap-2 rounded-sm border border-border bg-background px-2 py-1 text-xs text-muted-foreground md:flex">
              <Search className="h-3.5 w-3.5" />
              <span>Search batches, rows, SKUs...</span>
              <span className="label-mono ml-auto">Ctrl+K</span>
            </div>
            <button className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:bg-muted">
              <HelpCircle className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:bg-muted">
              <Bell className="h-4 w-4" />
            </button>
            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              NA
            </div>
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
