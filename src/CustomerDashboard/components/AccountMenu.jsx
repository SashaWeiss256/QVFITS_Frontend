/* Account Menu */
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

import { cn } from "@/utils/cn";
import { ACCOUNT_MENU } from "../lib/accountMenuItems";

export default function AccountMenu({ onSignOut }) {
  return (
    <nav aria-label="Account" className="flex gap-1 overflow-x-auto md:flex-col">
      {ACCOUNT_MENU.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn("flex min-h-11 items-center gap-3 whitespace-nowrap rounded-r-pill px-4 text-[.93rem] text-ink-2 hover:bg-brand-100 hover:text-brand-600", isActive && "bg-brand-100 font-semibold text-brand-600")
          }
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
      <button type="button" onClick={onSignOut} className="flex min-h-11 items-center gap-3 whitespace-nowrap rounded-r-pill px-4 text-left text-[.93rem] text-ink-3 hover:bg-brand-100 hover:text-brand-600">
        <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
        Sign out
      </button>
    </nav>
  );
}
