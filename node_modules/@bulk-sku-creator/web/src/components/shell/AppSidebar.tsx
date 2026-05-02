import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertOctagon,
  Bookmark,
  FileSearch,
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Package,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Upload,
} from "lucide-react";

import { appPaths } from "@/app/routes/paths";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const operations: NavigationItem[] = [
  { title: "Dashboard", url: appPaths.dashboard, icon: LayoutDashboard },
  { title: "Batches", url: appPaths.batches, icon: Package },
  { title: "Create batch", url: appPaths.createBatch, icon: Upload },
  { title: "Submission monitor", url: appPaths.submissions, icon: Send },
  { title: "Failure recovery", url: appPaths.submissionFailures, icon: AlertOctagon },
];

const review: NavigationItem[] = [
  { title: "Triage workspace", url: appPaths.reviewHub, icon: ListChecks },
  { title: "Row inspector", url: appPaths.reviewRowsHub, icon: FileSearch },
  { title: "AI review", url: appPaths.reviewAiHub, icon: Sparkles },
  { title: "Image plan", url: appPaths.reviewImagesHub, icon: ImageIcon },
];

const admin: NavigationItem[] = [
  { title: "Seller defaults", url: appPaths.sellerDefaults, icon: SlidersHorizontal },
  { title: "Saved views", url: appPaths.savedViews, icon: Bookmark },
  { title: "Support cases", url: appPaths.support, icon: LifeBuoy },
  { title: "Admin & governance", url: appPaths.admin, icon: ShieldCheck },
  { title: "States & loading", url: appPaths.states, icon: Activity },
  { title: "Mobile companion", url: appPaths.mobile, icon: Smartphone },
];

function Section({ label, items }: { label: string; items: NavigationItem[] }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarGroup>
      {!collapsed ? (
        <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
          {label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end
                  className="text-sidebar-foreground/80 hover:bg-sidebar-accent"
                  activeClassName="border-l-2 border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed ? <span className="text-sm">{item.title}</span> : null}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <div className="border-b border-sidebar-border px-3 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-sidebar-primary/30 bg-sidebar-primary/15">
              <span className="text-sm font-bold text-sidebar-primary">B</span>
            </div>
            {!collapsed ? (
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-sidebar-accent-foreground">Bulk-SKU-Creator</span>
                <span className="text-[11px] text-sidebar-foreground/60">Hearth &amp; Loom · Amazon.eg</span>
              </div>
            ) : null}
          </div>
        </div>
        <Section label="Operations" items={operations} />
        <Section label="Review" items={review} />
        <Section label="Settings" items={admin} />
      </SidebarContent>
    </Sidebar>
  );
}
