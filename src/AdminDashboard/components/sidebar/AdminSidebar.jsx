/* Admin Sidebar */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, LogOut, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import Logo from "@/components/layout/navbar/Logo";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { cn } from "@/utils/cn";
import { ADMIN_NAV } from "../../lib/constants";
import { activeNavItem } from "../../lib/navMatch";

/**
 * Fixed on desktop, a drawer on a phone. Links sit in labelled groups that
 * fold away, so the list stays tidy; the group holding the open page always stays open. A group
 * goes when the role can open none of it. The footer holds who is signed
 * in and sign out. Collapsed, the desktop sidebar shows icons only.
 */
// Groups start open; the ones a person folds stay folded (remembered in the
// browser), except the one holding the open page, which never folds.
const OPEN_KEY = "qvfits:admin:nav:folded";

function readOpened() {
  try { return new Set(JSON.parse(localStorage.getItem(OPEN_KEY) ?? "[]")); }
  catch { return new Set(); }
}

export default function AdminSidebar({ mobileOpen, onClose, badges = {}, collapsed, onToggleCollapsed, onSignOut }) {
  const { can, admin } = useAdminAuth();
  const { pathname } = useLocation();
  const active = activeNavItem(pathname);
  const [folded, setFolded] = useState(readOpened);
  const navRef = useRef(null);
  const toggleGroup = (id) =>
    setFolded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(OPEN_KEY, JSON.stringify([...next])); } catch { /* storage refused */ }
      return next;
    });

  // Bring the open page's link into view when it is further down the list.
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [pathname]);
  const initials = (admin?.name ?? "").split(/\s+/).filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "Q";
  const groups = ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => can(i.perm)) })).filter((g) => g.items.length);

  return (
    <>
      {/* Tapping the scrim closes the phone drawer. */}
      <div className={cn("sheet-scrim lg:hidden", mobileOpen && "is-on")} onClick={onClose} />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex flex-col border-r border-line bg-white transition-[transform,width] duration-300 ease-q",
          // Relative, not static: the collapse toggle anchors to the sidebar edge.
          "lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // The phone drawer keeps its full width; only desktop collapses.
          collapsed ? "w-64 lg:w-[72px]" : "w-64",
        )}
        aria-label="Admin navigation"
      >
        {/* Same height as the header, so the two bottom borders line up */}
        <div className={cn("flex h-16 shrink-0 items-center justify-between border-b border-line", collapsed ? "px-4 lg:justify-center lg:px-0" : "px-5")}>
          <span className={cn(collapsed && "lg:hidden")}>
            <Logo to="/admin" />
          </span>
          <span aria-hidden="true" className={cn("hidden h-9 w-9 place-items-center rounded-[14px] bg-[image:var(--brand-grad)] font-display text-[1.05rem] font-bold text-white", collapsed && "lg:grid")}>
            Q
          </span>
          <button type="button" className="icon-btn lg:hidden" aria-label="Close menu" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* On the edge, halfway down, where the sidebar ends. Desktop only. */}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute right-0 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-line bg-white text-ink-3 shadow-sh-1 lg:grid",
            "transition-[color,border-color,box-shadow] duration-200 ease-q hover:border-brand-200 hover:text-brand-600 hover:shadow-sh-2",
            "focus-visible:ring-2 focus-visible:ring-brand-300 outline-none",
            // A bigger hit area than the dot itself.
            "after:absolute after:-inset-2 after:content-['']",
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300 ease-q", collapsed && "rotate-180")} aria-hidden="true" />
        </button>

        <nav ref={navRef} className="flex-1 overflow-y-auto overscroll-contain px-3 py-3" aria-label="Admin">
          {groups.map((group, gi) => {
            const holdsActive = group.items.some((i) => i.to === active?.to);
            const open = !group.label || holdsActive || !folded.has(group.id);
            return (
            <div key={group.id} className={cn(gi > 0 && "mt-3")}>
              {group.label && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    disabled={holdsActive}
                    aria-expanded={open}
                    className={cn(
                      "group/label mb-1 flex w-full items-center justify-between rounded-[10px] px-2 py-2.5 text-[.66rem] font-semibold uppercase tracking-[0.16em] text-ink-4 outline-none",
                      "transition-colors duration-200 hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-default disabled:hover:text-ink-4",
                      collapsed && "lg:sr-only",
                    )}
                  >
                    {group.label}
                    {!holdsActive && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200 ease-q", !open && "-rotate-90")} aria-hidden="true" />}
                  </button>
                  {/* Collapsed: a short rule stands in for the label */}
                  <span aria-hidden="true" className={cn("mx-auto mb-2 hidden h-px w-6 bg-line-2", collapsed && "lg:block")} />
                </>
              )}
              {/* Collapsed to icons, every group shows: the labels are hidden anyway. */}
              <ul className={cn("m-0 grid list-none gap-px p-0", !open && "hidden", !open && collapsed && "lg:grid")}>
                {group.items.map(({ to, label, icon: Icon, perm }) => {
                  const isActive = active?.to === to;
                  const count = badges[perm] ?? 0;
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        title={collapsed ? label : undefined}
                        className={cn(
                          "group relative flex min-h-9 items-center gap-3 rounded-[14px] px-2 text-[.86rem] outline-none",
                          "transition-[background-color,color,box-shadow,transform] duration-200 ease-q active:scale-[0.98]",
                          "focus-visible:ring-2 focus-visible:ring-brand-300",
                          collapsed && "lg:justify-center lg:px-0",
                          isActive
                            ? "bg-brand-50 font-semibold text-brand-600 shadow-[inset_0_0_0_1px_var(--brand-100)]"
                            : "font-medium text-ink-2 hover:bg-cream-2 hover:text-ink",
                        )}
                      >
                        {/* Edge bar: grows in from the middle when the item becomes active */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute inset-y-2 -left-3 w-[3px] rounded-r-full bg-[image:var(--brand-grad)] transition-transform duration-300 ease-q",
                            isActive ? "scale-y-100" : "scale-y-0",
                          )}
                        />
                        {/* Icon tile: brand gradient when active, a small nudge on hover */}
                        <span
                          className={cn(
                            "relative grid h-6 w-6 shrink-0 place-items-center rounded-[10px] transition-[background-color,color,transform] duration-200 ease-q",
                            isActive
                              ? "bg-[image:var(--brand-grad)] text-white shadow-[0_4px_10px_-4px_rgba(150,48,110,.55)]"
                              : "text-ink-3 group-hover:translate-x-0.5 group-hover:text-brand-500",
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={isActive ? 2.1 : 1.8} aria-hidden="true" />
                          {/* Collapsed: the count shrinks to a dot on the tile */}
                          {count > 0 && (
                            <span aria-hidden="true" className={cn("absolute -right-0.5 -top-0.5 hidden h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white", collapsed && "lg:block")} />
                          )}
                        </span>
                        <span className={cn("flex-1 truncate", collapsed && "lg:hidden")}>{label}</span>
                        {count > 0 && (
                          <span
                            className={cn(
                              "min-w-5 rounded-r-pill px-1.5 text-center text-[.68rem] font-bold tabular-nums leading-5 transition-colors duration-200",
                              isActive ? "bg-white text-brand-600 ring-1 ring-brand-200" : "bg-brand-500 text-white",
                              collapsed && "lg:hidden",
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            );
          })}
        </nav>

        {/* Account row: who is signed in, with sign out at the end of the same row */}
        <div className="shrink-0 border-t border-line p-2">
          <div className={cn("flex items-center gap-3 rounded-[14px] p-2", collapsed && "lg:flex-col lg:gap-2 lg:px-0")}>
            {/* Initials inside a thin brand gradient ring */}
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[image:var(--brand-grad)] p-[2px]">
              <span className="grid h-full w-full place-items-center rounded-full bg-white text-[.7rem] font-bold tracking-wider text-brand-600">
                {initials}
              </span>
            </span>
            <span className={cn("grid min-w-0 flex-1 gap-0.5 leading-tight", collapsed && "lg:hidden")}>
              <span className="truncate text-[.86rem] font-semibold text-ink">{admin?.name ?? "Staff"}</span>
              {admin?.role && <span className="truncate text-[.74rem] capitalize text-ink-4">{admin.role}</span>}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              title="Sign out"
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-[14px] text-ink-3 outline-none",
                "transition-[background-color,color,transform] duration-200 ease-q hover:bg-warn/10 hover:text-warn active:scale-95",
                "focus-visible:ring-2 focus-visible:ring-brand-300",
              )}
            >
              <LogOut className="h-[17px] w-[17px]" strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
