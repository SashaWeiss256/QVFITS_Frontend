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
import MobileMenuShop from "./mobileMenu/MobileMenuShop";
import { t } from "@/i18n/translate";

/**
 * Phones and tablets only (below 1024px; laptops get the mega menu): a
 * full-height cream sheet from the left, large serif links arriving in a
 * stagger, Shop expanding in place. Links only: Shop, then the top bar links.
 * Account and saved pieces are header icons; tracking, WhatsApp, language
 * and currency live in the footer.
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
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-90 flex w-[min(92vw,420px)] flex-col bg-cream text-ink transition-transform duration-500 ease-q",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t("Menu")}
        inert={!open}
      >
        {/* Header: the logo and a close button */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-line px-5">
          <Logo />
          <button type="button" className="icon-btn -mr-2.5" aria-label={t("Close menu")} onClick={onClose}>
            <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {/* Menu Links: they arrive one after another as the menu opens */}
        <m.nav
          data-lenis-prevent
          className="flex-1 overflow-y-auto px-5 py-4"
          aria-label="Main"
          initial="hidden"
          animate={open ? "shown" : "hidden"}
          variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
        >
          {/* Shop: the categories and groups, folding open */}
          <m.div variants={revealItem}><MobileMenuShop /></m.div>

          {/* Top bar links, built from the catalogue (see Catalog, Categories, Menu) */}
          {nav?.header.map((item) => (
            <m.div key={item.href} variants={revealItem}>
              <Link to={item.href} className="flex min-h-14 items-center border-b border-line font-display text-[1.6rem] leading-none">{item.title}</Link>
            </m.div>
          ))}

        </m.nav>

      </aside>
    </>
  );
}
