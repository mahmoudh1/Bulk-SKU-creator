import { batches, rows } from "@/lib/mocks/prototype-data";

export const prototypeBatchId = batches[0]?.id ?? "prototype-batch";
export const prototypeAiBatchId = batches[2]?.id ?? prototypeBatchId;
export const prototypeRowId = rows.find((row) => row.status === "NEEDS_INPUT")?.id ?? rows[0]?.id ?? "prototype-row";
