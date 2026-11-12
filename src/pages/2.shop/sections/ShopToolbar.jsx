/* Shop Toolbar */
import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/utils/cn";
import SortMenu from "./SortMenu";
import { t } from "@/i18n/translate";

/**
 * One slim bar between hairlines, pinned under the header as the grid
 * scrolls: Filter (with how many are on) and Sort on the left; how many
 * pieces show and View (products per row) on the right. On a phone the
 * count drops away and View keeps its place, so the bar stays one line.
 * View offers only what the screen can hold: 1 or 2 on a phone, 2 or 3 on a
 * tablet, 3 to 5 on a laptop. The admin sets where each screen starts
 * (Settings, Display).
 */
export default function ShopToolbar({ count, total, active, onOpenFilters, sorts, sort, onSort, grid }) {
  return (
    <div className="sticky top-0 z-30 -mx-[clamp(20px,4vw,56px)] mb-8 border-y border-line bg-cream/95 px-[clamp(20px,4vw,56px)] backdrop-blur">
      <div className="flex min-h-14 items-center gap-2 sm:gap-6">
        {/* Filter */}
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 font-display text-[0.92rem] font-semibold transition-colors hover:text-brand-600"
          onClick={onOpenFilters}
          aria-haspopup="dialog"
          aria-controls="shop-filters"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {t("Filter")}
          {active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-[0.7rem] font-semibold text-white">{active}</span>}
        </button>

        <span className="h-5 w-px bg-line-2" aria-hidden="true" />

        {/* Sort */}
        <SortMenu sorts={sorts} value={sort} onChange={onSort} />

        {/* Count */}
        <span className="ml-auto hidden text-[0.85rem] text-ink-3 sm:inline" aria-live="polite">
          {count} {count === 1 ? "piece" : "pieces"}
          {count !== total && <> of {total}</>}
        </span>

        {/* View: products per row, as a small segmented control */}
        {grid.options.length > 1 && (
          <div className="ml-auto flex items-center gap-3 sm:ml-0" role="group" aria-label="Products per row">
            <span className="hidden text-[0.85rem] text-ink-3 md:inline">{t("View")}</span>
            <div className="flex items-center gap-1.5">
              {grid.options.map((n) => {
                const on = grid.cols === n;
                return (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${n} per row`}
                    title={`${n} per row`}
                    onClick={() => grid.setCols(n)}
                    className={cn(
                      "grid h-10 min-w-11 place-items-center rounded-[6px] border bg-white px-2 transition-[border-color,color,box-shadow] duration-200",
                      on ? "border-star text-ink ring-1 ring-star" : "border-line text-ink-4/50 hover:border-line-2 hover:text-ink-3",
                    )}
                  >
                    <ColsIcon n={n} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// A small picture of the row: n tall columns side by side, dark when chosen and faint when not.
function ColsIcon({ n }) {
  const gap = 1.5;
  const w = n === 1 ? 12 : Math.min(n === 2 ? 8 : 5, (20 - gap * (n - 1)) / n);
  const x0 = (20 - (n * w + (n - 1) * gap)) / 2;
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true" fill="currentColor">
      {Array.from({ length: n }, (_, i) => <rect key={i} x={x0 + i * (w + gap)} y="0" width={w} height="16" rx="1" />)}
    </svg>
  );
}
