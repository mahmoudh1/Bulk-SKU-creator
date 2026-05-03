import { createBatchFromSpreadsheet } from "@/lib/api-client/batches";
import { createImageAsset } from "@/lib/api-client/image-assets";

export const testOrganizationId = "org_1";
export const testUserId = "user_1";

export function clearLocalIntakeData() {
  window.localStorage.clear();
}

export async function uploadTestImage(filename: string) {
  return createImageAsset({
    organizationId: testOrganizationId,
    file: new File(["image"], filename, { type: "image/jpeg" }),
  });
}

export async function createTestBatch(filename: string, csv: string) {
  return createBatchFromSpreadsheet({
    batchName: "Test intake batch",
    marketplace: "Amazon.eg",
    organizationId: testOrganizationId,
    createdBy: testUserId,
    sourceFile: new File([csv], filename, { type: "text/csv" }),
  });
}

