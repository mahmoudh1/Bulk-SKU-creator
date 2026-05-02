import { Link } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";
import { prototypeBatchId } from "@/lib/mocks/route-defaults";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Edit2 } from "lucide-react";

const mappings = [
  { source: "Item SKU", target: "sku", confidence: 1.0, sample: "HK-CER-MUG-340-NV" },
  { source: "Title (EN)", target: "product_name", confidence: 0.99, sample: "Stoneware ceramic mug, 340ml, navy" },
  { source: "Brand", target: "brand", confidence: 1.0, sample: "Hearth & Loom" },
  { source: "GTIN", target: "gtin", confidence: 0.97, sample: "6224000128841" },
  { source: "Cat. hint", target: "product_type_hint", confidence: 0.81, sample: "Mug / Drinkware" },
  { source: "Description", target: "long_description", confidence: 0.92, sample: "Hand-glazed stoneware mug with…" },
  { source: "Pkg L (cm)", target: "package_length_cm", confidence: 0.88, sample: "12" },
  { source: "Pkg W (cm)", target: "package_width_cm", confidence: 0.88, sample: "9" },
  { source: "Pkg H (cm)", target: "package_height_cm", confidence: 0.88, sample: "10" },
  { source: "Net wt (g)", target: "net_weight_g", confidence: 0.79, sample: "320" },
  { source: "Capacity", target: "capacity_value", confidence: 0.62, sample: "340" },
  { source: "—", target: "capacity_unit", confidence: 0.0, sample: "(unmapped)" },
];

const issues = [
  { sev: "warn", text: "Capacity unit not mapped — will require confirmation on 11 rows" },
  { sev: "warn", text: "3 SKUs in supplier_extras.csv have no match in main sheet" },
  { sev: "info", text: "612 images matched · 4 unmatched filenames listed below" },
  { sev: "info", text: "Workspace seller defaults applied to all rows (FBA, New, EGP)" },
];

export default function IntakeMapping() {
  return (
    <div className="px-6 py-5 max-w-[1400px]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-xs text-muted-foreground label-mono">Step 2 of 3 · Preprocessing checkpoint</div>
          <h1 className="text-xl font-semibold mt-1">Review intake mapping</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Confirm how source columns map to internal fields before processing continues. Nothing is submitted yet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={appPaths.createBatch}
            className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link
            to={appPaths.batchReview(prototypeBatchId)}
            className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-1.5"
          >
            Continue processing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
        <section className="panel">
          <header className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Detected field mappings</h2>
            <button className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <Edit2 className="h-3 w-3" />
              Edit all
            </button>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left label-mono border-b border-border bg-muted/30">
                  <th className="px-4 py-2 font-normal">Source column</th>
                  <th className="px-2 py-2 font-normal">Internal field</th>
                  <th className="px-2 py-2 font-normal">Sample</th>
                  <th className="px-2 py-2 font-normal text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mappings.map((m) => {
                  const low = m.confidence < 0.7;
                  return (
                    <tr key={m.target} className={low ? "bg-status-needs-input-bg/40" : ""}>
                      <td className="px-4 py-2.5">{m.source}</td>
                      <td className="px-2 py-2.5">
                        <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded-sm">{m.target}</code>
                      </td>
                      <td className="px-2 py-2.5 text-muted-foreground truncate max-w-[260px]">{m.sample}</td>
                      <td className="px-2 py-2.5 text-right">
                        {m.confidence === 0 ? (
                          <span className="text-status-blocked text-xs">unmapped</span>
                        ) : (
                          <span className={`tabular-nums text-xs ${low ? "text-status-needs-input" : "text-foreground"}`}>
                            {(m.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-4">
          <section className="panel">
            <header className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Intake issues</h2>
              <p className="text-xs text-muted-foreground">Resolve before processing continues</p>
            </header>
            <ul className="divide-y divide-border">
              {issues.map((i, idx) => (
                <li key={idx} className="flex items-start gap-2.5 px-4 py-3 text-sm">
                  {i.sev === "warn" ? (
                    <AlertCircle className="h-4 w-4 mt-0.5 text-status-needs-input shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-status-ready shrink-0" />
                  )}
                  <span>{i.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <header className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Row preview · first 4</h2>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="label-mono border-b border-border bg-muted/30">
                    <th className="px-3 py-2 font-normal text-left">SKU</th>
                    <th className="px-2 py-2 font-normal text-left">Name</th>
                    <th className="px-2 py-2 font-normal text-left">Brand</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["HK-CER-MUG-340-NV", "Stoneware mug, 340ml, navy", "Hearth & Loom"],
                    ["HK-CER-MUG-340-CR", "Stoneware mug, 340ml, cream", "Hearth & Loom"],
                    ["HK-GLS-CAR-1L", "Glass carafe 1L", "Hearth & Loom"],
                    ["HK-WOD-CTB-30", "Acacia cutting board, 30cm", "Hearth & Loom"],
                  ].map((r) => (
                    <tr key={r[0]}>
                      <td className="px-3 py-2 label-mono normal-case">{r[0]}</td>
                      <td className="px-2 py-2">{r[1]}</td>
                      <td className="px-2 py-2 text-muted-foreground">{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
