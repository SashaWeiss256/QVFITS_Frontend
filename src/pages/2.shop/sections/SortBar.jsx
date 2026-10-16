/* Sort & View Controls Bar */
import { Grid2X2, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";
import { SORTS } from "../useShopFilters";

/**
 * Top toolbar for the Product Listing Page:
 * - Filter toggle (collapses or shows sidebar on desktop; triggers sheet on mobile)
 * - Result piece counter
 * - View density toggle (standard grid vs large editorial grid)
 * - Sort dropdown
 */
export default function SortBar({
  count,
  total,
  sort,
  onSort,
  showFilters,
  onToggleFilters,
  activeFilterCount = 0,
  density = "standard",
  onDensityChange,
}) {
  return (
    <div className="shop-bar mb-6 flex flex-wrap items-center justify-between gap-3 rounded-r-lg border border-line bg-white/80 p-2.5 sm:p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={onToggleFilters}
          className={cn(
            "btn btn--soft min-h-10 px-3.5 py-1.5 text-xs font-semibold sm:text-sm inline-flex items-center gap-2 rounded-r-pill transition-all",
            showFilters && "bg-brand-100 text-brand-700"
          )}
          aria-expanded={showFilters}
          aria-label={showFilters ? "Hide filters" : "Show filters"}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span>{showFilters ? "Hide Filters" : "Filters"}</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Piece count */}
        <span className="shop-bar__count text-xs font-medium text-ink-3 sm:text-sm" aria-live="polite">
          {count} {count === 1 ? "piece" : "pieces"}
          {count !== total && <span className="hidden sm:inline"> of {total}</span>}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Layout Density Switcher (Desktop) */}
        {onDensityChange && (
          <div
            className="hidden sm:flex items-center rounded-r-pill border border-line bg-sand-50 p-0.5"
            role="group"
            aria-label="Grid layout density"
          >
            <button
              type="button"
              className={cn(
                "p-1.5 rounded-full text-ink-3 transition-colors",
                density === "editorial" ? "bg-white text-ink-1 shadow-xs" : "hover:text-ink-1"
              )}
              onClick={() => onDensityChange("editorial")}
              aria-label="2 columns large view"
              aria-pressed={density === "editorial"}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={cn(
                "p-1.5 rounded-full text-ink-3 transition-colors",
                density === "standard" ? "bg-white text-ink-1 shadow-xs" : "hover:text-ink-1"
              )}
              onClick={() => onDensityChange("standard")}
              aria-label="Multi-column standard view"
              aria-pressed={density === "standard"}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Sort Menu */}
        <label className="sr-only" htmlFor="sort">
          Sort by
        </label>
        <select
          id="sort"
          className="select min-h-10 text-xs sm:text-sm py-1.5 pl-3.5 pr-8 bg-sand-50 border-line hover:border-line-2 transition-colors cursor-pointer"
          value={sort}
          onChange={(e) => onSort(e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
