import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { AppRoutes } from "@/app/routes/route-config";

const clerkState = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: true,
}));

const orgState = vi.hoisted(() => ({
  isLoaded: true,
  organization: { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" },
  membership: { role: "operator" as string | null },
}));

const orgListState = vi.hoisted(() => ({
  isLoaded: true,
  organizationList: [
    {
      organization: { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" },
      membership: { role: "operator" as string | null },
    },
    {
      organization: { id: "org_2", name: "Workspace Two", slug: "workspace-two", imageUrl: "" },
      membership: { role: "admin" as string | null },
    },
  ] as Array<{
    organization: { id: string; name: string; slug: string | null; imageUrl: string };
    membership: { role: string | null };
  }>,
  setActive: vi.fn(async () => {}),
}));

vi.mock("@clerk/clerk-react", () => ({
  SignIn: () => "Mock Clerk Sign In",
  SignedIn: ({ children }: { children: React.ReactNode }) => (clerkState.isSignedIn ? children : null),
  SignedOut: ({ children }: { children: React.ReactNode }) => (clerkState.isSignedIn ? null : children),
  useAuth: () => clerkState,
  OrganizationSwitcher: () => "Mock Organization Switcher",
  useOrganization: () => orgState,
  useOrganizationList: () => orgListState,
}));

describe("shared shell navigation", () => {
  beforeEach(() => {
    clerkState.isLoaded = true;
    clerkState.isSignedIn = true;

    orgState.isLoaded = true;
    orgState.organization = { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" };
    orgState.membership = { role: "operator" };

    orgListState.isLoaded = true;
    orgListState.organizationList = [
      {
        organization: { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" },
        membership: { role: "operator" },
      },
      {
        organization: { id: "org_2", name: "Workspace Two", slug: "workspace-two", imageUrl: "" },
        membership: { role: "admin" },
      },
    ];
    orgListState.setActive = vi.fn(async () => {});
  });

  it("renders primary navigation areas inside the shell", () => {
    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(screen.getByRole("heading", { name: /operational overview/i })).toBeInTheDocument();
    expect(screen.getByText("Mock Organization Switcher")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /batches/i })).toHaveAttribute("href", "/batches");
    expect(screen.getByRole("link", { name: /seller defaults/i })).toHaveAttribute("href", "/settings/defaults");
    expect(screen.getByRole("link", { name: /support cases/i })).toHaveAttribute("href", "/support");
    expect(screen.getByRole("link", { name: /admin & governance/i })).toHaveAttribute("href", "/admin");
  });

  it("keeps shared navigation free of hardcoded entity deep links", () => {
    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    const hrefs = Array.from(sidebar?.querySelectorAll("a") ?? [])
      .map((a) => a.getAttribute("href"))
      .filter((href): href is string => typeof href === "string");

    expect(hrefs.some((href) => /^\/batches\/[^/]+\/review$/.test(href))).toBe(false);
    expect(hrefs.some((href) => /^\/batches\/[^/]+\/rows\/[^/]+$/.test(href))).toBe(false);
  });
});
