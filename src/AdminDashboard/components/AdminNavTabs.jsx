/* Admin Navigation Tabs */
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

/**
 * Clean sub-navigation tabs for admin domain hubs (Catalog, Sales, Customers, Marketing, Store, Settings).
 * Keeps the sidebar simple while giving 1-click access to sub-features.
 */
export default function AdminNavTabs({ tabs = [] }) {
  if (!tabs.length) return null;

  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cn(
              "-mb-px min-h-11 border-b-2 px-4 text-sm font-semibold whitespace-nowrap transition-colors inline-flex items-center gap-2",
              isActive
                ? "border-brand-500 text-brand-600 font-bold"
                : "border-transparent text-ink-3 hover:text-ink hover:border-line-2"
            )
          }
        >
          {t.icon && <t.icon className="h-4 w-4" aria-hidden="true" />}
          <span>{t.label}</span>
          {t.count !== undefined && t.count > 0 && (
            <span className="rounded-r-pill bg-brand-50 px-1.5 text-xs text-brand-700 font-semibold">
              {t.count}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}
