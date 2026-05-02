import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Save, History } from "lucide-react";

function Field({ label, hint, children }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-6 py-3.5 border-b border-border last:border-0">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

const Section = ({ title, sub, children }: any) => (
  <section className="panel">
    <header className="px-5 py-3 border-b border-border">
      <h2 className="text-sm font-semibold">{title}</h2>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </header>
    <div className="px-5">{children}</div>
  </section>
);

const Input = (p: any) => <input {...p} className="w-full max-w-md h-9 rounded-sm border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />;
const Select = ({ children, ...p }: any) => <select {...p} className="w-full max-w-md h-9 rounded-sm border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">{children}</select>;

export default function SellerDefaults() {
  return (
    <AppShell breadcrumbs={<span><Link to="/dashboard" className="hover:underline">Dashboard</Link> · Settings · Seller defaults</span>}>
      <div className="px-6 py-5 max-w-[1280px]">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold">Seller defaults</h1>
            <p className="text-sm text-muted-foreground mt-1">Defaults applied to every new row in this workspace. Per-row overrides are always allowed during triage.</p>
          </div>
          <button className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
            <Save className="h-4 w-4" /> Save changes
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-4">
          <div className="space-y-4">
            <Section title="Marketplace" sub="Defaults that apply across all batches in this workspace.">
              <Field label="Marketplace" hint="Workspace is locked to a single marketplace.">
                <Select defaultValue="eg"><option value="eg">Amazon.eg (Egypt)</option></Select>
              </Field>
              <Field label="Currency" hint="Used in price field defaults">
                <Select defaultValue="EGP"><option>EGP</option></Select>
              </Field>
              <Field label="Language" hint="Primary listing language">
                <Select defaultValue="en"><option value="en">English</option><option value="ar">Arabic</option></Select>
              </Field>
            </Section>

            <Section title="Seller defaults" sub="Applied to every row at intake. Operators may override per row.">
              <Field label="Fulfillment channel"><Select defaultValue="fba"><option value="fba">FBA · Cairo DC</option><option value="fbm">FBM (merchant)</option></Select></Field>
              <Field label="Default condition"><Select defaultValue="new"><option value="new">New</option></Select></Field>
              <Field label="Default quantity"><Input type="number" defaultValue={120} /></Field>
              <Field label="Tax category"><Input defaultValue="A_GEN_NOTAX" /></Field>
            </Section>

            <Section title="Product preparation" sub="Optional defaults used when source data is silent on packaging.">
              <Field label="Prep type"><Select defaultValue="none"><option value="none">None</option><option>Polybag</option><option>Bubble wrap</option></Select></Field>
              <Field label="Prep owner"><Select defaultValue="seller"><option value="seller">Seller</option><option>Amazon</option></Select></Field>
              <Field label="Hazmat"><Select defaultValue="not"><option value="not">Not hazmat</option></Select></Field>
            </Section>

            <Section title="Automation guardrails" sub="Controls what AI augmentation and validators are allowed to do.">
              <Field label="AI confidence floor" hint="Below this, suggestions stay drafts and require operator review.">
                <Input type="number" defaultValue={0.75} step={0.01} min={0} max={1} />
              </Field>
              <Field label="Stronger model escalation" hint="Auto-escalate when confidence is below 0.70.">
                <Select defaultValue="auto"><option value="auto">Auto-escalate</option><option>Never</option></Select>
              </Field>
              <Field label="Cost guardrail per batch (USD)" hint="Halt augmentation if cumulative AI cost exceeds limit.">
                <Input type="number" defaultValue={25} />
              </Field>
              <Field label="Allow background-cleaning of images"><Select defaultValue="yes"><option>Yes (truth-preserving only)</option><option>No</option></Select></Field>
            </Section>
          </div>

          <aside className="panel p-4 h-fit sticky top-16">
            <h3 className="text-sm font-semibold flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground"/>Audit</h3>
            <ul className="mt-3 text-xs space-y-3 text-muted-foreground">
              {[
                ["3 days ago", "Lina R.", "Raised confidence floor 0.70 → 0.75"],
                ["12 days ago", "Karim D.", "Switched fulfillment default to FBA"],
                ["1 month ago", "system", "Marketplace locked to Amazon.eg"],
              ].map(([t, who, what], i) => (
                <li key={i}>
                  <div className="text-foreground">{what}</div>
                  <div>{who} · {t}</div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
