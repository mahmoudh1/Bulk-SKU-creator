import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { AppRoutes } from "@/app/routes/route-config";
import { evaluateBatchReadiness } from "@/lib/api-client/batches";
import { clearLocalIntakeData, createTestBatch, testOrganizationId, uploadTestImage } from "./intake-test-helpers";

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

function renderRowRoute(batchId: string, rowId: string) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <OrganizationProvider>
        <MemoryRouter initialEntries={[`/batches/${batchId}/rows/${rowId}`]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

describe("row inspector", () => {
  it("renders diagnostic sections from API-client data including issue next actions", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch(
      "row-inspector.csv",
      `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}\nsku-2,Chair,Acme,img_missing_chair`,
    );
    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    renderRowRoute(batch.batchId, "src-row-2");

    expect(await screen.findByRole("heading", { name: /chair/i })).toBeInTheDocument();
    expect(screen.getByText(/source facts & normalized fields/i)).toBeInTheDocument();

    const validation = screen.getByRole("heading", { name: /validation/i }).closest("section");
    expect(validation).toBeTruthy();
    expect(within(validation as HTMLElement).getByText(/image_id_not_found/i)).toBeInTheDocument();

    const actions = within(validation as HTMLElement).getAllByRole("link", { name: /review correction path/i });
    expect(actions[0]).toHaveAttribute("href", `/batches/${batch.batchId}/mapping?correction=src-row-2`);
  });

  it("renders R2-backed preview refs for image evidence", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("row-inspector.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);
    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    renderRowRoute(batch.batchId, "src-row-1");

    const image = await screen.findByRole("img", { name: new RegExp(asset.image_id, "i") });
    expect(image).toHaveAttribute("src", `/api/image-assets/${asset.image_id}/preview`);
    expect(image.getAttribute("src")).not.toMatch(/^https?:\/\//i);
  });

  it("does not fabricate row detail for unknown row IDs", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("row-inspector.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);
    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    renderRowRoute(batch.batchId, "r_88123");
    expect(await screen.findByRole("alert")).toHaveTextContent(/row detail was not found/i);
    expect(screen.queryByText(/borosilicate/i)).not.toBeInTheDocument();
  });
});
