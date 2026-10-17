/* Chip Group */
import { useState } from "react";

import { matchesSearch } from "@/utils/search";
import { cn } from "@/utils/cn";

/**
 * A titled set of choice chips that stays tidy however many there are.
 * Up to `limit` show; the rest fold behind "+N more". A chosen chip is
 * never folded away, so the panel always shows what is picked. Past
 * `searchAbove` chips a small search appears, and typing searches all of
 * them, folded or not. `single` makes it a one-choice radio group.
 */
export default function ChipGroup({ legend, items, isOn, onPick, single = false, limit = 10, searchAbove = 20, error, errorId }) {
  const [all, setAll] = useState(false);
  const [q, setQ] = useState("");

  const searching = q.trim().length > 0;
  const matched = searching ? items.filter((i) => matchesSearch(i.name, q)) : items;
  // Folded: the first `limit`, plus anything chosen further down the list.
  const folded = !all && !searching && items.length > limit;
  const shown = folded ? matched.filter((i, n) => n < limit || isOn(i)) : matched;
  const hidden = matched.length - shown.length;

  return (
    <fieldset className="m-0 border-0 p-0" aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 text-sm font-semibold text-ink-2">{legend}</legend>
      {/* Search: only for long lists */}
      {items.length > searchAbove && (
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${legend.toLowerCase()}`} aria-label={`Search ${legend}`} className="mb-2.5 h-9 w-full rounded-full border border-line-2 bg-white px-4 text-sm" />
      )}
      <div className="flex flex-wrap gap-1.5" role={single ? "radiogroup" : "group"} aria-label={legend}>
        {shown.map((i) => (
          <button key={i.id} type="button" {...(single ? { role: "radio", "aria-checked": isOn(i) } : { "aria-pressed": isOn(i) })} className={cn("chip", isOn(i) && "is-on")} onClick={() => onPick(i)}>{i.name}</button>
        ))}
        {/* Fold control: sits in the row like a chip, but dashed so it reads as an action */}
        {hidden > 0 && <button type="button" className="chip chip--more" onClick={() => setAll(true)}>+{hidden} more</button>}
        {all && !searching && items.length > limit && <button type="button" className="chip chip--more" onClick={() => setAll(false)}>Show less</button>}
        {searching && !matched.length && <span className="text-sm text-ink-3">Nothing matches.</span>}
      </div>
      {error && <p id={errorId} role="alert" className="m-0 mt-1.5 text-xs font-semibold text-warn">{error}</p>}
    </fieldset>
  );
}
