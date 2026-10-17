/* Stat Card */
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * One headline number. `change` is a percentage against the period before;
 * leave it out when there is nothing to compare with, and `note` says why.
 */
export default function StatCard({ label, value, change, note, icon: Icon, loading = false }) {
  // A change arrow shows only when a real percentage was given.
  const hasChange = typeof change === "number" && Number.isFinite(change);
  // Up is green; down is amber, since a dip isn't an error.
  const up = hasChange && change >= 0;

  {/* Card: label and icon, the figure, then the change and a note */}
  return (
    <div className="group bg-white p-5 transition-colors duration-200 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[.7rem] font-semibold uppercase tracking-[0.16em] text-ink-4">{label}</p>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-r-sm bg-brand-50 text-brand-500 transition-colors duration-200 group-hover:bg-brand-100">
            <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          </span>
        )}
      </div>
      {loading ? (
        <span className="skel mt-3 block h-8 w-28 rounded-r-sm" aria-hidden="true" />
      ) : (
        <p className="m-0 mt-3 font-display text-[1.65rem] leading-none font-bold tracking-tight tabular-nums text-ink sm:text-[1.9rem]">{value}</p>
      )}
      <div className="mt-3 flex min-h-5 flex-wrap items-center gap-2 text-[.78rem]">
        {hasChange && (
          <span className={cn("inline-flex items-center gap-1 rounded-r-pill px-2 py-0.5 font-semibold tabular-nums", up ? "bg-success/10 text-success" : "bg-warn/10 text-warn")}>
            {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
            {Math.abs(change)}%
          </span>
        )}
        {note && <span className="text-ink-4">{note}</span>}
      </div>
    </div>
  );
}
