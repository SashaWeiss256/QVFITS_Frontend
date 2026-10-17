/* Account Button */
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";

import { ACCOUNT_MENU } from "@/utils/accountMenuItems";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useClickOutside } from "@/utils/useClickOutside";

/**
 * The person icon. Signed out it is a plain link to the sign-in page. Signed
 * in it opens a small menu of the account pages and Sign out, so the shopper
 * can reach any of them from anywhere without first landing on /account.
 */
export default function AccountButton() {
  const { customer, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  if (!customer) {
    return (
      <Link to="/login" className="icon-btn hdr__wide-only" aria-label="Sign in">
        <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
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
    <div className="acct hdr__wide-only" ref={ref} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <button type="button" className={open ? "icon-btn is-open" : "icon-btn"} aria-haspopup="menu" aria-expanded={open} aria-label="Your account" onClick={() => setOpen((o) => !o)}>
        <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </button>
      <div className="acct__menu" role="menu" hidden={!open}>
        {/* Who is signed in */}
        <div className="acct__who">
          <span className="acct__avatar" aria-hidden="true">{initials}</span>
          <div className="min-w-0">
            <p className="acct__name">{customer.name}</p>
            <p className="acct__mail">{customer.email}</p>
          </div>
        </div>
        {/* Account pages */}
        {ACCOUNT_MENU.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} role="menuitem" className="acct__item" onClick={() => setOpen(false)}>
            <Icon className="h-[17px] w-[17px]" aria-hidden="true" /> {label}
          </Link>
        ))}
        <button type="button" role="menuitem" className="acct__item acct__item--out" onClick={leave}>
          <LogOut className="h-[17px] w-[17px]" aria-hidden="true" /> Sign out
        </button>
      </div>
    </div>
  );
}
