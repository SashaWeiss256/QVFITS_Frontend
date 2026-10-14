/* Header (from Quivogue buildChrome()) */
import { useEffect, useRef, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import CurrencyPicker from "@/components/storefront/CurrencyPicker";
import { useCart } from "@/store/context/CartContext";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { cn } from "@/utils/cn";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchPanel from "./SearchPanel";

function Count({ n }) {
  return <span className={cn("icon-btn__count", n > 0 && "is-on")}>{n}</span>;
}

export default function Navbar() {
  const { count, openDrawer } = useCart();
  const wishlist = useWishlist();
  const { customer } = useCustomerAuth();
  const [stuck, setStuck] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // The header picks up a rule and a shadow once the page scrolls under it.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleSearch = () => {
    setSearchOpen((open) => !open);
    setTimeout(() => searchRef.current?.focus(), 120);
  };

  return (
    <SearchPanel inputRef={searchRef} onDone={() => setSearchOpen(false)}>
      {(searchField, searchResults) => (
        <header className={cn("hdr", stuck && "is-stuck", searchOpen && "search-open")}>
          <div className="hdr__inner">
            <Logo />
            <NavLinks />
            <div className="hdr__acts">
              <CurrencyPicker />
              <button
                type="button"
                className="icon-btn search__toggle"
                aria-label="Search"
                aria-expanded={searchOpen}
                onClick={toggleSearch}
              >
                <Search className="h-[19px] w-[19px]" aria-hidden="true" />
              </button>
              <Link to={customer ? "/account" : "/login"} className="icon-btn hdr__account" aria-label={customer ? "Your account" : "Sign in"}>
                <UserRound className="h-[19px] w-[19px]" aria-hidden="true" />
              </Link>
              <button type="button" className="icon-btn" aria-label="Wishlist" onClick={() => openDrawer("wish")}>
                <Heart className="h-[19px] w-[19px]" aria-hidden="true" />
                <Count n={wishlist.count} />
              </button>
              <button type="button" className="icon-btn" aria-label="Shopping bag" onClick={() => openDrawer("cart")}>
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                <Count n={count} />
              </button>
              <button type="button" className="icon-btn burger" aria-label="Menu" onClick={() => openDrawer("menu")}>
                <Menu className="h-[21px] w-[21px]" aria-hidden="true" />
              </button>
            </div>
            {searchField}
          </div>
          {searchResults}
        </header>
      )}
    </SearchPanel>
  );
}
