/* Filter Sidebar (from Quivogue shop.html) */
import Button from "@/components/ui/Button";
import { useCurrency } from "@/store/context/CurrencyContext";
import { cn } from "@/utils/cn";
import ChipGroup from "./ChipGroup";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "One Size"];

/**
 * Category, size, colour and activity chips, a max-price slider and "in stock
 * only". Options come from what is actually on the rail, so a new category
 * or size appears without code. Sticky beside the grid on a laptop; a panel
 * opened by the Filters button on a phone or tablet.
 */
export default function FilterSidebar({ filters, products, facets, bounds, open }) {
  const { state, toggle, update, clear } = filters;
  const { money } = useCurrency();

  const categories = [...new Set(products.map((p) => p.category))].map((c) => ({ value: c, label: c }));
  const sizes = [...new Set(products.flatMap((p) => Object.keys(p.stock)))]
    .sort((a, b) => (SIZE_ORDER.indexOf(a) + 99) % 99 - (SIZE_ORDER.indexOf(b) + 99) % 99)
    .map((s) => ({ value: s, label: s }));
  const swatch = (c) => facets?.colors.find((x) => x.name === c)?.swatch ?? "#ddd";
  const colors = [...new Set(products.flatMap((p) => p.colors))].map((c) => ({ value: c, label: c, swatch: swatch(c) }));
  const occasions = (facets?.occasions ?? []).map((o) => ({ value: o.id, label: o.label }));

  // The slider runs 0 to 100 across the catalogue's price range; 100 = no cap.
  const pct = state.maxPrice ? Math.round(((state.maxPrice - bounds.min) / (bounds.max - bounds.min)) * 100) : 100;
  const onPrice = (e) => {
    const v = Number(e.target.value) / 100;
    update({ maxPrice: v >= 1 ? null : Math.round(bounds.min + (bounds.max - bounds.min) * v) });
  };

  return (
    <aside className={cn("filters", open && "is-open")} id="filters" aria-label="Filters">
      <ChipGroup title="Category" options={categories} selected={state.cats} onToggle={(v) => toggle("cats", v)} />
      <ChipGroup title="Size" options={sizes} selected={state.sizes} onToggle={(v) => toggle("sizes", v)} />
      <ChipGroup title="Colour" options={colors} selected={state.colors} onToggle={(v) => toggle("colors", v)} />
      <ChipGroup title="Activity" options={occasions} selected={state.occs} onToggle={(v) => toggle("occs", v)} />

      {/* Max price */}
      <div className="filters__group">
        <h2 className="filters__title">Max price</h2>
        <input className="range" type="range" min="0" max="100" value={pct} onChange={onPrice} aria-label="Maximum price" aria-valuetext={money(state.maxPrice ?? bounds.max)} />
        <div className="range-vals">
          <span>{money(bounds.min)}</span>
          <span>{money(state.maxPrice ?? bounds.max)}</span>
        </div>
      </div>

      <div className="filters__group">
        <label className="check-row">
          <input type="checkbox" checked={state.inStock} onChange={(e) => update({ inStock: e.target.checked })} />
          In stock only
        </label>
        <Button variant="soft" block className="mt-4" onClick={clear}>Clear filters</Button>
      </div>
    </aside>
  );
}
