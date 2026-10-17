/* Admin Inventory */
import { useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { notify } from "@/store/tanstackStore/notices";
import { colorsResource, productsResource, settingsResource, useCollection, useDocument, useSetVariantStock, useStockMovements } from "@/store/tanstackStore/queries/admin";
import { formatDateTime } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import { readCsv } from "@/AdminDashboard/lib/csv";

const REASONS = [
  { value: "restock", label: "Restock" },
  { value: "correction", label: "Count correction" },
  { value: "sale", label: "Sold in the showroom" },
  { value: "damaged", label: "Damaged or lost" },
];
// Reasons the shop records on its own, for the log.
const REASON_LABEL = {
  ...Object.fromEntries(REASONS.map((r) => [r.value, r.label])),
  order: "Ordered",
  cancel: "Order cancelled",
  return: "Returned",
};

/**
 * Every SKU on one screen: product, colour and size with its stock. Type a
 * new count, pick why, and it saves to the stock log with the reason. Orders,
 * cancellations and returns write to the same log on their own.
 * The CSV import takes a sheet with `sku` and `stock` columns.
 */
export default function Stock() {
  const products = useCollection(productsResource);
  const colors = useCollection(colorsResource);
  const { data: settings } = useDocument(settingsResource);
  const { can } = useAdminAuth();
  const setStock = useSetVariantStock();
  const { data: movements = [] } = useStockMovements();
  const [reason, setReason] = useState("restock");
  const [drafts, setDrafts] = useState({});
  const file = useRef(null);
  const low = settings?.lowStockAt ?? 2;
  const canEdit = can("products", "edit");

  const rows = useMemo(
    () =>
      products.items.flatMap((p) =>
        p.variants.map((v) => ({ ...v, productId: p.id, product: p.name, status: p.status, color: colors.items.find((c) => c.id === v.colorId)?.name ?? v.colorId })),
      ),
    [products.items, colors.items],
  );

  const save = async (row) => {
    const value = drafts[row.id];
    if (value === undefined || Number(value) === row.stock) return;
    await setStock.mutateAsync({ productId: row.productId, variantId: row.id, stock: Number(value), reason });
    setDrafts((d) => {
      const next = { ...d };
      delete next[row.id];
      return next;
    });
  };

  const importCsv = async (f) => {
    const sheet = await readCsv(f);
    let done = 0;
    for (const line of sheet) {
      const row = rows.find((r) => r.sku === line.sku);
      if (!row || line.stock === "" || Number.isNaN(Number(line.stock))) continue;
      await setStock.mutateAsync({ productId: row.productId, variantId: row.id, stock: Number(line.stock), reason: "correction" });
      done++;
    }
    notify(`${done} of ${sheet.length} rows updated${done < sheet.length ? ". Rows without a known SKU were skipped." : "."}`, { tone: "success" });
    if (file.current) file.current.value = "";
  };

  const columns = [
    { key: "product", label: "Product", sort: (r) => r.product, render: (r) => <strong className="font-display">{r.product}</strong> },
    { key: "color", label: "Colour", sort: (r) => r.color },
    { key: "size", label: "Size" },
    { key: "sku", label: "SKU", render: (r) => <code className="text-xs text-ink-3">{r.sku}</code> },
    {
      key: "stock",
      label: "Stock",
      align: "right",
      sort: (r) => r.stock,
      render: (r) => {
        const value = drafts[r.id] ?? r.stock;
        const tone = r.stock === 0 ? "text-warn font-semibold" : r.stock <= low ? "text-[var(--star)] font-semibold" : "";
        return canEdit ? (
          <input
            className={`w-20 rounded-r-sm border border-line-2 px-2 py-1.5 text-right ${tone}`}
            inputMode="numeric"
            aria-label={`${r.product} ${r.color} ${r.size} stock`}
            value={value}
            onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value.replace(/\D/g, "") }))}
            onBlur={() => save(r)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        ) : <span className={tone}>{r.stock}</span>;
      },
    },
  ];

  const recent = movements.slice(0, 8);
  const lowCount = rows.filter((r) => r.stock > 0 && r.stock <= low).length;
  const outCount = rows.filter((r) => r.stock === 0).length;

  return (
    <>
      <PageHeader lede={`${rows.length} SKUs · ${lowCount} running low (${low} or fewer) · ${outCount} sold out.`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Panel>
          <DataTable
            rows={rows}
            loading={products.isLoading}
            columns={columns}
            search={(r) => `${r.product} ${r.color} ${r.size} ${r.sku}`}
            searchLabel="Search product, colour or SKU"
            filters={[
              { id: "level", label: "Stock", options: [{ value: "low", label: "Running low" }, { value: "out", label: "Sold out" }], test: (r, v) => (v === "out" ? r.stock === 0 : r.stock > 0 && r.stock <= low) },
              { id: "status", label: "Product", options: [{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }], test: (r, v) => r.status === v },
            ]}
            toolbar={
              canEdit && (
                <>
                  <label className="flex items-center gap-2 text-sm text-ink-3">
                    Reason
                    <select className="input min-h-11 py-1" value={reason} onChange={(e) => setReason(e.target.value)}>
                      {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </label>
                  <button type="button" className="btn btn--ghost min-h-11 px-4 text-[.85rem]" onClick={() => file.current?.click()}>
                    <Upload className="h-4 w-4" aria-hidden="true" /> Import
                  </button>
                  <input ref={file} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files[0] && importCsv(e.target.files[0])} />
                </>
              )
            }
            exportName="inventory"
            exportRow={(r) => ({ sku: r.sku, product: r.product, colour: r.color, size: r.size, stock: r.stock })}
          />
        </Panel>
        <Panel title="Stock log" hint="Every change, with who and why">
          {recent.length ? (
            <ul className="m-0 grid list-none gap-3 p-0 text-sm">
              {recent.map((m) => (
                <li key={m.id}>
                  <p className="m-0"><strong>{m.productName}</strong> {m.color}, {m.size}: {m.from} to {m.to}</p>
                  <p className="m-0 text-xs text-ink-3">{REASON_LABEL[m.reason] ?? m.reason}{m.ref ? ` · ${m.ref}` : ""} · {m.by} · {formatDateTime(m.at)}</p>
                </li>
              ))}
            </ul>
          ) : <p className="m-0 text-sm text-ink-3">Stock changes show here with who made them and why.</p>}
        </Panel>
      </div>
    </>
  );
}
