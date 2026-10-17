/* Mobile Menu Account */
import { Link } from "react-router-dom";
import { ChevronRight, Heart, PackageSearch, UserRound } from "lucide-react";

import { useCart } from "@/store/context/CartContext";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useWishlist } from "@/store/context/WishlistContext";

/**
 * The account block of the phone menu, under the shop links. Signed in: a
 * card with the shopper's initials that opens their account. Signed out: a
 * welcome and the two ways in. Under it, two icon tiles for what shoppers
 * reach for most: saved pieces (opens the saved drawer, with its count) and
 * tracking an order.
 */
export default function MobileMenuAccount({ onNavigate }) {
  const { customer } = useCustomerAuth();
  const { openDrawer } = useCart();
  const { count } = useWishlist();
  const initials = customer?.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mmenu__acct">
      {/* Signed in or out */}
      {customer ? (
        <Link to="/account" className="mmenu__me">
          <span className="mmenu__avatar" aria-hidden="true">{initials}</span>
          <span className="min-w-0 flex-1">
            <b className="block truncate">{customer.name}</b>
            <span className="block truncate text-[.82rem] text-ink-3">Your account and orders</span>
          </span>
          <ChevronRight className="h-5 w-5 text-ink-3" aria-hidden="true" />
        </Link>
      ) : (
        <div className="mmenu__join">
          <div className="flex items-center gap-3.5">
            <span className="mmenu__avatar mmenu__avatar--soft" aria-hidden="true"><UserRound className="h-5 w-5" /></span>
            <div>
              <b className="block text-[1rem]">Welcome to QVFITS</b>
              <span className="block text-[.84rem] text-ink-3">Track orders and keep saved pieces on every device.</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Link to="/login" className="btn btn--primary">Sign in</Link>
            <Link to="/signup" className="btn btn--ghost">Create account</Link>
          </div>
        </div>
      )}
      {/* Shortcuts: an icon above its label, so they read as tiles to tap */}
      <div className="mmenu__quick">
        <button type="button" onClick={() => { onNavigate(); openDrawer("wish"); }}>
          <span className="mmenu__ico"><Heart className="h-5 w-5" aria-hidden="true" />{count > 0 && <b className="mmenu__badge">{count}</b>}</span>
          Saved pieces
        </button>
        <Link to="/track-order">
          <span className="mmenu__ico"><PackageSearch className="h-5 w-5" aria-hidden="true" /></span>
          Track an order
        </Link>
      </div>
    </div>
  );
}
