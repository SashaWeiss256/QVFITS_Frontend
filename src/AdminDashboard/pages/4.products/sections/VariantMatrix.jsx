/* Variant Matrix */
import { useState } from "react";

import { cn } from "@/utils/cn";
import { buildVariants, sizesOf } from "@/AdminDashboard/lib/variants";
import QuickAdd from "./QuickAdd";

/**
 * Colours and sizes for a product, then a grid of stock per colour and size.
 * Each cell is one SKU the shop can sell; 0 shows as sold out in the shop.
 * A missing colour or size is made on the spot (`onCreateColor`, `onCreateSize`,
 * left out for someone who may not add them) and ticked for this product.
 */
export default function VariantMatrix({ product, colors, sizes, onChange, onCreateColor, onCreateSize }) {
  // The quantity typed in the "Set all" box.
  const [fill, setFill] = useState("");
  // Sizes picked so far; on a saved product, the sizes its variants use.
  const usedSizes = sizesOf(product, sizes);
  // The base the SKUs are built from; a new product has no address yet, so it uses "new".
  const base = product.slug || product.id || "new";

  // Any change to the colours or sizes rebuilds the grid, keeping the stock already typed for cells that stay.
  const update = (colorIds, sizeLabels) =>
    onChange({ colorIds, sizes: sizeLabels, variants: buildVariants(base, colorIds, sizeLabels, product.variants) });

  // Ticks or unticks a colour.
  const toggleColor = (id) => update(product.colorIds.includes(id) ? product.colorIds.filter((c) => c !== id) : [...product.colorIds, id], usedSizes);
  // Sizes stay in the order the Sizes page lists them, however they are ticked.
  const toggleSize = (label) => {
    const next = usedSizes.includes(label) ? usedSizes.filter((s) => s !== label) : [...usedSizes, label];
    update(product.colorIds, sizes.map((s) => s.label).filter((l) => next.includes(l)));
  };
  // Stock is a whole number, never negative; 0 shows as sold out in the shop.
  const setStock = (id, stock) => onChange({ variants: product.variants.map((v) => (v.id === id ? { ...v, stock: Math.max(0, Number(stock) || 0) } : v)) });
  // A colour made on the spot is ticked for this product straight away.
  const addColor = async (values) => {
    const row = await onCreateColor(values);
    update([...product.colorIds, row.id], usedSizes);
  };
  // A size made on the spot is ticked for this product straight away.
  const addSize = async (values) => {
    const row = await onCreateSize(values);
    update(product.colorIds, [...usedSizes, row.label]);
  };
  const colorName = (id) => colors.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="grid gap-5">
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-sm font-semibold text-ink-2">Colours</legend>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button key={c.id} type="button" aria-pressed={product.colorIds.includes(c.id)} onClick={() => toggleColor(c.id)}
              className={cn("chip chip--color", product.colorIds.includes(c.id) && "is-on")}>
              <i className="sw" style={{ background: c.hex }} aria-hidden="true" /> {c.name}
            </button>
          ))}
          {onCreateColor && <QuickAdd kind="colour" existing={colors.map((c) => c.name)} onCreate={addColor} />}
        </div>
      </fieldset>
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-sm font-semibold text-ink-2">Sizes</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button key={s.id} type="button" aria-pressed={usedSizes.includes(s.label)} onClick={() => toggleSize(s.label)} className={cn("chip", usedSizes.includes(s.label) && "is-on")}>{s.label}</button>
          ))}
          {onCreateSize && <QuickAdd kind="size" existing={sizes.map((s) => s.label)} onCreate={addSize} />}
        </div>
      </fieldset>

      {/* Stock Grid: one cell for each colour and size ticked above, each one SKU the shop can sell */}
      {product.variants.length > 0 && (
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="m-0 mr-auto text-sm font-semibold text-ink-2">Stock per colour and size</p>
            <input className="input w-24 min-h-9 py-1" inputMode="numeric" placeholder="Qty" value={fill} onChange={(e) => setFill(e.target.value)} aria-label="Quantity for every cell" />
            <button type="button" className="btn btn--soft min-h-9 px-3 text-xs" disabled={fill === ""} onClick={() => onChange({ variants: product.variants.map((v) => ({ ...v, stock: Math.max(0, Number(fill) || 0) })) })}>Set all</button>
          </div>
          <div className="overflow-x-auto rounded-r-md border border-line bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="eyebrow px-3 py-2 text-left">Colour</th>
                  {usedSizes.map((s) => <th key={s} scope="col" className="eyebrow px-2 py-2 text-center">{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {product.colorIds.map((cid) => (
                  <tr key={cid} className="border-b border-line last:border-0">
                    <th scope="row" className="px-3 py-2 text-left font-semibold">{colorName(cid)}</th>
                    {usedSizes.map((s) => {
                      const v = product.variants.find((x) => x.colorId === cid && x.size === s);
                      return (
                        <td key={s} className="px-1 py-1.5 text-center">
                          {v && (
                            <input className={cn("w-16 rounded-r-sm border border-line px-2 py-1.5 text-center", v.stock === 0 && "bg-sand-50 text-warn")} inputMode="numeric"
                              aria-label={`${colorName(cid)} ${s} stock`} title={v.sku} value={v.stock} onChange={(e) => setStock(v.id, e.target.value)} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1.5 text-xs text-ink-3">{product.variants.length} SKUs · {product.variants.reduce((n, v) => n + v.stock, 0)} units. Hover a cell for its SKU.</p>
        </div>
      )}
    </div>
  );
}
