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

        {/* View: products per row */}
        {grid.options.length > 1 && (
          <div className="ml-auto flex items-center gap-1 sm:ml-0" role="group" aria-label="Products per row">
            <span className="mr-1 hidden text-[0.85rem] text-ink-3 md:inline">{t("View")}</span>
            {grid.options.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={grid.cols === n}
                aria-label={`${n} per row`}
                title={`${n} per row`}
                onClick={() => grid.setCols(n)}
                className={cn(
                  "grid h-9 w-9 place-items-center transition-colors",
                  grid.cols === n ? "text-ink" : "text-ink-4 hover:text-ink",
                )}
              >
                <ColsIcon n={n} on={grid.cols === n} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// A small picture of the row: n bars side by side, filled when chosen.
function ColsIcon({ n, on }) {
  const gap = 2;
  const w = (20 - gap * (n - 1)) / n;
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={i * (w + gap)} y="0.5" width={w} height="15" rx="0.5" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  );
}
