/* Side Drawer */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

import CartPanel from "@/components/storefront/CartPanel";
import WishlistPanel from "@/components/storefront/WishlistPanel";
import { useCart } from "@/store/context/CartContext";
import { cn } from "@/utils/cn";
import { useFocusReturn, useOverlayFlag } from "./useOverlayFlag";
import { t } from "@/i18n/translate";

const TITLES = { cart: "Your bag", wish: "Saved pieces" };

/**
 * One slide-over for the bag and the saved pieces, at every width. It slides
 * in from the right over a veil that dims the page, and its contents arrive a
 * beat after the panel so the reveal feels weighted. It lives beside the
 * header, not inside it, so the header's stacking and blur never apply to it.
 * Escape, the veil and the close button all dismiss it, and focus returns to
 * whatever opened it.
 */
export default function SideDrawer() {
  const { drawer, closeDrawer } = useCart();
  const { pathname, search } = useLocation();
  const open = drawer === "cart" || drawer === "wish";
  useOverlayFlag(open);
  useFocusReturn(open);

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
      {/* Veil */}
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-ink/45 backdrop-blur-[2px] transition-opacity duration-500 ease-q",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[71] flex w-[min(100vw,460px)] flex-col bg-cream shadow-[-24px_0_60px_-30px_rgb(23_33_31/0.45)] transition-[transform,visibility] duration-[650ms] ease-q",
          open ? "visible translate-x-0" : "invisible translate-x-full",
        )}
        aria-hidden={!open}
        aria-labelledby="drawerTitle"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5 sm:px-8">
          <h2 id="drawerTitle" className="font-display text-[1.5rem] leading-none">{TITLES[drawer] ?? ""}</h2>
          <button type="button" className="icon-btn -mr-2.5" aria-label={t("Close")} onClick={closeDrawer}>
            <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        {/* Contents rise in a beat after the panel */}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col transition-[opacity,transform] duration-700 ease-q",
            open ? "translate-y-0 opacity-100 delay-200" : "translate-y-3 opacity-0",
          )}
        >
          {drawer === "cart" && <CartPanel />}
          {drawer === "wish" && <WishlistPanel />}
        </div>
      </aside>
    </>
  );
}
