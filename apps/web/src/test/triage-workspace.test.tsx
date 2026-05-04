import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { AppRoutes } from "@/app/routes/route-config";
import { evaluateBatchReadiness, saveBatchReviewContext } from "@/lib/api-client/batches";
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

function renderTriageRoute(batchId: string, search = "") {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <OrganizationProvider>
        <MemoryRouter initialEntries={[`/batches/${batchId}/review${search}`]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

describe("triage workspace", () => {
  it("renders server-backed readiness counts and preserves actual batch/row IDs in links", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch(
      "triage.csv",
      `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}\nsku-2,Chair,Acme,img_missing_chair`,
    );

    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    renderTriageRoute(batch.batchId);

    expect(await screen.findByRole("button", { name: /ready.*1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /needs input.*1/i })).toBeInTheDocument();
    expect(screen.getByText("src-row-1")).toBeInTheDocument();
    expect(screen.getByText("src-row-2")).toBeInTheDocument();

    const openLink = screen.getByRole("link", { name: /open full row inspector/i });
    expect(openLink).toHaveAttribute("href", `/batches/${batch.batchId}/rows/src-row-2`);
  });

  it("filters rows by readiness state and search input", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch(
      "triage.csv",
      `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}\nsku-2,Chair,Acme,img_missing_chair`,
    );

    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    renderTriageRoute(batch.batchId);
    await screen.findByText("src-row-1");

    fireEvent.click(screen.getByRole("button", { name: /needs input/i }));
    expect(screen.queryByText("src-row-1")).not.toBeInTheDocument();
    expect(screen.getByText("src-row-2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /all rows/i }));
    expect(screen.getByText("src-row-1")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/row id, sku, product name/i), { target: { value: "sku-1" } });
    expect(screen.getByText("src-row-1")).toBeInTheDocument();
    expect(screen.queryByText("src-row-2")).not.toBeInTheDocument();
  });

  it("preserves URL-driven filters and selected row when navigating to row detail and back", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch(
      "triage.csv",
      `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}\nsku-2,Chair,Acme,img_missing_chair`,
    );

    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    renderTriageRoute(batch.batchId, "?q=chair&readiness=NEEDS_INPUT&sort=updated&row=src-row-2");

    const searchInput = await screen.findByPlaceholderText(/row id, sku, product name/i);
    expect(searchInput).toHaveValue("chair");
    expect(screen.getByRole("combobox", { name: /sort/i })).toHaveValue("updated");
    expect(screen.queryByText("src-row-1")).not.toBeInTheDocument();
    expect(screen.getByText("src-row-2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /open full row inspector/i }));
    expect(await screen.findByRole("heading", { name: /source facts/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: /back to triage/i }));

    expect(await screen.findByPlaceholderText(/row id, sku, product name/i)).toHaveValue("chair");
    expect(screen.getByRole("combobox", { name: /sort/i })).toHaveValue("updated");
    expect(screen.getByText("src-row-2")).toBeInTheDocument();
  });

  it("restores last saved review context when returning to a batch without query params", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("triage.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);
    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    await saveBatchReviewContext({
      batchId: batch.batchId,
      organizationId: testOrganizationId,
      userId: "user_1",
      context: { q: "sku-1", row: "src-row-1" },
    });

    renderTriageRoute(batch.batchId);

    expect(await screen.findByPlaceholderText(/row id, sku, product name/i)).toHaveValue("sku-1");
    expect(screen.getByText("src-row-1")).toBeInTheDocument();
  });

  it("does not fabricate rows for unknown batch IDs", async () => {
    clearLocalIntakeData();
    renderTriageRoute("b_2041");

    expect(await screen.findByRole("alert")).toHaveTextContent(/readiness data was not found/i);
    expect(screen.queryByText(/r_88121/i)).not.toBeInTheDocument();
  });
});
