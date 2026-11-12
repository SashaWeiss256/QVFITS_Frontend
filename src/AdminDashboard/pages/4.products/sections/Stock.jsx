/* Admin Inventory */
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { History, Upload } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { notify } from "@/store/tanstackStore/notices";
import { colorsResource, productsResource, settingsResource, useCollection, useDocument, useSetVariantStock, useStockMovements } from "@/store/tanstackStore/queries/admin";
import { formatDateTime } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import Drawer from "@/AdminDashboard/components/Drawer";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import { readCsv } from "@/AdminDashboard/lib/csv";

// The reasons the stock log records. A count typed into the table is logged as a restock when it goes up and a correction when it goes down; the other two come from elsewhere.
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
 * new count and it saves to the stock log. Orders,
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
  // The stock log opens in a drawer, so the table keeps the whole width.
  const [logOpen, setLogOpen] = useState(false);
  // The row whose photo is open in the quick look.
  const [peek, setPeek] = useState(null);
  const [drafts, setDrafts] = useState({});
  const file = useRef(null);
  const low = settings?.lowStockAt ?? 2;
  const canEdit = can("products", "edit");

  // One row per colour and size of every product: the unit the shop sells and counts.
  const rows = useMemo(
    () =>
      products.items.flatMap((p) =>
        p.variants.map((v) => {
          const colour = colors.items.find((c) => c.id === v.colorId);
          // The photo tagged to this colour if there is one, else the cover.
          const photo = p.photos.find((x) => x.colorId === v.colorId) ?? p.photos[0];
          return { ...v, productId: p.id, product: p.name, status: p.status, color: colour?.name ?? v.colorId, hex: colour?.hex, photo };
        }),
      ),
    [products.items, colors.items],
  );

  // Saved when the field loses focus, and only if the number actually changed.
  // The number is read from the field itself when it loses focus, so a fast edit never saves a stale draft.
  const save = async (row, typed) => {
    const value = typed ?? drafts[row.id];
    if (value === undefined || Number(value) === row.stock) return;
    await setStock.mutateAsync({ productId: row.productId, variantId: row.id, stock: Number(value), reason: Number(value) > row.stock ? "restock" : "correction" });
    setDrafts((d) => {
      const next = { ...d };
      delete next[row.id];
      return next;
    });
  };

  // A sheet with sku and stock columns; rows with an unknown SKU or no number are skipped, and the result says how many went in.
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

  // The stock cell is an input for someone who may edit, plain text otherwise. Sold out shows red and low shows amber.
  const columns = [
    {
      key: "product",
      label: "Product",
      sort: (r) => r.product,
      // The thumbnail opens a larger look, so a SKU can be matched to the piece without leaving the count.
      render: (r) => (
        <span className="flex items-center gap-3">
          <button
            type="button"
            className="block h-14 w-11 flex-none overflow-hidden rounded-[10px] bg-sand-100 outline-none ring-offset-2 transition-shadow duration-150 hover:shadow-sh-2 focus-visible:ring-2 focus-visible:ring-brand-400"
            aria-label={`Look at ${r.product}, ${r.color}`}
            onClick={(e) => { e.stopPropagation(); setPeek(r); }}
          >
            {r.photo && <Photo photo={r.photo} label={r.product} className="h-full rounded-none" />}
          </button>
          <strong className="font-display">{r.product}</strong>
        </span>
      ),
    },
    { key: "color", label: "Colour", sort: (r) => r.color, render: (r) => <span className="inline-flex items-center gap-2"><i className="sw h-4 w-4 ring-1 ring-line" style={{ background: r.hex }} aria-hidden="true" />{r.color}</span> },
    { key: "size", label: "Size" },
    { key: "sku", label: "SKU", render: (r) => <code className="text-xs text-ink-3">{r.sku}</code> },
    {
      key: "stock",
      label: "Stock",
      align: "right",
      sort: (r) => r.stock,
      render: (r) => {
        const value = drafts[r.id] ?? r.stock;
        const tone = r.stock === 0 ? "text-warn font-semibold" : r.stock <= low ? "text-star font-semibold" : "";
        return canEdit ? (
          <input
            className={`w-20 rounded-[10px] border border-line-2 px-2 py-1.5 text-right ${tone}`}
            inputMode="numeric"
            aria-label={`${r.product} ${r.color} ${r.size} stock`}
            value={value}
            onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value.replace(/\D/g, "") }))}
            onBlur={(e) => save(r, e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        ) : <span className={tone}>{r.stock}</span>;
      },
    },
  ];

  // The newest sixty changes, for the log drawer.
  const recent = movements.slice(0, 60);
  const lowCount = rows.filter((r) => r.stock > 0 && r.stock <= low).length;
  const outCount = rows.filter((r) => r.stock === 0).length;

  return (
    <>
      {/* Page Header: a count of SKUs, those running low and those sold out */}
      <PageHeader
        lede={`${rows.length} SKUs · ${lowCount} running low (${low} or fewer) · ${outCount} sold out.`}
        action={<Button variant="ghost" onClick={() => setLogOpen(true)}><History className="h-4 w-4" aria-hidden="true" /> Stock log{movements.length > 0 && <span className="text-ink-4">{movements.length}</span>}</Button>}
      />
        {/* Stock Table: edit a count in the row, then press Enter or tab away to save it */}
        <Panel>
          <DataTable
            filterDrawer
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
                  <button type="button" className="btn btn--ghost h-11 min-h-0 px-4 text-[.85rem]" onClick={() => file.current?.click()}>
                    <Upload className="h-4 w-4" aria-hidden="true" /> Import a CSV
                  </button>
                  <input ref={file} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files[0] && importCsv(e.target.files[0])} />
                </>
              )
            }
            exportName="inventory"
            exportRow={(r) => ({ sku: r.sku, product: r.product, colour: r.color, size: r.size, stock: r.stock })}
          />
        </Panel>

      {/* Stock Log: every change with who made it and why, orders and returns included */}
      <Drawer open={logOpen} onClose={() => setLogOpen(false)} title="Stock log" subtitle="Every change, with who and why">
        {recent.length ? (
          <ul className="m-0 grid list-none gap-0 divide-y divide-line p-0 text-sm">
            {recent.map((m) => (
              <li key={m.id} className="py-3 first:pt-0">
                <p className="m-0"><strong>{m.productName}</strong> {m.color}, {m.size}: {m.from} to {m.to}</p>
                <p className="m-0 text-xs text-ink-3">{REASON_LABEL[m.reason] ?? m.reason}{m.ref ? ` · ${m.ref}` : ""} · {m.by} · {formatDateTime(m.at)}</p>
              </li>
            ))}
          </ul>
        ) : <p className="m-0 text-sm text-ink-3">Stock changes show here with who made them and why.</p>}
      </Drawer>

      {/* Quick Look: the piece in this colour, larger, with what the row says */}
      <Modal isOpen={Boolean(peek)} onClose={() => setPeek(null)} title={peek ? peek.product : ""} size="sm">
        {peek && (
          <div className="grid gap-4">
            <div className="mx-auto w-full max-w-xs overflow-hidden rounded-[14px] bg-sand-100">
              <div className="relative aspect-[3/4]">{peek.photo ? <Photo photo={peek.photo} label={`${peek.product} in ${peek.color}`} className="absolute inset-0 h-full rounded-none" /> : <p className="m-0 grid h-full place-items-center text-sm text-ink-4">No photo yet</p>}</div>
            </div>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-ink-3">Colour</dt><dd className="m-0 inline-flex items-center gap-2 font-semibold"><i className="sw h-4 w-4 ring-1 ring-line" style={{ background: peek.hex }} aria-hidden="true" />{peek.color}</dd>
              <dt className="text-ink-3">Size</dt><dd className="m-0 font-semibold">{peek.size}</dd>
              <dt className="text-ink-3">SKU</dt><dd className="m-0"><code className="text-xs">{peek.sku}</code></dd>
              <dt className="text-ink-3">In stock</dt><dd className={`m-0 font-semibold ${peek.stock === 0 ? "text-warn" : ""}`}>{peek.stock === 0 ? "Sold out" : peek.stock}</dd>
            </dl>
            <Link className="link-arrow text-sm" to={`/admin/products/${peek.productId}`}>Open the product</Link>
          </div>
        )}
      </Modal>
    </>
  );
}
