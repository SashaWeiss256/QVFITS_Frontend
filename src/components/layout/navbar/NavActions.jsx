/* Nav Actions */
import { Link } from "react-router-dom";
import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";

import CurrencyPicker from "@/components/storefront/CurrencyPicker";
import { useCart } from "@/store/context/CartContext";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { cn } from "@/utils/cn";

// The badge stays mounted at 0 and fades in through `is-on`, so it can animate.
function Count({ n }) {
  return <span className={cn("icon-btn__count", n > 0 && "is-on")}>{n}</span>;
}

// Currency, search, account, saved pieces and the bag. Account and saved
// pieces move into the menu on a phone.
export default function NavActions({ onSearch }) {
  const { count, openDrawer } = useCart();
  const wishlist = useWishlist();
  const { customer } = useCustomerAuth();

  return (
    <div className="hdr__acts">
      <CurrencyPicker />
      <button type="button" className="icon-btn" aria-label="Search" onClick={onSearch}>
        <Search className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </button>
      {/* hdr__wide-only: hidden on a phone, where the menu carries these. */}
      <Link to={customer ? "/account" : "/login"} className="icon-btn hdr__wide-only" aria-label={customer ? "Your account" : "Sign in"}>
        <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </Link>
      <button type="button" className="icon-btn hdr__wide-only" aria-label={`Saved pieces (${wishlist.count})`} onClick={() => openDrawer("wish")}>
        <Heart className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        <Count n={wishlist.count} />
      </button>
      <button type="button" className="icon-btn" aria-label={`Shopping bag (${count})`} onClick={() => openDrawer("cart")}>
        <ShoppingBag className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        <Count n={count} />
      </button>
    </div>
  );
}
