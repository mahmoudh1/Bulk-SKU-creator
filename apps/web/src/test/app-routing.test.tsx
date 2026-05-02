import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { AppRoutes } from "@/app/routes/route-config";
import { reviewEntryPaths } from "@/app/routes/paths";

const clerkState = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: false,
}));

const orgState = vi.hoisted(() => ({
  isLoaded: true,
  organization: null as null | { id: string; name: string; slug: string | null; imageUrl: string },
  membership: null as null | { role: string | null },
}));

const orgListState = vi.hoisted(() => ({
  isLoaded: true,
  organizationList: [] as Array<{
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

describe("app routing foundation", () => {
  beforeEach(() => {
    clerkState.isLoaded = true;
    clerkState.isSignedIn = false;

    orgState.isLoaded = true;
    orgState.organization = null;
    orgState.membership = null;

    orgListState.isLoaded = true;
    orgListState.organizationList = [];
    orgListState.setActive = vi.fn(async () => {});
  });

  it("sends signed-out root visits to the auth entry", () => {
    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(screen.getByRole("heading", { name: /sign in to your workspace/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /choose a workspace/i })).not.toBeInTheDocument();
  });

  it("blocks signed-out visitors from protected routes before protected content renders", () => {
    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(screen.getByRole("heading", { name: /sign in to your workspace/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /operational overview/i })).not.toBeInTheDocument();
  });

  it("sends signed-in root visits to the workspace selector", () => {
    clerkState.isSignedIn = true;
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

    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(screen.getByRole("heading", { name: /choose a workspace/i })).toBeInTheDocument();
  });

  it("routes signed-in visitors without active workspace to the workspace selector", () => {
    clerkState.isSignedIn = true;
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

    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(screen.getByRole("heading", { name: /choose a workspace/i })).toBeInTheDocument();
  });

  it("allows signed-in visitors with active workspace to render org-scoped routes", () => {
    clerkState.isSignedIn = true;
    orgState.organization = { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" };
    orgState.membership = { role: "operator" };
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

    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(screen.getByRole("heading", { name: /operational overview/i })).toBeInTheDocument();
    expect(screen.getAllByText(/workspace one/i).length).toBeGreaterThan(0);
  });

  it("keeps shared review shortcuts free of hardcoded demo entity IDs", () => {
    expect(reviewEntryPaths).toEqual(["/review", "/review/rows", "/review/ai", "/review/images"]);
  });
});
