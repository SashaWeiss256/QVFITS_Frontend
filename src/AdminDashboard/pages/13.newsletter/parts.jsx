/* Newsletter Shared Parts */
import { AlertTriangle } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * Every newsletter tab reads the same way: one line on what the tab is for,
 * a row of four figures, then the work. These are the small pieces they share.
 */

// The row of figures under a tab's intro: four across on a wide screen, two on a tablet.
export function StatRow({ label, children }) {
  return (
    <section aria-label={label} className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {children}
    </section>
  );
}

// A quiet strip that asks for attention: failed emails, a scheduled send.
export function Notice({ tone = "info", icon: Icon = AlertTriangle, title, children, action }) {
  return (
    <div role="status" className={cn("mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[18px] border px-5 py-4", tone === "warn" ? "border-warn/25 bg-warn/5" : "border-brand-200 bg-brand-50")}>
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", tone === "warn" ? "bg-warn/10 text-warn" : "bg-white text-brand-500")}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[.95rem] font-semibold text-ink">{title}</p>
        {children && <p className="m-0 mt-0.5 text-[.85rem] leading-relaxed text-ink-3">{children}</p>}
      </div>
      {action}
    </div>
  );
}

// A segmented bar with its legend: how the list divides.
export function SplitBar({ parts }) {
  const total = parts.reduce((n, p) => n + p.value, 0);
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-cream-2" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(", ")}>
        {total > 0 && parts.map((p) => <span key={p.label} className={cn("h-full transition-[width] duration-700 ease-q", p.className)} style={{ width: `${(p.value / total) * 100}%` }} />)}
      </div>
      <ul className="m-0 mt-4 flex list-none flex-wrap gap-x-7 gap-y-2 p-0 text-[.85rem] text-ink-3">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", p.className)} aria-hidden="true" />
            {p.label} <strong className="font-semibold tabular-nums text-ink">{p.value}</strong>
            {total > 0 && <span className="text-ink-4">{Math.round((p.value / total) * 100)}%</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// One block of an editor form: a heading and a line on what it does, then its fields.
export function Block({ title, hint, children }) {
  return (
    <section className="grid gap-4 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="m-0 font-display text-[1.02rem] font-semibold tracking-[-0.01em]">{title}</h3>
        {hint && <p className="m-0 mt-1 text-[.84rem] leading-relaxed text-ink-3">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

// "42 of 60", amber once it runs long: subjects that fit a phone's inbox read best.
// eslint-disable-next-line react-refresh/only-export-components
export function count(text, max) {
  const n = (text ?? "").length;
  return `${n} of ${max} characters${n > max ? ". Long ones are cut off in an inbox." : "."}`;
}
