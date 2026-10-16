/* Applied Filters */
import { X } from "lucide-react";

import { useCurrency } from "@/store/context/CurrencyContext";

/**
 * What is narrowing the rail right now, as removable chips above the grid,
 * with "Clear all". Hidden when nothing is applied.
 */
export default function AppliedFilters({ filters, facets }) {
  const { state, toggle, update, clear, active } = filters;
  const { money } = useCurrency();
  if (!active) return null;

  const occLabel = (id) => facets?.occasions.find((o) => o.id === id)?.label ?? id;
  const chips = [
    ...state.cats.map((v) => ({ key: `c-${v}`, label: v, off: () => toggle("cats", v) })),
    ...state.sizes.map((v) => ({ key: `s-${v}`, label: `Size ${v}`, off: () => toggle("sizes", v) })),
    ...state.colors.map((v) => ({ key: `co-${v}`, label: v, off: () => toggle("colors", v) })),
    ...state.occs.map((v) => ({ key: `o-${v}`, label: occLabel(v), off: () => toggle("occs", v) })),
    state.maxPrice && { key: "max", label: `Up to ${money(state.maxPrice)}`, off: () => update({ maxPrice: null }) },
    state.inStock && { key: "stock", label: "In stock", off: () => update({ inStock: false }) },
    state.badge && { key: "badge", label: state.badge === "Bestseller" ? "Best sellers" : "New in", off: () => update({ badge: "" }) },
    state.sale && { key: "sale", label: "On sale", off: () => update({ sale: false }) },
    state.query && { key: "q", label: `“${state.query}”`, off: () => update({ q: "" }) },
  ].filter(Boolean);

  return (
    <div className="applied" aria-label="Applied filters">
      {chips.map((c) => (
        <button key={c.key} type="button" className="applied__chip" onClick={c.off} aria-label={`Remove ${c.label}`}>
          {c.label}
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
      <button type="button" className="link-arrow min-h-9 text-sm" onClick={clear}>Clear all</button>
    </div>
  );
}
