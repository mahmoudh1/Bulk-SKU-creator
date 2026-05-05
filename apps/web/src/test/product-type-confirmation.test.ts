import { beforeEach, describe, expect, it } from "vitest";

import { correctBatchRow, evaluateBatchReadiness, getBatchRowDetail } from "@/lib/api-client/batches";
import { clearLocalIntakeData, createTestBatch, testOrganizationId, uploadTestImage } from "./intake-test-helpers";

describe("product type confirmation", () => {
  beforeEach(() => {
    clearLocalIntakeData();
  });

  it("requires manual confirmation when product type resolution is ambiguous", async () => {
    const asset = await uploadTestImage("widget.jpg");
    const batch = await createTestBatch("ambiguous-product-type.csv", `sku,name,brand,image_id\nsku-1,Widget,Acme,${asset.image_id}`);

    const evaluation = await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    expect(evaluation.rows[0].readinessState).toBe("NEEDS_INPUT");
    expect(evaluation.rows[0].issueSummaries.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["PRODUCT_TYPE_CONFIRMATION_REQUIRED"]),
    );

    const detail = await getBatchRowDetail({ batchId: batch.batchId, rowId: "src-row-1", organizationId: testOrganizationId });

    expect(detail.productTypeDecision?.confirmationRequired).toBe(true);
    expect(detail.productTypeDecision?.candidates.length).toBeGreaterThan(1);
  });

  it("persists product type confirmation through row revision and clears the ambiguity blocker after revalidation", async () => {
    const asset = await uploadTestImage("widget.jpg");
    const batch = await createTestBatch("confirm-product-type.csv", `sku,name,brand,image_id\nsku-1,Widget,Acme,${asset.image_id}`);

    await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });
    const before = await getBatchRowDetail({ batchId: batch.batchId, rowId: "src-row-1", organizationId: testOrganizationId });

    const chosen = before.productTypeDecision?.candidates[0]?.productType ?? "";

    expect(chosen).not.toBe("");
    expect(before.issueSummaries.map((issue) => issue.code)).toEqual(expect.arrayContaining(["PRODUCT_TYPE_CONFIRMATION_REQUIRED"]));

    const after = await correctBatchRow({
      batchId: batch.batchId,
      rowId: "src-row-1",
      organizationId: testOrganizationId,
      baseRowRevision: before.rowRevision,
      createdBy: "test-user-1",
      patch: { productType: chosen },
    });

    expect(after.rowRevision).toBe(before.rowRevision + 1);
    expect(after.readinessState).toBe("READY");
    expect(after.issueSummaries.map((issue) => issue.code)).not.toEqual(expect.arrayContaining(["PRODUCT_TYPE_CONFIRMATION_REQUIRED"]));
    expect(after.productTypeDecision?.confirmationRequired).toBe(false);
    expect(after.productTypeDecision?.confirmedValue).toBe(chosen);
  });
});

