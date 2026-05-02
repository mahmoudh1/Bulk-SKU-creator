import { Link } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";
import { prototypeBatchId } from "@/lib/mocks/route-defaults";
import { AlertOctagon, RotateCw, ExternalLink, Wrench } from "lucide-react";

const failed = [
  { id: "r_88131", sku: "HK-MET-FRY-28", title: "Tri-ply stainless frying pan, 28cm", at: "08:51:03", reason: "IMAGE_RESOLUTION_TOO_LOW", message: "Main image is 800×800, Amazon requires ≥1000×1000.", remedy: "Replace main image with high-resolution variant, then retry.", attempts: 1 },
  { id: "r_88126", sku: "HK-MET-WHS-12", title: "Stainless steel whisk, 12-inch", at: "08:51:03", reason: "INVALID_GTIN_CHECKSUM", message: "EAN-13 checksum digit does not match.", remedy: "Correct GTIN in source, or apply GTIN exemption.", attempts: 1 },
  { id: "r_88128", sku: "HK-CER-BWL-22", title: "Reactive glaze bowl, 22cm, ocean", at: "08:51:03", reason: "MISSING_ATTRIBUTE_color_map", message: "Attribute color_map required for product type BOWL.", remedy: "Add color_map value (e.g. 'Blue').", attempts: 0 },
  { id: "r_88123", sku: "HK-GLS-CAR-1L", title: "Borosilicate glass carafe 1L", at: "08:51:03", reason: "PRODUCT_TYPE_MISMATCH", message: "Resolved CARAFE not accepted under Amazon.eg taxonomy v2026.04. Suggest DRINKWARE_OTHER.", remedy: "Override product type and re-validate.", attempts: 0 },
];

export default function FailureRecovery() {
  return (
    <div className="px-6 py-5 max-w-[1400px]">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2"><AlertOctagon className="h-5 w-5 text-status-blocked"/>Failure recovery</h1>
            <p className="text-sm text-muted-foreground mt-1">8 rows failed Amazon-side validation in feed 50029847221. Resolve and retry.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted">Export failure report</button>
            <button className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
              <RotateCw className="h-4 w-4" /> Retry all corrected
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          <section className="panel">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Failed rows</h2>
              <span className="text-xs text-muted-foreground">8 total · grouped by reason</span>
            </header>
            <ul className="divide-y divide-border">
              {failed.map((f, i) => (
                <li key={f.id} className={`px-4 py-3 ${i === 0 ? "bg-status-submitted-bg/40" : "hover:bg-muted/30"} cursor-pointer`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{f.title}</div>
                      <div className="text-[11px] text-muted-foreground label-mono normal-case">{f.id} · {f.sku}</div>
                    </div>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-sm border border-status-blocked-border bg-status-blocked-bg text-status-blocked font-medium shrink-0">{f.reason}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-foreground/80">{f.message}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground tabular-nums">{f.at} · attempt {f.attempts + 1}</span>
                    <button className="ml-auto h-7 px-2 rounded-sm border border-border bg-card hover:bg-muted">Reopen row</button>
                    <button className="h-7 px-2 rounded-sm bg-primary text-primary-foreground">Retry</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className="panel">
            <header className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground"/>Reason chain · r_88131</h2>
            </header>
            <div className="p-4 space-y-4 text-sm">
              <div>
                <div className="label-mono mb-1.5">Failure</div>
                <div className="rounded-sm border border-status-blocked-border bg-status-blocked-bg/50 p-3 text-foreground">
                  <div className="font-medium">IMAGE_RESOLUTION_TOO_LOW</div>
                  <div className="text-xs text-muted-foreground mt-1">Main image is 800×800. Amazon.eg requires ≥1000×1000 for catalog imagery.</div>
                </div>
              </div>
              <div>
                <div className="label-mono mb-1.5">Affected payload</div>
                <pre className="text-[11px] bg-muted/60 border border-border rounded-sm p-3 overflow-x-auto"><code>{`POST /feeds/2021-06-30/feeds
attribute: main_image
value: cdn://b_2041/r_88131/img_1.jpg
detected: 800x800 (jpg, sRGB)
required: >=1000x1000`}</code></pre>
              </div>
              <div>
                <div className="label-mono mb-1.5">Suggested remediation</div>
                <ol className="text-foreground space-y-1 list-decimal pl-4">
                  <li>Open image plan and replace img_1 with high-resolution master.</li>
                  <li>If unavailable, request re-shoot from supplier.</li>
                  <li>Re-run row validation, then retry submission.</li>
                </ol>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Link to={appPaths.batchRow(prototypeBatchId, failed[0].id)} className="h-8 px-2.5 rounded-sm bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1">Reopen row <ExternalLink className="h-3 w-3"/></Link>
                <button className="h-8 px-2.5 rounded-sm border border-border bg-card text-xs hover:bg-muted">Mark as won't fix</button>
              </div>
            </div>
          </aside>
        </div>
    </div>
  );
}
