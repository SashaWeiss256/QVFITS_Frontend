/* Admin Sidebar */
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

import Logo from "@/components/layout/navbar/Logo";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { cn } from "@/utils/cn";
import { ADMIN_NAV } from "../../lib/constants";

// Fixed on desktop; a drawer over a scrim on a phone. Each item shows only
// when the signed-in admin's role (or own overrides) can view its module.
export default function AdminSidebar({ mobileOpen, onClose, badges = {} }) {
  const { can } = useAdminAuth();
  const allowed = (item) => can(item.perm);

  return (
    <>
      {/* Tapping the scrim closes the phone drawer. */}
      <div className={cn("scrim lg:hidden", mobileOpen && "is-on")} onClick={onClose} />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex w-64 flex-col border-r border-line bg-white transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Admin"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo to="/admin" />
          <button type="button" className="icon-btn lg:hidden" aria-label="Close menu" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          {ADMIN_NAV.map((group) => {
            // Drop a group's heading too when the role can see none of its items.
            const items = group.items.filter(allowed);
            if (!items.length) return null;
            return (
              <div key={group.id} className="mt-3">
                {group.label && <p className="eyebrow mb-1 px-3">{group.label}</p>}
                {items.map(({ to, label, icon: Icon, end, perm }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    // Close the phone drawer once a page is picked; harmless on desktop.
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn("flex min-h-11 items-center gap-3 rounded-r-md px-3 text-[.93rem] text-ink-2 hover:bg-brand-50 hover:text-brand-600", isActive && "bg-brand-100 font-semibold text-brand-600")
                    }
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    <span className="flex-1">{label}</span>
                    {badges[perm] > 0 && <span className="rounded-r-pill bg-brand-500 px-1.5 text-[.7rem] font-bold text-white">{badges[perm]}</span>}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
