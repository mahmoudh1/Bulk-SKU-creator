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

describe("intake image resolution", () => {
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

  it("shows resolved image assets with platform preview references and accessible labels", async () => {
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("resolved-images.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);

    renderMappingRoute(batch.batchId);

    const normalizedRows = await screen.findByRole("table", { name: /normalized row review/i });
    const row = within(normalizedRows).getByRole("row", { name: /sku-1/i });

    expect(within(row).getByRole("img", { name: /sku-1.*img_org_1_lamp_jpg/i })).toHaveAttribute(
      "src",
      `/api/image-assets/${asset.image_id}/preview`,
    );
    expect(within(row).getByText(asset.image_id)).toBeInTheDocument();
    expect(getBatchIntakeReview).toHaveBeenCalledWith({ batchId: batch.batchId, organizationId: "org_1" });
  });

  it("keeps unresolved image IDs visible as recoverable row-level intake issues", async () => {
    const batch = await createTestBatch("unresolved-images.csv", "sku,name,brand,image_id\nsku-1,Lamp,Acme,img_missing_lamp");

    renderMappingRoute(batch.batchId);

    const normalizedRows = await screen.findByRole("table", { name: /normalized row review/i });
    const row = within(normalizedRows).getByRole("row", { name: /sku-1/i });

    expect(within(row).getByText("img_missing_lamp")).toBeInTheDocument();
    expect(within(row).getAllByText(/image id not found/i).length).toBeGreaterThan(0);
    expect(within(row).getAllByText(/upload the image through the image service/i).length).toBeGreaterThan(0);
  });

  it("does not resolve image IDs from another organization", async () => {
    const otherOrgAssetId = "img_org_2_lamp_jpg";
    const batch = await createTestBatch("other-org-image.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${otherOrgAssetId}`);

    renderMappingRoute(batch.batchId);

    const normalizedRows = await screen.findByRole("table", { name: /normalized row review/i });
    const row = within(normalizedRows).getByRole("row", { name: /sku-1/i });

    expect(within(row).getByText(otherOrgAssetId)).toBeInTheDocument();
    expect(within(row).getAllByText(/image id not found/i).length).toBeGreaterThan(0);
    expect(within(row).queryByRole("img")).not.toBeInTheDocument();
  });

  it("does not render external spreadsheet URLs as preview sources", async () => {
    const batch = await createTestBatch("external-url.csv", "sku,name,brand,image_id\nsku-1,Lamp,Acme,https://supplier.example/lamp.jpg");

    renderMappingRoute(batch.batchId);

    await screen.findByRole("heading", { name: /review intake mapping/i });

    const images = screen.queryAllByRole("img");
    expect(images.every((image) => image.getAttribute("src")?.startsWith("/api/image-assets/"))).toBe(true);
  });
});
