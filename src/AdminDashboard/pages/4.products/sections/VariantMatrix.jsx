/* Variant Matrix */
import { useState } from "react";

import { cn } from "@/utils/cn";

const code = (s) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8);

/** One variant per colour and size picked; stock already typed in is kept. */
function buildVariants(base, colorIds, sizes, previous = []) {
  return colorIds.flatMap((colorId) =>
    sizes.map((size) => {
      const had = previous.find((v) => v.colorId === colorId && v.size === size);
      return had ?? { id: `${base}--${colorId}--${size.toLowerCase()}`, sku: `QV-${code(base)}-${code(colorId).slice(0, 3)}-${code(size)}`, colorId, size, stock: 0 };
    }),
  );
}

/**
 * Colours and sizes for a product, then a grid of stock per colour and size.
 * Each cell is one SKU the shop can sell; 0 shows as sold out in the shop.
 */
export default function VariantMatrix({ product, colors, sizes, onChange }) {
  const [fill, setFill] = useState("");
  // Sizes picked so far; on a saved product, the sizes its variants use.
  const usedSizes = product.sizes ?? sizes.map((s) => s.label).filter((l) => product.variants.some((v) => v.size === l));
  const base = product.slug || product.id || "new";

  const update = (colorIds, sizeLabels) =>
    onChange({ colorIds, sizes: sizeLabels, variants: buildVariants(base, colorIds, sizeLabels, product.variants) });

  const toggleColor = (id) => update(product.colorIds.includes(id) ? product.colorIds.filter((c) => c !== id) : [...product.colorIds, id], usedSizes);
  const toggleSize = (label) => {
    const next = usedSizes.includes(label) ? usedSizes.filter((s) => s !== label) : [...usedSizes, label];
    update(product.colorIds, sizes.map((s) => s.label).filter((l) => next.includes(l)));
  };
  const setStock = (id, stock) => onChange({ variants: product.variants.map((v) => (v.id === id ? { ...v, stock: Math.max(0, Number(stock) || 0) } : v)) });
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
        </div>
      </fieldset>
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-sm font-semibold text-ink-2">Sizes</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button key={s.id} type="button" aria-pressed={usedSizes.includes(s.label)} onClick={() => toggleSize(s.label)} className={cn("chip", usedSizes.includes(s.label) && "is-on")}>{s.label}</button>
          ))}
        </div>
      </fieldset>

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
