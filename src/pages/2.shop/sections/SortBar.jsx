/* Shop Bar */
import { SlidersHorizontal } from "lucide-react";

import { SORTS } from "./shopFilters/useShopFilters";

// The count, the phone's Filters button, and the sort menu above the grid.
export default function ShopBar({ count, total, sort, onSort, filtersOpen, onToggleFilters, active }) {
  return (
    <div className="shop-bar">
      <span className="shop-bar__count" aria-live="polite">
        {count} piece{count === 1 ? "" : "s"}{count !== total ? ` of ${total}` : ""}
      </span>
      <button type="button" className="btn btn--ghost filter-toggle" aria-expanded={filtersOpen} aria-controls="filters" onClick={onToggleFilters}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filters{active ? ` (${active})` : ""}
      </button>
      <label className="sr-only" htmlFor="sort">Sort by</label>
      <select id="sort" className="select" value={sort} onChange={(e) => onSort(e.target.value)}>
        {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </div>
  );
}
