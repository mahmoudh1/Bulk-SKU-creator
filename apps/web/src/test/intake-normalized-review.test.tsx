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

describe("intake normalized row review", () => {
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

  it("shows detected source column to model field mappings with confidence and samples", async () => {
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("field-mappings.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);

    renderMappingRoute(batch.batchId);

    const mappingTable = await screen.findByRole("table", { name: /detected field mappings/i });
    const titleMapping = within(mappingTable).getByRole("row", { name: /name title 100% mapped/i });
    const imageMapping = within(mappingTable).getByRole("row", { name: /image_id image references 100% mapped/i });

    expect(titleMapping).toHaveTextContent(/Lamp/i);
    expect(imageMapping).toHaveTextContent(asset.image_id);
  });

  it("preserves source row identity and normalized output beside linked image references", async () => {
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("row-identity.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);

    renderMappingRoute(batch.batchId);

    const row = await screen.findByRole("row", { name: /src-row-1 source row 2 attempt 1 rev 1 sku-1/i });

    expect(row).toHaveTextContent(/product title: Lamp/i);
    expect(row).toHaveTextContent(/brand: Acme/i);
    expect(row).toHaveTextContent(new RegExp(`original image_id ${asset.image_id}`, "i"));
    expect(within(row).getByRole("img", { name: /sku-1.*img_org_1_lamp_jpg/i })).toBeInTheDocument();
  });

  it("surfaces interpretation issues with a defined correction path", async () => {
    const batch = await createTestBatch("correction-path.csv", "sku,name,brand,image_id\nsku-1,Lamp,Acme,img_missing_lamp");

    renderMappingRoute(batch.batchId);

    const row = await screen.findByRole("row", { name: /src-row-1 source row 2 attempt 1 rev 1 sku-1/i });
    const correctionLink = within(row).getByRole("link", { name: /review correction path for src-row-1/i });

    expect(row).toHaveTextContent(/Unresolved image reference/i);
    expect(correctionLink).toHaveAttribute("href", `/batches/${batch.batchId}/mapping?correction=src-row-1`);
    expect(screen.getByRole("alert")).toHaveTextContent(/correct mapping issues before reprocessing/i);
  });
});
