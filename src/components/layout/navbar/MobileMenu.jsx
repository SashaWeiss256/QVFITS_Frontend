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
import MobileMenuFooter from "./mobileMenu/MobileMenuFooter";
import MobileMenuShop from "./mobileMenu/MobileMenuShop";

/**
 * Phones and tablets only (below 1024px; laptops get the mega menu): a
 * full-height sheet from the left, large links arriving in a stagger, Shop
 * expanding in place, and account and WhatsApp at the foot.
 */
export default function MobileMenu({ open, onClose }) {
  const { pathname, search } = useLocation();
  const { data: nav } = useNavigation();
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
        <div className="mmenu__head">
          <Logo />
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <m.nav className="mmenu__body" aria-label="Main" initial="hidden" animate={open ? "shown" : "hidden"} variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}>
          <m.div variants={revealItem}><MobileMenuShop /></m.div>
          {nav?.header.map((item) => (
            <m.div key={item.path} variants={revealItem}>
              <Link to={item.path} className="mmenu__link">{item.title}</Link>
            </m.div>
          ))}
          <m.div variants={revealItem} className="mmenu__sub">
            {nav?.help.map((l) => <Link key={l.path} to={l.path}>{l.title}</Link>)}
          </m.div>
        </m.nav>
        <MobileMenuFooter />
      </aside>
    </>
  );
}
