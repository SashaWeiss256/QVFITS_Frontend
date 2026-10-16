/* Navbar */
import { useCallback, useEffect, useState } from "react";
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

const MEGA_ID = "mega-shop";

/**
 * Laptop and desktop (1024px up): logo, centred links with the Shop mega
 * menu, icons. Phone and tablet: menu button, centred logo, search and bag;
 * everything else is in the full-height menu. Solid, tucked away while
 * scrolling down and back the moment you scroll up.
 */
export default function Navbar() {
  const { stuck, hidden } = useNavbarChrome();
  const mega = useMegaMenuHover();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

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
      <header className={cn("hdr", stuck && "is-stuck", hidden && !mega.open && "is-hidden")}>
        <div className="hdr__inner">
          <div className="hdr__start">
            <button type="button" className="icon-btn hdr__burger" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <Menu className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden="true" />
            </button>
            <Logo />
          </div>
          <NavLinks mega={mega} megaId={MEGA_ID} />
          <NavActions onSearch={() => setSearchOpen(true)} />
        </div>
        <MegaMenu id={MEGA_ID} open={mega.open} onEnter={mega.enter} onLeave={mega.leave} onNavigate={mega.close} />
      </header>
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
