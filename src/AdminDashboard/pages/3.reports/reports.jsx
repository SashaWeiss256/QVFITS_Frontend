/* Admin Reports */
import { useMemo, useState } from "react";
import { Download, Receipt, RotateCcw, ShoppingBag, Wallet } from "lucide-react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useReports } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import StatCard from "@/AdminDashboard/components/StatCard";
import Tabs from "@/AdminDashboard/components/Tabs";
import { downloadCsv } from "@/AdminDashboard/lib/csv";
import ReportTable from "./sections/ReportTable";
import SalesChart from "./sections/SalesChart";
import { COLUMNS, REPORTS } from "./sections/reportColumns";

const ymd = (d) => d.toISOString().slice(0, 10);

/** The period presets, as on belioras: each one a from and to, both inclusive. */
function presetRange(id) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (id) {
    case "month": return { from: ymd(new Date(Date.UTC(y, m, 1))), to: ymd(now) };
    case "last-month": return { from: ymd(new Date(Date.UTC(y, m - 1, 1))), to: ymd(new Date(Date.UTC(y, m, 0))) };
    case "quarter": return { from: ymd(new Date(Date.UTC(y, m - 2, 1))), to: ymd(now) };
    case "all": return { from: "", to: ymd(now) };
    default: return { from: ymd(new Date(Date.UTC(y, 0, 1))), to: ymd(now) };
  }
}

const PRESETS = [
  { id: "month", label: "This month" },
  { id: "last-month", label: "Last month" },
  { id: "quarter", label: "Last 3 months" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom" },
];

/**
 * The shop's numbers for any period, ready for the accountant: sales by
 * month, every order, what sold, what each discount code did, who bought,
 * and the stock on hand. Every table downloads as CSV.
 */
export default function AdminReports() {
  const [preset, setPreset] = useState("year");
  const [custom, setCustom] = useState(() => presetRange("month"));
  const [tab, setTab] = useState("sales");
  const range = useMemo(() => (preset === "custom" ? custom : presetRange(preset)), [preset, custom]);
  const { data, isLoading } = useReports(range);
  const { moneyBase } = useCurrency();
  const rows = data?.[tab] ?? [];

  const download = () =>
    downloadCsv(
      `qvfits-${tab}-${range.from || "start"}_to_${range.to}`,
      rows.map((r) => Object.fromEntries(COLUMNS[tab].map(([key, header, kind]) => [kind === "money" ? `${header} (UGX)` : header, r[key]]))),
    );

  return (
    <>
      <PageHeader
        lede="Paid orders in the period. Cancelled and refunded orders are left out of sales; refunds are counted on their own. Stock is as it stands today."
        action={<Button variant="ghost" onClick={download} disabled={!rows.length}><Download className="h-4 w-4" aria-hidden="true" /> Download CSV</Button>}
      />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap rounded-r-pill border border-line-2 bg-white p-0.5" role="group" aria-label="Period">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={preset === p.id}
              onClick={() => setPreset(p.id)}
              className={cn(
                "min-h-9 rounded-r-pill px-3.5 text-[.8rem] font-semibold outline-none transition-[background-color,color] duration-200 ease-q focus-visible:ring-2 focus-visible:ring-brand-300",
                preset === p.id ? "bg-[image:var(--brand-grad)] text-white" : "text-ink-3 hover:text-ink",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex flex-wrap gap-3">
            <Field label="From" type="date" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
            <Field label="To" type="date" value={custom.to} min={custom.from} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
          </div>
        )}
      </div>

      <section aria-label="Totals" className="mb-6 grid grid-cols-1 gap-px overflow-hidden rounded-r-lg border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sales" icon={Wallet} loading={isLoading} value={moneyBase(data?.summary.sales ?? 0)} note="Paid orders, delivery included" />
        <StatCard label="Paid orders" icon={ShoppingBag} loading={isLoading} value={data?.summary.orders ?? 0} note={data ? `${data.summary.unpaid} still awaiting payment` : undefined} />
        <StatCard label="Average order" icon={Receipt} loading={isLoading} value={moneyBase(data?.summary.average ?? 0)} />
        <StatCard label="Refunded" icon={RotateCcw} loading={isLoading} value={moneyBase(data?.summary.refunded ?? 0)} note={data ? `${data.summary.refundedCount} refunds` : undefined} />
      </section>

      <Tabs tabs={REPORTS.map((r) => ({ ...r, count: data?.[r.id]?.length }))} value={tab} onChange={setTab} />
      {tab === "sales" && rows.length > 0 && <SalesChart rows={rows} money={moneyBase} />}
      <Panel flush className={cn(tab === "sales" && rows.length > 0 && "mt-6")}>
        <ReportTable columns={COLUMNS[tab]} rows={rows} loading={isLoading} money={moneyBase} />
      </Panel>
    </>
  );
}
