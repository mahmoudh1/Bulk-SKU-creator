import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { AppRoutes } from "@/app/routes/route-config";
import { getBatchIntakeReview, reprocessBatchIntake } from "@/lib/api-client/batches";
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
    reprocessBatchIntake: vi.fn(actual.reprocessBatchIntake),
  };
});

function renderMappingRoute(path: string) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <OrganizationProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

describe("intake correction and reprocess", () => {
  beforeEach(() => {
    clearLocalIntakeData();
    vi.mocked(getBatchIntakeReview).mockClear();
    vi.mocked(reprocessBatchIntake).mockClear();

    clerkState.isLoaded = true;
    clerkState.isSignedIn = true;
    clerkState.userId = "user_1";

    orgState.isLoaded = true;
    orgState.organization = { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" };
    orgState.membership = { role: "operator" };
  });

  async function seedReprocessBatch() {
    const lamp = await uploadTestImage("lamp.jpg");
    const carafe = await uploadTestImage("carafe-main.jpg");
    const batch = await createTestBatch(
      "reprocess.csv",
      `sku,name,brand,image_id\nsku-1,Lamp,Acme,${lamp.image_id}\nsku-2,Cream mug,Acme,img_missing_cream\nsku-3,Carafe,Acme,img_missing_carafe`,
    );

    return { batch, carafe };
  }

  it("submits corrections as a new intake attempt for the existing batch", async () => {
    const { batch, carafe } = await seedReprocessBatch();

    renderMappingRoute(`/batches/${batch.batchId}/mapping?correction=src-row-3`);

    fireEvent.change(await screen.findByLabelText(/corrected image_id for src-row-3/i), {
      target: { value: carafe.image_id },
    });
    fireEvent.click(screen.getByRole("button", { name: /reprocess intake/i }));

    await waitFor(() => expect(reprocessBatchIntake).toHaveBeenCalledTimes(1));
    expect(reprocessBatchIntake).toHaveBeenCalledWith({
      batchId: batch.batchId,
      organizationId: "org_1",
      corrections: [
        {
          rowId: "src-row-3",
          sourceRowNumber: 4,
          rowRevision: 1,
          imageIdCorrection: {
            originalValue: "img_missing_carafe",
            correctedValue: carafe.image_id,
          },
          fieldMappingCorrections: [],
        },
      ],
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/attempt 2 completed/i);
    expect(screen.getByText(new RegExp(`correlation intake-reprocess-${batch.batchId}-2`, "i"))).toBeInTheDocument();
  });

  it("shows corrected rows without duplicating unchanged rows", async () => {
    const { batch, carafe } = await seedReprocessBatch();

    renderMappingRoute(`/batches/${batch.batchId}/mapping?correction=src-row-3`);

    fireEvent.change(await screen.findByLabelText(/corrected image_id for src-row-3/i), {
      target: { value: carafe.image_id },
    });
    fireEvent.click(screen.getByRole("button", { name: /reprocess intake/i }));

    const outcomesTable = await screen.findByRole("table", { name: /post-reprocess outcomes/i });
    expect(within(outcomesTable).getAllByRole("row")).toHaveLength(4);
    expect(within(outcomesTable).getByRole("row", { name: /src-row-3 source row 4 attempt 2 rev 2 corrected/i })).toHaveTextContent(
      carafe.image_id,
    );
    expect(within(outcomesTable).getByRole("row", { name: /src-row-1 source row 2 attempt 1 rev 1 unchanged/i })).toHaveTextContent(
      /unaffected row preserved/i,
    );
  });

  it("keeps partial failures recoverable with row-level remaining issues", async () => {
    const { batch } = await seedReprocessBatch();

    renderMappingRoute(`/batches/${batch.batchId}/mapping?correction=src-row-2`);

    fireEvent.change(await screen.findByLabelText(/corrected image_id for src-row-2/i), {
      target: { value: "img_still_missing" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reprocess intake/i }));

    const outcomesTable = await screen.findByRole("table", { name: /post-reprocess outcomes/i });
    const failedRow = within(outcomesTable).getByRole("row", { name: /src-row-2 source row 3 attempt 2 rev 2 still needs correction/i });

    expect(failedRow).toHaveTextContent(/image id not found after reprocess/i);
    expect(failedRow).toHaveTextContent(/batch remains recoverable/i);
    expect(within(failedRow).getByRole("link", { name: /correct remaining issues for src-row-2/i })).toHaveAttribute(
      "href",
      `/batches/${batch.batchId}/mapping?correction=src-row-2`,
    );
  });
});
