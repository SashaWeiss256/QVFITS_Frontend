/* Mobile Filter Bar */
import { SlidersHorizontal } from "lucide-react";

// Phones and tablets: a floating "Filter" pill at the foot of the screen,
// always in reach while browsing the grid. Opens the filter sheet.
export default function MobileFilterBar({ active, onOpen }) {
  return (
    <div className="mfilter">
      <button type="button" className="btn btn--primary mfilter__btn" aria-controls="filters" onClick={onOpen}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filter{active ? ` (${active})` : ""}
      </button>
    </div>
  );
}
