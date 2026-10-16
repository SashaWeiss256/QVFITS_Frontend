/* Filter Sidebar (from Quivogue shop.html) */
import { X } from "lucide-react";

import Button from "@/components/ui/Button";
import { useCurrency } from "@/store/context/CurrencyContext";
import { cn } from "@/utils/cn";
import FilterChips from "./FilterChips";

/**
 * Category, size, colour and activity chips, a max-price slider and "in stock
 * only". Which groups show, their names and their order are set in the
 * admin (Catalog, Attributes, Shop filters); the options come from what is
 * actually on the rail, in the admin's order. Sticky beside the grid on a laptop; on a
 * phone or tablet a bottom sheet with its own close and "Show N pieces".
 */
export default function FilterSidebar({ filters, products, facets, bounds, open, onClose, count }) {
  const { state, toggle, update, clear } = filters;
  const { money } = useCurrency();

  // Keep the admin's order, but only what is on the rail right now.
  const onRail = (list, values) => list.filter((v) => values.has(v));
  const categories = onRail(facets?.categories ?? [], new Set(products.map((p) => p.category))).map((c) => ({ value: c, label: c }));
  const sizes = onRail(facets?.sizes ?? [], new Set(products.flatMap((p) => Object.keys(p.stock)))).map((s) => ({ value: s, label: s }));
  const usedColors = new Set(products.flatMap((p) => p.colors));
  const colors = (facets?.colors ?? []).filter((c) => usedColors.has(c.name)).map((c) => ({ value: c.name, label: c.name, swatch: c.swatch }));
  const occasions = (facets?.occasions ?? []).map((o) => ({ value: o.id, label: o.label }));

  const groups = {
    category: (title) => <FilterChips key="category" title={title} options={categories} selected={state.cats} onToggle={(v) => toggle("cats", v)} />,
    size: (title) => <FilterChips key="size" title={title} options={sizes} selected={state.sizes} onToggle={(v) => toggle("sizes", v)} />,
    color: (title) => <FilterChips key="color" title={title} options={colors} selected={state.colors} onToggle={(v) => toggle("colors", v)} />,
    activity: (title) => <FilterChips key="activity" title={title} options={occasions} selected={state.occs} onToggle={(v) => toggle("occs", v)} />,
    price: (title) => (
      <div key="price" className="filters__group">
        <h2 className="filters__title">{title}</h2>
        <input className="range" type="range" min="0" max="100" value={pct} onChange={onPrice} aria-label="Maximum price" aria-valuetext={money(state.maxPrice ?? bounds.max)} />
        <div className="range-vals">
          <span>{money(bounds.min)}</span>
          <span>{money(state.maxPrice ?? bounds.max)}</span>
        </div>
      </div>
    ),
  };
  const shown = (facets?.filters.facets ?? []).filter((f) => f.visible && groups[f.id]);

  // The slider runs 0 to 100 across the catalogue's price range; 100 = no cap.
  const pct = state.maxPrice ? Math.round(((state.maxPrice - bounds.min) / (bounds.max - bounds.min)) * 100) : 100;
  const onPrice = (e) => {
    const v = Number(e.target.value) / 100;
    update({ maxPrice: v >= 1 ? null : Math.round(bounds.min + (bounds.max - bounds.min) * v) });
  };

  return (
    <aside className={cn("filters", open && "is-open")} id="filters" aria-label="Filters">
      {/* Sheet head: phones and tablets only */}
      <div className="filters__sheet-head">
        <p className="m-0 font-display text-xl font-bold tracking-tight">Filter</p>
        <button type="button" className="icon-btn" aria-label="Close filters" onClick={onClose}>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {shown.map((f) => groups[f.id](f.label))}

      <div className="filters__group">
        <label className="check-row">
          <input type="checkbox" checked={state.inStock} onChange={(e) => update({ inStock: e.target.checked })} />
          In stock only
        </label>
        <Button variant="soft" block className="mt-4" onClick={clear}>Clear filters</Button>
      </div>

      {/* Sheet foot: phones and tablets only */}
      <div className="filters__sheet-foot">
        <Button block onClick={onClose}>Show {count} {count === 1 ? "piece" : "pieces"}</Button>
      </div>
    </aside>
  );
}
