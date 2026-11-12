/* Account Button */
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";

import { ACCOUNT_MENU } from "@/utils/accountMenuItems";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useClickOutside } from "@/utils/useClickOutside";
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

const ICON = "h-[19px] w-[19px]";

/**
 * The person icon, laptops only. Signed out it is a plain link to the
 * sign-in page. Signed in it opens a small menu of the account pages and
 * Sign out, so the shopper can reach any of them from anywhere.
 */
export default function AccountButton() {
  const { customer, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  if (!customer) {
    return (
      <Link to="/login" className="icon-btn hover:bg-current/10" aria-label={t("Sign in")}>
        <UserRound className={ICON} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    );
  }

  const initials = customer.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const leave = async () => {
    setOpen(false);
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    // Escape closes the menu and keeps focus on the icon.
    <div className="relative" ref={ref} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <button type="button" className={cn("icon-btn hover:bg-current/10", open && "bg-current/10")} aria-haspopup="menu" aria-expanded={open} aria-label={t("Your account")} onClick={() => setOpen((o) => !o)}>
        <UserRound className={ICON} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {/* Menu: who is signed in, the account pages, sign out */}
      <div className="absolute right-0 top-[calc(100%+12px)] w-72 border border-line bg-sand-100 p-2 text-ink shadow-sh-3" role="menu" hidden={!open}>
        {/* Who is signed in */}
        <div className="flex items-center gap-3 border-b border-line px-3 pb-4 pt-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-[0.72rem] font-medium tracking-wider text-cream" aria-hidden="true">{initials}</span>
          <div className="min-w-0">
            <p className="truncate font-display text-[1.1rem] leading-tight">{customer.name}</p>
            <p className="truncate text-[0.8rem] text-ink-3">{customer.email}</p>
          </div>
        </div>

        {/* Account pages */}
        <div className="py-1.5">
          {ACCOUNT_MENU.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} role="menuitem" className="flex min-h-11 items-center gap-3 px-3 text-[0.88rem] text-ink-2 transition-colors hover:bg-sand-50 hover:text-ink" onClick={() => setOpen(false)}>
              <Icon className="h-[16px] w-[16px]" strokeWidth={1.5} aria-hidden="true" /> {label}
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <button type="button" role="menuitem" className="flex min-h-11 w-full items-center gap-3 border-t border-line px-3 text-[0.88rem] text-ink-3 transition-colors hover:text-warn" onClick={leave}>
          <LogOut className="h-[16px] w-[16px]" strokeWidth={1.5} aria-hidden="true" /> Sign out
        </button>
      </div>
    </div>
  );
}
