/* Tabs */
import { cn } from "@/utils/cn";

// Sections of one module: Colours | Sizes | Activities | Shop filters.
export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={cn("-mb-px min-h-11 border-b-2 px-4 text-sm font-semibold whitespace-nowrap", value === t.id ? "border-brand-500 text-brand-600" : "border-transparent text-ink-3 hover:text-ink")}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 rounded-r-pill bg-brand-50 px-1.5 text-xs">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
