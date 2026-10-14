/* Side Drawer (from Quivogue renderDrawer()) */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

import CartPanel from "@/components/storefront/CartPanel";
import WishlistPanel from "@/components/storefront/WishlistPanel";
import { useCart } from "@/store/context/CartContext";
import { cn } from "@/utils/cn";
import MenuPanel from "./navbar/MenuPanel";

const TITLES = { cart: "Your bag", wish: "Saved pieces", menu: "Menu" };

/**
 * One drawer for the bag, the saved pieces and the menu, at every width. It
 * lives beside the header, not inside it, so the header's stacking and blur
 * never apply to it.
 */
export default function SideDrawer() {
  const { drawer, closeDrawer } = useCart();
  const { pathname, search } = useLocation();
  const open = Boolean(drawer);

  // Following a link inside the drawer closes it.
  useEffect(() => {
    closeDrawer();
  }, [pathname, search, closeDrawer]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeDrawer]);

  return (
    <>
      <div className={cn("scrim", open && "is-on")} onClick={closeDrawer} />
      <aside className={cn("drawer", open && "is-open")} aria-hidden={!open} aria-labelledby="drawerTitle" role="dialog">
        <div className="drawer__head">
          <h2 id="drawerTitle" className="text-[1.2rem]">{TITLES[drawer] ?? ""}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={closeDrawer}>
            <X className="h-[19px] w-[19px]" aria-hidden="true" />
          </button>
        </div>
        {drawer === "cart" && <CartPanel />}
        {drawer === "wish" && <WishlistPanel />}
        {drawer === "menu" && <MenuPanel />}
      </aside>
    </>
  );
}
