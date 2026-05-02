import { useParams } from "react-router-dom";

import { prototypeBatchId } from "@/lib/mocks/route-defaults";
import { CheckCircle2, AlertCircle, ImageIcon, ShieldCheck, RotateCw, Replace, EyeOff } from "lucide-react";

const images = [
  { id: "img_1", label: "Main", w: 1500, h: 1500, status: "ok", note: "Meets minimum, white background" },
  { id: "img_2", label: "Lifestyle", w: 2000, h: 1333, status: "ok", note: "In-context use" },
  { id: "img_3", label: "Detail", w: 1800, h: 1800, status: "ok", note: "Spout close-up" },
  { id: "img_4", label: "Packaging", w: 1200, h: 1200, status: "warn", note: "Packaging visible — may not be allowed for main image" },
  { id: "img_5", label: "Generated", w: 1500, h: 1500, status: "augmented", note: "Background cleaned (truth-preserving). Original retained." },
  { id: "img_6", label: "Source", w: 800, h: 800, status: "blocked", note: "Below 1000×1000 minimum — cannot submit" },
];

const tone = (s: string) =>
  s === "ok" ? "border-status-ready-border bg-status-ready-bg/40" :
  s === "warn" ? "border-status-needs-input-border bg-status-needs-input-bg/40" :
  s === "augmented" ? "border-status-augmented-border bg-status-augmented-bg/40" :
  "border-status-blocked-border bg-status-blocked-bg/40";

export default function ImagePlan() {
  const { id = prototypeBatchId } = useParams();
  return (
    <div className="px-6 py-5 max-w-[1400px]">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Image plan · r_88123</h1>
            <p className="text-sm text-muted-foreground mt-1">Borosilicate glass carafe 1L · 6 image assets attached</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-3 rounded-sm border border-border bg-card text-sm hover:bg-muted inline-flex items-center gap-1.5"><RotateCw className="h-4 w-4"/>Re-run analysis</button>
            <button className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover">Approve image plan</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-4">
          <section className="panel p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((im) => (
                <div key={im.id} className={`rounded-sm border ${tone(im.status)} overflow-hidden`}>
                  <div className="aspect-square bg-card grid place-items-center text-xs text-muted-foreground border-b border-border relative">
                    <ImageIcon className="h-8 w-8 opacity-30" />
                    <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded-sm bg-background/80 border border-border text-foreground">{im.label}</span>
                    {im.status === "augmented" && <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-sm bg-status-augmented text-white">augmented</span>}
                    {im.status === "blocked" && <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-sm bg-status-blocked text-white">blocked</span>}
                  </div>
                  <div className="p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="label-mono normal-case">{im.id}</span>
                      <span className="text-muted-foreground tabular-nums">{im.w}×{im.h}</span>
                    </div>
                    <p className="mt-1 text-foreground/80">{im.note}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <button className="h-7 px-2 rounded-sm border border-border bg-card hover:bg-muted text-[11px]">Approve</button>
                      <button className="h-7 px-2 rounded-sm border border-border bg-card hover:bg-muted text-[11px] inline-flex items-center gap-1"><Replace className="h-3 w-3"/>Replace</button>
                      <button className="h-7 px-2 rounded-sm border border-border bg-card hover:bg-muted text-[11px] inline-flex items-center gap-1"><EyeOff className="h-3 w-3"/>Suppress</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="panel p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-status-ready"/>Compliance</h3>
              <ul className="mt-3 text-sm space-y-2">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-status-ready"/><span>Main image meets 1000×1000 minimum</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-status-ready"/><span>White background detected on main</span></li>
                <li className="flex items-start gap-2"><AlertCircle className="h-4 w-4 mt-0.5 text-status-needs-input"/><span>Packaging shown in img_4 (may violate main-image policy if used as main)</span></li>
                <li className="flex items-start gap-2"><AlertCircle className="h-4 w-4 mt-0.5 text-status-blocked"/><span>img_6 below resolution minimum — excluded from submission</span></li>
              </ul>
            </section>

            <section className="panel p-4">
              <h3 className="text-sm font-semibold">Evidence & limitations</h3>
              <ul className="mt-3 text-xs space-y-2 text-muted-foreground">
                <li>Background-cleaning is the only allowed transform. Color, geometry, and product attributes are preserved.</li>
                <li>Generated/augmented variants are clearly labelled and revertible.</li>
                <li>External image URLs are out of scope — only assets uploaded to the batch are eligible.</li>
              </ul>
            </section>

            <section className="panel p-4">
              <h3 className="text-sm font-semibold">Request new source image</h3>
              <p className="text-xs text-muted-foreground mt-1">If img_6 is the only available shot of this angle, request a re-shoot from the supplier.</p>
              <button className="mt-3 w-full h-8 rounded-sm border border-border text-sm hover:bg-muted">Open request</button>
            </section>
          </aside>
        </div>
    </div>
  );
}
