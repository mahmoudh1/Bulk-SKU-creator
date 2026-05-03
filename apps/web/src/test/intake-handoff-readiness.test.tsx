import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { AppRoutes } from "@/app/routes/route-config";
import { getBatchIntakeReview } from "@/lib/api-client/batches";
import { clearLocalIntakeData, createTestBatch, uploadTestImage } from "./intake-test-helpers";

const clerkState = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: true,
  userId: "user_1" as string | null,
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
  ],
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

vi.mock("@/lib/api-client/batches", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-client/batches")>();

  return {
    ...actual,
    getBatchIntakeReview: vi.fn(actual.getBatchIntakeReview),
  };
});

function renderMappingRoute(batchId: string) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <OrganizationProvider>
        <MemoryRouter initialEntries={[`/batches/${batchId}/mapping`]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

describe("intake handoff readiness", () => {
  beforeEach(() => {
    clearLocalIntakeData();
    vi.mocked(getBatchIntakeReview).mockClear();

    clerkState.isLoaded = true;
    clerkState.isSignedIn = true;
    clerkState.userId = "user_1";

    orgState.isLoaded = true;
    orgState.organization = { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" };
    orgState.membership = { role: "operator" };
  });

  it("does not fabricate intake data for unknown route batch IDs", async () => {
    renderMappingRoute("b_2041");

    expect(await screen.findByRole("alert")).toHaveTextContent(/batch intake data was not found/i);
    expect(screen.queryByRole("region", { name: /intake handoff status/i })).not.toBeInTheDocument();
  });

  it("blocks readiness handoff and routes to correction when a created batch needs correction", async () => {
    const batch = await createTestBatch("needs-correction.csv", "sku,name,brand,image_id\nsku-1,Lamp,Acme,img_missing_lamp");

    renderMappingRoute(batch.batchId);

    const summary = await screen.findByRole("region", { name: /intake handoff status/i });
    const handoff = within(summary).getByRole("link", { name: /continue to readiness evaluation/i });
    const correction = within(summary).getByRole("link", { name: /correct intake blockers/i });

    expect(summary).toHaveTextContent(/intake needs correction/i);
    expect(summary).toHaveTextContent(/1 blockers across 1 rows/i);
    expect(summary).toHaveTextContent(/unresolved image reference: 1 row/i);
    expect(handoff).toHaveAttribute("aria-disabled", "true");
    expect(correction).toHaveAttribute("href", `/batches/${batch.batchId}/mapping?correction=src-row-1`);
  });

  it("enables readiness handoff only when a created batch is ready and preserves batch context", async () => {
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("ready.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);

    renderMappingRoute(batch.batchId);

    const summary = await screen.findByRole("region", { name: /intake handoff status/i });
    const handoff = within(summary).getByRole("link", { name: /continue to readiness evaluation/i });

    expect(summary).toHaveTextContent(/intake ready/i);
    expect(summary).toHaveTextContent(/ready for readiness evaluation/i);
    expect(summary).toHaveTextContent(/0 blockers/i);
    expect(handoff).toHaveAttribute("href", `/batches/${batch.batchId}/review`);
    expect(handoff).not.toHaveAttribute("aria-disabled", "true");
  });
});
