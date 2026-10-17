/* Nav Actions */
import { Heart, Search, ShoppingBag } from "lucide-react";

import CurrencyPicker from "@/components/storefront/CurrencyPicker";
import { useCart } from "@/store/context/CartContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { cn } from "@/utils/cn";
import AccountButton from "./AccountButton";

// The badge stays mounted at 0 and fades in through `is-on`, so it can animate.
function Count({ n }) {
  return <span className={cn("icon-btn__count", n > 0 && "is-on")}>{n}</span>;
}

// Currency, search, account, saved pieces and the bag. Account and saved
// pieces move into the menu on a phone.
export default function NavActions({ onSearch }) {
  const { count, openDrawer } = useCart();
  const wishlist = useWishlist();

  return (
    <div className="hdr__acts">
      {/* The phone header is too narrow for it; the phone menu carries currency instead. */}
      <div className="hdr__wide-only"><CurrencyPicker /></div>
      <button type="button" className="icon-btn" aria-label="Search" onClick={onSearch}>
        <Search className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </button>
      {/* Account is hidden on a phone (hdr__wide-only), where the menu carries it. */}
      <AccountButton />
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
