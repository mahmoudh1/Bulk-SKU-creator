import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationProvider } from "@/app/organizations/OrganizationProvider";
import { AppRoutes } from "@/app/routes/route-config";
import { createImageAsset } from "@/lib/api-client/image-assets";
import { clearLocalIntakeData } from "./intake-test-helpers";

const clerkState = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: true,
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

vi.mock("@/lib/api-client/image-assets", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-client/image-assets")>();

  return {
    ...actual,
    createImageAsset: vi.fn(actual.createImageAsset),
  };
});

function imageFile(name = "sku-main.jpg", type = "image/jpeg") {
  return new File(["mock-image"], name, { type });
}

function renderImageAssetsRoute() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <OrganizationProvider>
        <MemoryRouter initialEntries={["/image-assets"]}>
          <AppRoutes />
        </MemoryRouter>
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

describe("image asset upload", () => {
  beforeEach(() => {
    clearLocalIntakeData();
    vi.mocked(createImageAsset).mockClear();

    clerkState.isLoaded = true;
    clerkState.isSignedIn = true;

    orgState.isLoaded = true;
    orgState.organization = { id: "org_1", name: "Workspace One", slug: "workspace-one", imageUrl: "" };
    orgState.membership = { role: "operator" };
  });

  it("uploads a valid image with organization context and displays the issued image_id", async () => {
    renderImageAssetsRoute();

    const file = imageFile("sku-main.jpg");
    fireEvent.change(await screen.findByLabelText(/select product image/i), { target: { files: [file] } });

    expect(screen.getByText("sku-main.jpg")).toBeInTheDocument();
    expect(screen.getByText(/validation passed/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /upload image/i }));

    expect(await screen.findByText("img_org_1_sku_main_jpg")).toBeInTheDocument();
    expect(createImageAsset).toHaveBeenCalledWith({ file, organizationId: "org_1" });
    expect(screen.getByRole("button", { name: /copy image id/i })).toBeEnabled();
  });

  it("rejects unsupported files before upload and does not issue an image_id", async () => {
    renderImageAssetsRoute();

    fireEvent.change(await screen.findByLabelText(/select product image/i), {
      target: { files: [new File(["text"], "supplier-notes.txt", { type: "text/plain" })] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/unsupported image type/i);
    expect(screen.getByRole("button", { name: /upload image/i })).toBeDisabled();
    expect(screen.queryByText(/image_id/i)).not.toBeInTheDocument();
    expect(createImageAsset).not.toHaveBeenCalled();
  });

  it("shows server failures without rendering a copyable image_id and allows retry", async () => {
    vi.mocked(createImageAsset).mockRejectedValueOnce({
      code: "UPLOAD_FAILED",
      message: "Image service could not store the asset. Try again.",
    });

    renderImageAssetsRoute();

    fireEvent.change(await screen.findByLabelText(/select product image/i), { target: { files: [imageFile("retry.jpg")] } });
    fireEvent.click(screen.getByRole("button", { name: /upload image/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not store/i);
    expect(screen.queryByText(/image_id/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry upload/i })).toBeEnabled();
  });

  it("keeps the upload workflow keyboard reachable and status messages text-readable", async () => {
    renderImageAssetsRoute();

    const chooser = await screen.findByLabelText(/select product image/i);
    expect(chooser).toHaveAttribute("type", "file");
    expect(screen.getByRole("status")).toHaveTextContent(/choose one supported product image/i);

    fireEvent.change(chooser, { target: { files: [imageFile("keyboard.png", "image/png")] } });
    expect(screen.getByRole("status")).toHaveTextContent(/validation passed/i);

    fireEvent.click(screen.getByRole("button", { name: /upload image/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/upload complete/i));
  });
});
