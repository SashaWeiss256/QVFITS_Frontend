/* Nav Actions */
import { Heart, Search, ShoppingBag } from "lucide-react";

import { useCart } from "@/store/context/CartContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { cn } from "@/utils/cn";
import AccountButton from "./AccountButton";
import { t } from "@/i18n/translate";

// The badge stays mounted at 0 and fades in through `is-on`, so it can animate.
function Count({ n }) {
  return <span className={cn("icon-btn__count", n > 0 && "is-on")}>{n}</span>;
}

const ICON = "h-[19px] w-[19px]";

// Search, account, saved pieces and the bag: four quiet icons and nothing
// else. Currency lives in the footer and the phone menu; account and saved
// pieces move into the menu on a phone.
export default function NavActions({ onSearch }) {
  const { count, openDrawer } = useCart();
  const wishlist = useWishlist();

  return (
    <div className="-mr-2.5 flex items-center justify-end gap-0.5 sm:gap-1">
      {/* Search */}
      <button type="button" className="icon-btn hover:bg-current/10" aria-label={t("Search")} onClick={onSearch}>
        <Search className={ICON} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {/* Account */}
      <AccountButton />

      {/* Saved pieces: tablets and up */}
      <button type="button" className="icon-btn hidden hover:bg-current/10 sm:inline-grid" aria-label={`Saved pieces (${wishlist.count})`} onClick={() => openDrawer("wish")}>
        <Heart className={ICON} strokeWidth={1.5} aria-hidden="true" />
        <Count n={wishlist.count} />
      </button>

      {/* Bag */}
      <button type="button" className="icon-btn hover:bg-current/10" aria-label={`Shopping bag (${count})`} onClick={() => openDrawer("cart")}>
        <ShoppingBag className={ICON} strokeWidth={1.5} aria-hidden="true" />
        <Count n={count} />
      </button>
    </div>
  );
}
