/* Account Menu */
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

import { cn } from "@/utils/cn";
import { ACCOUNT_MENU } from "@/utils/accountMenuItems";

// A scrolling row of tabs on phones, a vertical list from md up. The active
// page is lifted to white with a brand edge so the shopper always knows where they are.
export default function AccountMenu({ onSignOut }) {
  const base = "flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap px-4 text-[.93rem] transition-colors";
  return (
    <nav aria-label="Account" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {ACCOUNT_MENU.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(base, isActive ? "bg-white font-medium text-ink shadow-[inset_2px_0_0_var(--color-brand-500)]" : "text-ink-2 hover:bg-white/70 hover:text-ink")
          }
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
      {/* Sign out sits in the menu but is an action, not a route. */}
      <button type="button" onClick={onSignOut} className={cn(base, "text-left text-ink-3 hover:bg-white/70 hover:text-ink md:mt-2 md:border-t md:border-line-2")}>
        <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
        Sign out
      </button>
    </nav>
  );
}
