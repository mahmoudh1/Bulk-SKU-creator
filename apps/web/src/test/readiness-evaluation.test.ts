import { beforeEach, describe, expect, it } from "vitest";

import { evaluateBatchReadiness, getBatchReadiness } from "@/lib/api-client/batches";
import { clearLocalIntakeData, createTestBatch, testOrganizationId, uploadTestImage } from "./intake-test-helpers";

describe("readiness evaluation", () => {
  beforeEach(() => {
    clearLocalIntakeData();
  });

  it("produces deterministic readiness outcomes for a clean row and preserves timestamps when inputs are unchanged", async () => {
    const asset = await uploadTestImage("lamp.jpg");
    const batch = await createTestBatch("ready.csv", `sku,name,brand,image_id\nsku-1,Lamp,Acme,${asset.image_id}`);

    const first = await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });
    const second = await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    expect(first).toEqual(second);
    expect(first.rows).toHaveLength(1);
    expect(first.rows[0]).toMatchObject({
      rowId: "src-row-1",
      rowRevision: 1,
      readinessState: "READY",
      lifecycleStage: "READY_FOR_SUBMISSION_PREP",
    });
  });

  it("marks rows with unresolved intake/image issues as needing input", async () => {
    const batch = await createTestBatch("needs-correction.csv", "sku,name,brand,image_id\nsku-1,Lamp,Acme,img_missing_lamp");
    const evaluation = await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    expect(evaluation.rows[0].readinessState).toBe("NEEDS_INPUT");
    expect(evaluation.rows[0].lifecycleStage).toBe("NEEDS_CORRECTION");
    expect(evaluation.rows[0].issueSummaries.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["UNRESOLVED_IMAGE_REFERENCE", "IMAGE_ID_NOT_FOUND"]),
    );
  });

  it("persists readiness evaluation results and references R2-backed image evidence via preview endpoints", async () => {
    const asset = await uploadTestImage("chair.jpg");
    const batch = await createTestBatch("ready-chair.csv", `sku,name,brand,image_id\nsku-1,Chair,Acme,${asset.image_id}`);

    const evaluation = await evaluateBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });
    const fetched = await getBatchReadiness({ batchId: batch.batchId, organizationId: testOrganizationId });

    expect(fetched).toEqual(evaluation);
    expect(fetched.rows[0].imageEvidence).toEqual([
      {
        imageId: asset.image_id,
        previewRef: `/api/image-assets/${asset.image_id}/preview`,
      },
    ]);
    expect(fetched.rows[0].imageEvidence[0].previewRef).not.toMatch(/^https?:\/\//i);
  });
});

