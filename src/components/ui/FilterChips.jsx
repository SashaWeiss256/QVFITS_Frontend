/* Filter Chips */
import { cn } from "@/utils/cn";

// A row of toggle chips for one filter group. `options` are
// { value, label, swatch?, count? }; a colour shows its swatch, and an
// option that would show nothing (count 0) is greyed out unless it's on.
export default function FilterChips({ title, options, selected, onToggle }) {
  return (
    <div className="chips" role="group" aria-label={title}>
      {options.map((o) => {
        const on = selected.includes(o.value);
        const empty = o.count === 0 && !on;
        return (
          <button key={o.value} type="button" className={cn("chip", on && "is-on")} aria-pressed={on} disabled={empty} onClick={() => onToggle(o.value)}>
            {o.swatch ? (
              <span className="chip--color">
                <i className="sw" style={{ background: o.swatch }} />
                {o.label}
              </span>
            ) : (
              o.label
            )}
            {o.count !== undefined && <span className="chip__n">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
