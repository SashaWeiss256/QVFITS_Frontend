/* Show More */
import { Plus } from "lucide-react";

/**
 * Under the grid: how far through the list the shopper is (a count and a
 * slim bar) and the button for the next batch. Nothing renders when the
 * whole list already fits. Not endless scrolling: the footer stays
 * reachable and Back from a product lands in the same place.
 */
export default function ShowMore({ shown, total, step, onMore }) {
  if (total <= shown) return null;
  const next = Math.min(step, total - shown);
  return (
    <div className="showmore">
      <p className="showmore__count" role="status">Showing {shown} of {total}</p>
      {/* Progress through the list */}
      <div className="showmore__bar" aria-hidden="true"><span style={{ width: `${(shown / total) * 100}%` }} /></div>
      <button type="button" className="btn btn--ghost" onClick={onMore}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Show {next} more
      </button>
    </div>
  );
}
