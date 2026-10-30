/* Navbar */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import { cn } from "@/utils/cn";
import Logo from "./Logo";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import NavActions from "./NavActions";
import NavLinks from "./NavLinks";
import SearchOverlay from "./SearchOverlay";
import { useMegaMenuHover } from "./useMegaMenuHover";
import { useNavbarChrome } from "./useNavbarChrome";
import { t } from "@/i18n/translate";

const MEGA_ID = "mega-shop";

/**
 * The luxury header: links on the left, the logo centred, four icons on the
 * right, nothing else. On the home page it sits transparent over the hero in
 * ink type and turns solid the moment the page scrolls or the Shop panel
 * opens. Always sticks to the top of the window.
 * Phones and tablets: menu button, centred logo, search and bag.
 */
export default function Navbar() {
  const { pathname } = useLocation();
  const { stuck } = useNavbarChrome();
  const mega = useMegaMenuHover();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Clear over the full-screen hero; solid everywhere else.
  const clear = pathname === "/" && !stuck && !mega.open;

  // "/" opens search, as on most shops, unless you're typing somewhere.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey) return;
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-60 transition-[background-color,color,transform,box-shadow] duration-500 ease-q",
          clear ? "bg-transparent text-cream" : "bg-cream/95 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-md",
        )}
      >
        {/* Bar: links | logo | actions */}
        <div className="wrap grid h-[72px] grid-cols-[1fr_auto_1fr] items-center lg:h-[84px]">
          {/* Start: the menu button on phones, the links on laptops */}
          <div className="flex items-center">
            <button type="button" className="icon-btn -ml-2.5 lg:hidden" aria-label={t("Menu")} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <Menu className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <NavLinks mega={mega} megaId={MEGA_ID} />
          </div>

          {/* Centre: the logo */}
          <Logo tone={clear ? "dark" : "light"} />

          {/* End: search, account, saved, bag */}
          <NavActions onSearch={() => setSearchOpen(true)} />
        </div>

        {/* Shop panel: full width under the bar */}
        <MegaMenu id={MEGA_ID} open={mega.open} onEnter={mega.enter} onLeave={mega.leave} onNavigate={mega.close} />
      </header>
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
