export type Readiness =
  | "READY"
  | "READY_WITH_AUGMENTATION"
  | "NEEDS_INPUT"
  | "NOT_ENOUGH_DATA"
  | "BLOCKED_FOR_REVIEW"
  | "SUBMITTED"
  | "FAILED_SUBMISSION";

export type SubmissionState =
  | "DRAFT"
  | "QUEUED"
  | "PROCESSING"
  | "DELAYED"
  | "RETRYING"
  | "SUCCEEDED"
  | "FAILED"
  | "PARTIAL";

export interface BatchRow {
  id: string;
  sku: string;
  productName: string;
  productType: string;
  productTypeConfidence: number;
  status: Readiness;
  blocker?: string;
  aiState: "NONE" | "DRAFTED" | "ACCEPTED" | "REJECTED" | "ESCALATED";
  imagesCount: number;
  updatedAt: string;
  owner: string;
  gtin?: string;
  brand: string;
  notes?: string;
  failureReason?: string;
}

export interface Batch {
  id: string;
  name: string;
  marketplace: string;
  createdAt: string;
  owner: string;
  totalRows: number;
  ready: number;
  readyAugmented: number;
  needsInput: number;
  blocked: number;
  notEnough: number;
  submission: SubmissionState;
  lastUpdated: string;
}

export const batches: Batch[] = [
  { id: "b_2041", name: "AW25 Home & Kitchen — Wave 3", marketplace: "Amazon.eg", createdAt: "2026-04-22", owner: "Nour A.", totalRows: 248, ready: 162, readyAugmented: 31, needsInput: 28, blocked: 19, notEnough: 8, submission: "DRAFT", lastUpdated: "12 min ago" },
  { id: "b_2039", name: "Beauty restock — Cairo DC", marketplace: "Amazon.eg", createdAt: "2026-04-21", owner: "Hassan M.", totalRows: 96, ready: 84, readyAugmented: 6, needsInput: 4, blocked: 2, notEnough: 0, submission: "PROCESSING", lastUpdated: "3 min ago" },
  { id: "b_2037", name: "Pet supplies Q2 launch", marketplace: "Amazon.eg", createdAt: "2026-04-19", owner: "Lina R.", totalRows: 412, ready: 318, readyAugmented: 44, needsInput: 22, blocked: 18, notEnough: 10, submission: "PARTIAL", lastUpdated: "1 hr ago" },
  { id: "b_2034", name: "Office & stationery refresh", marketplace: "Amazon.eg", createdAt: "2026-04-17", owner: "Karim D.", totalRows: 64, ready: 64, readyAugmented: 0, needsInput: 0, blocked: 0, notEnough: 0, submission: "SUCCEEDED", lastUpdated: "Yesterday" },
  { id: "b_2031", name: "Toys & games — back-to-school", marketplace: "Amazon.eg", createdAt: "2026-04-14", owner: "Nour A.", totalRows: 188, ready: 121, readyAugmented: 22, needsInput: 18, blocked: 24, notEnough: 3, submission: "FAILED", lastUpdated: "2 days ago" },
  { id: "b_2028", name: "Sports & outdoors expansion", marketplace: "Amazon.eg", createdAt: "2026-04-11", owner: "Hassan M.", totalRows: 142, ready: 138, readyAugmented: 4, needsInput: 0, blocked: 0, notEnough: 0, submission: "SUCCEEDED", lastUpdated: "5 days ago" },
];

