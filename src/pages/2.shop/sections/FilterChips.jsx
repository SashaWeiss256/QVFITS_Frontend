/* Filter Chips */
import { cn } from "@/utils/cn";

// One filter group: a heading and a row of toggle chips. `options` are
// { value, label, swatch? }; a colour chip shows its swatch.
export default function FilterChips({ title, options, selected, onToggle }) {
  return (
    <div className="filters__group">
      <h2 className="filters__title">{title}</h2>
      <div className="chips" role="group" aria-label={title}>
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button key={o.value} type="button" className={cn("chip", on && "is-on")} aria-pressed={on} onClick={() => onToggle(o.value)}>
              {o.swatch ? (
                <span className="chip--color">
                  <i className="sw" style={{ background: o.swatch }} />
                  {o.label}
                </span>
              ) : (
                o.label
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
