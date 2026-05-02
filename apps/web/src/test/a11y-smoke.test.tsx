import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { AppRoutes } from "@/app/routes/route-config";

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
  SignIn: () => (
    <div>
      <h1>Sign in</h1>
      <button type="button">Continue</button>
    </div>
  ),
  SignedIn: ({ children }: { children: React.ReactNode }) => (clerkState.isSignedIn ? children : null),
  SignedOut: ({ children }: { children: React.ReactNode }) => (clerkState.isSignedIn ? null : children),
  useAuth: () => clerkState,
  OrganizationSwitcher: () => "Mock Organization Switcher",
  useOrganization: () => orgState,
  useOrganizationList: () => orgListState,
}));

describe("accessibility smoke", () => {
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

  it("renders an accessible sign-in surface with keyboard-reachable affordance", () => {
    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/auth"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(screen.getByRole("heading", { name: /sign in to your workspace/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("uses explicit status text while resolving workspace state", () => {
    clerkState.isSignedIn = true;
    orgState.isLoaded = false;
    orgListState.isLoaded = false;

    render(
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(/resolving workspace/i);
  });
});
