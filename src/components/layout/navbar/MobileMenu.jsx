/* Mobile Menu */
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { m } from "motion/react";
import { X } from "lucide-react";

import { revealItem } from "@/components/motion/revealVariants";
import { useNavigation } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { useFocusReturn, useOverlayFlag } from "../useOverlayFlag";
import Logo from "./Logo";
import MobileMenuAccount from "./mobileMenu/MobileMenuAccount";
import MobileMenuFooter from "./mobileMenu/MobileMenuFooter";
import MobileMenuShop from "./mobileMenu/MobileMenuShop";

/**
 * Phones and tablets only (below 1024px; laptops get the mega menu): a
 * full-height sheet from the left, large links arriving in a stagger, Shop
 * expanding in place. The shop's own links come first; the shopper's account,
 * saved pieces and order tracking follow; currency and WhatsApp are at the foot.
 * Help pages (size guide, delivery, returns, contact) live in the site footer,
 * not here.
 */
export default function MobileMenu({ open, onClose }) {
  const { pathname, search } = useLocation();
  const { data: nav } = useNavigation();
  // While open, the page behind stops scrolling and the floating buttons step aside.
  useOverlayFlag(open);
  useFocusReturn(open);

  // Following a link closes the menu.
  useEffect(() => {
    onClose();
  }, [pathname, search, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    // Grown into a laptop window: the menu isn't part of that layout.
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = (e) => e.matches && onClose();
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open, onClose]);

  return (
    <>
      <div className={cn("sheet-scrim", open && "is-on")} onClick={onClose} />
      <aside className={cn("sheet mmenu", open && "is-open")} role="dialog" aria-modal="true" aria-label="Menu" inert={!open}>
        {/* Header: the logo and a close button */}
        <div className="mmenu__head">
          <Logo />
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {/* Menu Links: they arrive one after another as the menu opens */}
        <m.nav className="mmenu__body" aria-label="Main" initial="hidden" animate={open ? "shown" : "hidden"} variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}>
          {/* Shop: the categories and groups, folding open */}
          <m.div variants={revealItem}><MobileMenuShop /></m.div>
          {/* Top bar links, built from the catalogue (see Catalog, Categories, Menu) */}
          {nav?.header.map((item) => (
            <m.div key={item.href} variants={revealItem}>
              <Link to={item.href} className="mmenu__link">{item.title}</Link>
            </m.div>
          ))}
          {/* Account comes after the shop's own links: the way in or who is signed in, then saved pieces and tracking */}
          <m.div variants={revealItem}><MobileMenuAccount onNavigate={onClose} /></m.div>
        </m.nav>
        {/* Footer: currency and WhatsApp */}
        <MobileMenuFooter />
      </aside>
    </>
  );
}
