import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { AppRoutes } from "@/app/routes/route-config";
import { createBatchFromSpreadsheet } from "@/lib/api-client/batches";
import { clearLocalIntakeData } from "./intake-test-helpers";

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
    createBatchFromSpreadsheet: vi.fn(actual.createBatchFromSpreadsheet),
  };
});

function spreadsheetFile(name = "valid-image-id-sheet.csv", contents = "sku,name,brand,image_id\nsku-1,Lamp,Acme,img_org_1_lamp") {
  return new File([contents], name, { type: "text/csv" });
}

function LocationProbe() {
  const location = useLocation();

  return <div data-testid="location">{location.pathname}</div>;
}

function renderCreateBatchRoute() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/batches/new"]}>
          <AppRoutes />
          <LocationProbe />
        </MemoryRouter>
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

describe("create batch spreadsheet intake", () => {
  beforeEach(() => {
    clearLocalIntakeData();
    vi.mocked(createBatchFromSpreadsheet).mockClear();

    clerkState.isLoaded = true;
    clerkState.isSignedIn = true;
    clerkState.userId = "user_1";

    orgState.isLoaded = true;
    orgState.organization = { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" };
    orgState.membership = { role: "operator" };
  });

  it("creates an org-scoped batch from a valid spreadsheet and hands off to mapping with the returned batch id", async () => {
    renderCreateBatchRoute();

    const file = spreadsheetFile();
    fireEvent.change(await screen.findByLabelText(/select spreadsheet/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /start intake/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/upload accepted/i);
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/batches/batch_org_1_valid_image_id_sheet/mapping"));

    expect(createBatchFromSpreadsheet).toHaveBeenCalledWith({
      batchName: "AW25 Home & Kitchen - Wave 4",
      marketplace: "Amazon.eg",
      organizationId: "org_1",
      createdBy: "user_1",
      sourceFile: file,
    });
  });

  it("rejects missing image_id structure without navigating to a success state", async () => {
    renderCreateBatchRoute();

    fireEvent.change(await screen.findByLabelText(/select spreadsheet/i), {
      target: { files: [spreadsheetFile("missing-image-id.csv", "sku,name,brand\nsku-1,Lamp,Acme")] },
    });
    fireEvent.click(screen.getByRole("button", { name: /start intake/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/image_id column/i);
    expect(screen.getByTestId("location")).toHaveTextContent("/batches/new");
    expect(screen.queryByText(/batch_org_1/i)).not.toBeInTheDocument();
  });

  it("shows recoverable validation for unsupported source files", async () => {
    renderCreateBatchRoute();

    fireEvent.change(await screen.findByLabelText(/select spreadsheet/i), {
      target: { files: [new File(["notes"], "supplier-notes.txt", { type: "text/plain" })] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/unsupported spreadsheet type/i);
    expect(screen.getByRole("button", { name: /start intake/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /replace file/i })).toBeEnabled();
  });
});
