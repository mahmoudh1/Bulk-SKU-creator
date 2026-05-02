import { fireEvent, render, screen } from "@testing-library/react";
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
  organization: null as null | { id: string; name: string; slug: string | null; imageUrl: string },
  membership: null as null | { role: string | null },
}));

const orgListState = vi.hoisted(() => ({
  isLoaded: true,
  organizationList: [] as Array<{
    organization: { id: string; name: string; slug: string | null; imageUrl: string };
    membership: { role: string | null };
  }>,
  setActive: vi.fn(async (_input: { organization: string }) => {}),
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

describe("workspace selection", () => {
  beforeEach(() => {
    clerkState.isLoaded = true;
    clerkState.isSignedIn = true;

    orgState.isLoaded = true;
    orgState.organization = null;
    orgState.membership = null;

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
    orgListState.setActive = vi.fn(async ({ organization }) => {
      const match = orgListState.organizationList.find((entry) => entry.organization.id === organization);
      if (!match) {
        return;
      }

      orgState.organization = match.organization;
      orgState.membership = match.membership;
    });
  });

  it("lets a multi-org user pick an active workspace and enter org-scoped routes", async () => {
    const view = render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/workspace"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(screen.getByRole("heading", { name: /choose a workspace/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /workspace one/i }));

    expect(orgListState.setActive).toHaveBeenCalledWith({ organization: "org_1" });
    view.rerender(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );
    expect(await screen.findByRole("heading", { name: /operational overview/i })).toBeInTheDocument();
  });

  it("auto-attempts to set the active workspace when only one workspace exists", () => {
    orgListState.organizationList = [
      {
        organization: { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" },
        membership: { role: "operator" },
      },
    ];

    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(orgListState.setActive).toHaveBeenCalledWith({ organization: "org_1" });
  });
});
