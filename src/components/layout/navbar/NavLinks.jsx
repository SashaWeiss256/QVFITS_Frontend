/* Nav Links */
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { useNavigation } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

// Laptops and desktops only. "Shop" is a link to the shop and opens the mega menu on hover;
// the rest are plain links built from the catalogue (admin: Catalog,
// Categories, Menu) and the fixed pages, at most four so the bar stays
// quiet (the phone menu lists them all). Sentence case, a hairline
// underline drawn in on hover and on the current page.
const LINK =
  "relative py-2 text-[0.875rem] font-medium tracking-[0.01em] after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-q hover:after:scale-x-100";

export default function NavLinks({ mega, megaId }) {
  const { pathname, search } = useLocation();
  const { data: nav } = useNavigation();
  // Compare with the query too, since a link may carry one (/shop/sets?show=new).
  const here = pathname + search;

  return (
    <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
      {/* Shop: the word is a link to the whole shop, and the panel opens on hover. A small chevron beside it
          opens the panel for a keyboard or a touch screen, and turns over while it is open. */}
      <span className="inline-flex items-center gap-0.5" onMouseEnter={mega.enter} onMouseLeave={mega.leave}>
        <Link
          to="/shop"
          // Only the bare /shop marks Shop active; a filtered edit marks its own link.
          className={cn(LINK, "after:right-0", (mega.open || (pathname === "/shop" && !search)) && "after:scale-x-100")}
          aria-current={pathname === "/shop" && !search ? "page" : undefined}
          onClick={mega.close}
        >
          {t("Shop")}
        </Link>
        <button
          type="button"
          className="grid h-8 w-6 place-items-center"
          aria-label={t("Shop menu")}
          aria-haspopup="true"
          aria-expanded={mega.open}
          aria-controls={megaId}
          onClick={mega.toggle}
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300 ease-q", mega.open && "rotate-180")} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </span>

      {/* The header links from the catalogue */}
      {nav?.header.slice(0, 4).map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(LINK, here === item.href && "after:scale-x-100")}
          aria-current={here === item.href ? "page" : undefined}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
