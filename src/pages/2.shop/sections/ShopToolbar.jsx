/* Shop Toolbar */
import { Columns2, Columns3, Columns4, SlidersHorizontal, Square } from "lucide-react";

import SortMenu from "./SortMenu";

const COL_ICON = { 1: Square, 2: Columns2, 3: Columns3, 4: Columns4 };

/**
 * One plain row above the grid. Filter (with how many are on) and Sort sit
 * together on the left, then how many show; how many sit in a row is on
 * the right. It rides under the header as the grid scrolls.
 */
export default function ShopToolbar({ count, total, active, onOpenFilters, sorts, sort, onSort, grid }) {
  return (
    <div className="shop-bar">
      <button type="button" className="btn btn--soft min-h-10 px-4 text-[.88rem]" onClick={onOpenFilters} aria-haspopup="dialog" aria-controls="shop-filters">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filter
        {active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[.7rem] font-bold text-white">{active}</span>}
      </button>
      <SortMenu sorts={sorts} value={sort} onChange={onSort} />

      <span className="shop-bar__count" aria-live="polite">
        {count} {count === 1 ? "result" : "results"}
        {count !== total && <span className="hidden sm:inline"> of {total}</span>}
      </span>

      <div className="gridsize" role="group" aria-label="Products per row">
        {grid.options.map((n) => {
          const Icon = COL_ICON[n];
          return (
            <button key={n} type="button" aria-pressed={grid.cols === n} aria-label={`${n} per row`} title={`${n} per row`} onClick={() => grid.setCols(n)}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
