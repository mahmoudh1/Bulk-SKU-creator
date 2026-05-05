import { describe, expect, it } from "vitest";

import { clearLocalIntakeData, createTestBatch, testOrganizationId, uploadTestImage } from "./intake-test-helpers";
import { correctBatchRow, evaluateBatchReadiness, getBatchRowDetail } from "@/lib/api-client/batches";

describe("row correction + revalidation", () => {
  it("bumps row revision and clears image blockers after correcting image IDs", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("row-corrections.csv", "sku,name,brand,image_id\nsku-1,Lamp,Acme,img_missing_lamp");

    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });
    const before = await getBatchRowDetail({ batchId: batch.batchId, rowId: "src-row-1", organizationId: testOrganizationId });

    expect(before.rowRevision).toBe(1);
    expect(before.issueSummaries.map((issue) => issue.code)).toEqual(expect.arrayContaining(["UNRESOLVED_IMAGE_REFERENCE", "IMAGE_ID_NOT_FOUND"]));

    const after = await correctBatchRow({
      batchId: batch.batchId,
      rowId: "src-row-1",
      organizationId: testOrganizationId,
      baseRowRevision: before.rowRevision,
      patch: {
        imageIds: [asset.image_id],
      },
    });

    expect(after.rowRevision).toBe(2);
    expect(after.rowId).toBe("src-row-1");
    expect(after.sourceRowNumber).toBe(before.sourceRowNumber);
    expect(after.sourceRowKey).toBe(before.sourceRowKey);
    expect(after.issueSummaries.length).toBe(0);
    expect(after.readinessState).toBe("READY");
  });

  it("rejects stale correction attempts", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("row-corrections.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);

    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });
    const before = await getBatchRowDetail({ batchId: batch.batchId, rowId: "src-row-1", organizationId: testOrganizationId });

    await correctBatchRow({
      batchId: batch.batchId,
      rowId: "src-row-1",
      organizationId: testOrganizationId,
      baseRowRevision: before.rowRevision,
      patch: { title: "Lamp updated" },
    });

    await expect(
      correctBatchRow({
        batchId: batch.batchId,
        rowId: "src-row-1",
        organizationId: testOrganizationId,
        baseRowRevision: before.rowRevision,
        patch: { title: "Lamp updated again" },
      }),
    ).rejects.toMatchObject({ code: "INTAKE_FAILED" });
  });

  it("keeps row blocked when correcting to an unknown image ID", async () => {
    clearLocalIntakeData();
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("row-corrections.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);

    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });
    const before = await getBatchRowDetail({ batchId: batch.batchId, rowId: "src-row-1", organizationId: testOrganizationId });

    const after = await correctBatchRow({
      batchId: batch.batchId,
      rowId: "src-row-1",
      organizationId: testOrganizationId,
      baseRowRevision: before.rowRevision,
      patch: {
        imageIds: ["img_missing_again"],
      },
    });

    expect(after.rowRevision).toBe(2);
    expect(after.issueSummaries.map((issue) => issue.code)).toEqual(expect.arrayContaining(["UNRESOLVED_IMAGE_REFERENCE", "IMAGE_ID_NOT_FOUND"]));
    expect(after.readinessState).toBe("NEEDS_INPUT");
  });
});

