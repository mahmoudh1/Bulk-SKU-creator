import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppRoutes } from "@/app/routes/route-config";
import { reviewEntryPaths } from "@/app/routes/paths";

const clerkState = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: false,
}));

vi.mock("@clerk/clerk-react", () => ({
  SignIn: () => "Mock Clerk Sign In",
  SignedIn: ({ children }: { children: React.ReactNode }) => (clerkState.isSignedIn ? children : null),
  SignedOut: ({ children }: { children: React.ReactNode }) => (clerkState.isSignedIn ? null : children),
  useAuth: () => clerkState,
}));

describe("app routing foundation", () => {
  beforeEach(() => {
    clerkState.isLoaded = true;
    clerkState.isSignedIn = false;
  });

  it("sends signed-out root visits to the auth entry", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /sign in to your workspace/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /choose a workspace/i })).not.toBeInTheDocument();
  });

  it("blocks signed-out visitors from protected routes before protected content renders", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /sign in to your workspace/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /operational overview/i })).not.toBeInTheDocument();
  });

  it("sends signed-in root visits to the workspace selector", () => {
    clerkState.isSignedIn = true;

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /choose a workspace/i })).toBeInTheDocument();
  });

  it("allows signed-in visitors to render protected routes", () => {
    clerkState.isSignedIn = true;

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /operational overview/i })).toBeInTheDocument();
  });

  it("keeps shared review shortcuts free of hardcoded demo entity IDs", () => {
    expect(reviewEntryPaths).toEqual(["/review", "/review/rows", "/review/ai", "/review/images"]);
  });
});
