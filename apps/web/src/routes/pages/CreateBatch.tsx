import { Link } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";
import { prototypeBatchId } from "@/lib/mocks/route-defaults";
import { Upload, FileSpreadsheet, ImageIcon, CheckCircle2, AlertCircle, ArrowRight, Save } from "lucide-react";

const filesPreview = [
  { name: "AW25_homekitchen_wave3.xlsx", size: "412 KB", status: "ok", note: "248 rows detected · 14 columns mapped" },
  { name: "supplier_extras.csv", size: "38 KB", status: "warn", note: "Will be merged on SKU; 3 SKUs unmatched" },
];

const imagesPreview = [
  { name: "AW25_images.zip", size: "184 MB", status: "ok", note: "612 images · IDs follow SKU_n.jpg pattern" },
];

export default function CreateBatch() {
  return (
    <div className="px-6 py-6 max-w-[1280px]">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Start a new batch</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your spreadsheet and product images. We'll validate, map, and prepare a triage workspace before anything is submitted.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <section className="panel p-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-mono">Batch name</label>
                <input
                  defaultValue="AW25 Home & Kitchen — Wave 4"
                  className="mt-1 w-full h-9 rounded-sm border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="label-mono">Marketplace</label>
                <div className="mt-1 h-9 px-3 rounded-sm border border-border bg-muted/40 text-sm flex items-center justify-between">
                  <span>Amazon.eg</span>
                  <span className="text-[11px] text-muted-foreground">workspace default</span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-status-needs-input shrink-0" />
              <span>
                This workspace is configured for <strong className="text-foreground">new product creation only</strong>. Listings that already
                exist in the catalog will be skipped during preprocessing.
              </span>
            </div>
          </section>

          <section className="panel p-5">
            <header className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" /> Spreadsheet upload
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  XLSX or CSV. Required: SKU, product name, brand. Recommended: GTIN, product type hint.
                </p>
              </div>
            </header>
            <div className="rounded-sm border border-dashed border-border-strong bg-muted/30 p-6 text-center hover:bg-muted/50 transition cursor-pointer">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="mt-2 text-sm font-medium">Drop spreadsheet here</div>
              <div className="text-xs text-muted-foreground">or click to browse · max 25MB</div>
            </div>
            <ul className="mt-3 divide-y divide-border border border-border rounded-sm">
              {filesPreview.map((f) => (
                <li key={f.name} className="px-3 py-2 flex items-center gap-3 text-sm">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{f.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {f.size} · {f.note}
                    </div>
                  </div>
                  {f.status === "ok" ? (
                    <span className="text-xs inline-flex items-center gap-1 text-status-ready">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready
                    </span>
                  ) : (
                    <span className="text-xs inline-flex items-center gap-1 text-status-needs-input">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Review
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-5">
            <header className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" /> Product images
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Upload a ZIP or individual files. Image filenames must reference SKU or row ID.</p>
              </div>
            </header>
            <div className="rounded-sm border border-dashed border-border-strong bg-muted/30 p-6 text-center hover:bg-muted/50 transition cursor-pointer">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="mt-2 text-sm font-medium">Drop images or ZIP here</div>
              <div className="text-xs text-muted-foreground">JPG, PNG · max 500MB total · external URLs are not supported</div>
            </div>
            <ul className="mt-3 divide-y divide-border border border-border rounded-sm">
              {imagesPreview.map((f) => (
                <li key={f.name} className="px-3 py-2 flex items-center gap-3 text-sm">
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{f.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {f.size} · {f.note}
                    </div>
                  </div>
                  <span className="text-xs inline-flex items-center gap-1 text-status-ready">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ready
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex items-center justify-end gap-2">
            <button className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center gap-1.5">
              <Save className="h-4 w-4" /> Save draft
            </button>
            <Link
              to={appPaths.batchMapping(prototypeBatchId)}
              className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-1.5"
            >
              Start analysis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="panel p-4">
            <h3 className="text-sm font-semibold">What happens next</h3>
            <ol className="mt-3 space-y-3 text-sm">
              {[
                "Detect spreadsheet columns and map to internal fields",
                "Match images to SKU rows by filename",
                "Resolve product type and validate GTIN/structure",
                "Run AI augmentation only where source data is sufficient",
                "Open the triage workspace for human review",
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-secondary border border-border grid place-items-center text-[11px] font-medium tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{s}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="panel p-4">
            <h3 className="text-sm font-semibold">Settings applied</h3>
            <dl className="mt-3 text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fulfillment</dt>
                <dd>FBA · Cairo DC</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Default condition</dt>
                <dd>New</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">AI confidence floor</dt>
                <dd>0.75</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Currency</dt>
                <dd>EGP</dd>
              </div>
            </dl>
            <Link to={appPaths.sellerDefaults} className="mt-3 inline-block text-xs text-primary hover:underline">
              Edit seller defaults →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