export const rows: BatchRow[] = [
  { id: "r_88121", sku: "HK-CER-MUG-340-NV", productName: "Stoneware ceramic mug, 340ml, navy", productType: "DRINKING_CUP", productTypeConfidence: 0.94, status: "READY", aiState: "NONE", imagesCount: 4, updatedAt: "08:14", owner: "Nour A.", gtin: "6224000128841", brand: "Hearth & Loom" },
  { id: "r_88122", sku: "HK-CER-MUG-340-CR", productName: "Stoneware ceramic mug, 340ml, cream", productType: "DRINKING_CUP", productTypeConfidence: 0.94, status: "READY_WITH_AUGMENTATION", aiState: "DRAFTED", imagesCount: 4, updatedAt: "08:14", owner: "Nour A.", gtin: "6224000128858", brand: "Hearth & Loom", notes: "Bullets drafted from spec sheet" },
  { id: "r_88123", sku: "HK-GLS-CAR-1L", productName: "Borosilicate glass carafe 1L", productType: "CARAFE", productTypeConfidence: 0.71, status: "NEEDS_INPUT", blocker: "Missing capacity unit confirmation", aiState: "ESCALATED", imagesCount: 3, updatedAt: "08:12", owner: "Nour A.", gtin: "6224000128865", brand: "Hearth & Loom" },
  { id: "r_88124", sku: "HK-WOD-CTB-30", productName: "Acacia wood cutting board, 30cm", productType: "CUTTING_BOARD", productTypeConfidence: 0.88, status: "READY", aiState: "ACCEPTED", imagesCount: 5, updatedAt: "08:10", owner: "Nour A.", gtin: "6224000128872", brand: "Hearth & Loom" },
  { id: "r_88125", sku: "HK-TXT-NPK-04", productName: "Linen blend napkin set, 4-pack, sand", productType: "NAPKIN", productTypeConfidence: 0.82, status: "READY_WITH_AUGMENTATION", aiState: "DRAFTED", imagesCount: 2, updatedAt: "08:09", owner: "Nour A.", gtin: "6224000128889", brand: "Hearth & Loom" },
  { id: "r_88126", sku: "HK-MET-WHS-12", productName: "Stainless steel whisk, 12-inch", productType: "WHISK", productTypeConfidence: 0.97, status: "BLOCKED_FOR_REVIEW", blocker: "GTIN failed checksum validation", aiState: "NONE", imagesCount: 3, updatedAt: "08:07", owner: "Hassan M.", gtin: "6224000128890", brand: "Hearth & Loom" },
  { id: "r_88127", sku: "HK-CER-BWL-18", productName: "Reactive glaze bowl, 18cm, ocean", productType: "BOWL", productTypeConfidence: 0.79, status: "READY", aiState: "ACCEPTED", imagesCount: 4, updatedAt: "08:05", owner: "Nour A.", gtin: "6224000128902", brand: "Hearth & Loom" },
  { id: "r_88128", sku: "HK-CER-BWL-22", productName: "Reactive glaze bowl, 22cm, ocean", productType: "BOWL", productTypeConfidence: 0.79, status: "NOT_ENOUGH_DATA", blocker: "No usable image; 1 file unreadable", aiState: "NONE", imagesCount: 1, updatedAt: "08:03", owner: "Nour A.", brand: "Hearth & Loom" },
  { id: "r_88129", sku: "HK-CER-PLT-26", productName: "Stoneware dinner plate, 26cm, charcoal", productType: "DINNER_PLATE", productTypeConfidence: 0.91, status: "READY", aiState: "NONE", imagesCount: 5, updatedAt: "08:00", owner: "Nour A.", gtin: "6224000128919", brand: "Hearth & Loom" },
  { id: "r_88130", sku: "HK-MET-FRY-26", productName: "Tri-ply stainless frying pan, 26cm", productType: "FRYING_PAN", productTypeConfidence: 0.93, status: "NEEDS_INPUT", blocker: "Material composition incomplete", aiState: "DRAFTED", imagesCount: 4, updatedAt: "07:58", owner: "Hassan M.", gtin: "6224000128926", brand: "Hearth & Loom" },
  { id: "r_88131", sku: "HK-MET-FRY-28", productName: "Tri-ply stainless frying pan, 28cm", productType: "FRYING_PAN", productTypeConfidence: 0.93, status: "FAILED_SUBMISSION", blocker: "Amazon: image #1 below required pixel size", aiState: "ACCEPTED", imagesCount: 4, updatedAt: "07:42", owner: "Hassan M.", gtin: "6224000128933", brand: "Hearth & Loom", failureReason: "IMAGE_RESOLUTION_TOO_LOW (main image 800x800, min 1000x1000)" },
  { id: "r_88132", sku: "HK-TXT-TWL-70", productName: "Turkish cotton bath towel, 70x140, ivory", productType: "BATH_TOWEL", productTypeConfidence: 0.95, status: "SUBMITTED", aiState: "ACCEPTED", imagesCount: 6, updatedAt: "07:30", owner: "Nour A.", gtin: "6224000128940", brand: "Hearth & Loom" },
  { id: "r_88133", sku: "HK-WOD-SPC-RK", productName: "Bamboo spice rack, 3-tier", productType: "SPICE_RACK", productTypeConfidence: 0.86, status: "READY_WITH_AUGMENTATION", aiState: "DRAFTED", imagesCount: 3, updatedAt: "07:25", owner: "Lina R.", gtin: "6224000128957", brand: "Hearth & Loom" },
  { id: "r_88134", sku: "HK-PLS-STR-2L", productName: "Airtight pantry container, 2L, square", productType: "FOOD_STORAGE_CONTAINER", productTypeConfidence: 0.84, status: "READY", aiState: "NONE", imagesCount: 4, updatedAt: "07:20", owner: "Lina R.", gtin: "6224000128964", brand: "Hearth & Loom" },
];

export const submissionEvents = [
  { ts: "08:42:11", level: "info", message: "Batch submission queued (193 rows eligible, 55 excluded)" },
  { ts: "08:42:14", level: "info", message: "Authenticated with Amazon SP-API (eu-west-1)" },
  { ts: "08:42:18", level: "info", message: "Feed POST_PRODUCT_DATA accepted, feedId 50029847221" },
  { ts: "08:43:02", level: "warn", message: "Amazon reports throttling, backoff 30s" },
  { ts: "08:44:12", level: "info", message: "182 rows accepted, processing on Amazon side" },
  { ts: "08:46:50", level: "warn", message: "11 rows delayed by external service" },
  { ts: "08:51:03", level: "error", message: "8 rows failed validation on Amazon side" },
  { ts: "08:53:40", level: "info", message: "Auto-retry scheduled for 3 transient failures" },
];

export const auditEvents = [
  { ts: "08:14", actor: "Nour A.", action: "Accepted AI-drafted bullets", target: "r_88122" },
  { ts: "08:12", actor: "system", action: "Escalated to stronger model (low confidence)", target: "r_88123" },
  { ts: "08:10", actor: "Nour A.", action: "Set product type override → CUTTING_BOARD", target: "r_88124" },
  { ts: "08:07", actor: "validator", action: "GTIN checksum failed", target: "r_88126" },
  { ts: "08:03", actor: "image-svc", action: "Rejected 1 image (corrupt JPEG)", target: "r_88128" },
];
