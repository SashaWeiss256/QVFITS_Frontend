/* Tabs */
import { cn } from "@/utils/cn";

// Sections of one module: Shop by | Colours | Filter and sort.
export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map((t) => {
        const on = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            className={cn(
              "-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-[.875rem] font-semibold whitespace-nowrap outline-none",
              "transition-[color,border-color] duration-200 ease-q focus-visible:ring-2 focus-visible:ring-brand-300",
              on ? "border-brand-500 text-brand-600" : "border-transparent text-ink-3 hover:border-line-2 hover:text-ink",
            )}
            onClick={() => onChange(t.id)}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn("min-w-5 rounded-r-pill px-1.5 text-center text-[.7rem] leading-5 tabular-nums transition-colors duration-200", on ? "bg-brand-500 text-white" : "bg-cream-2 text-ink-3")}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
