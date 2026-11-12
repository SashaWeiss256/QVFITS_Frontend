/* Show More */

/**
 * Under the grid: how far through the list the shopper is (a count over a
 * slim bar) and the button for the next batch. Nothing renders when the
 * whole list already fits. Not endless scrolling: the footer stays
 * reachable and Back from a product lands in the same place.
 */
export default function ShowMore({ shown, total, step, onMore }) {
  if (total <= shown) return null;
  const next = Math.min(step, total - shown);
  return (
    <div className="mt-20 flex max-w-xs flex-col gap-5 sm:mx-auto sm:items-center sm:text-center">
      <p className="text-[0.85rem] text-ink-3" role="status">You have seen {shown} of {total}</p>
      {/* Progress through the list */}
      <div className="h-px w-full bg-line-2" aria-hidden="true">
        <span className="block h-px bg-ink transition-[width] duration-700 ease-q" style={{ width: `${(shown / total) * 100}%` }} />
      </div>
      <button type="button" className="btn btn--ghost mt-2" onClick={onMore}>Show {next} more</button>
    </div>
  );
}
