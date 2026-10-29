/* Nav Links */
import { Link, useLocation } from "react-router-dom";

import { useNavigation } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

// Laptops and desktops only. "Shop" opens the mega menu on hover or click;
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
      {/* Shop: opens the panel */}
      <button
        type="button"
        // Only the bare /shop marks Shop active; a filtered edit marks its own link.
        className={cn(LINK, (mega.open || (pathname === "/shop" && !search)) && "after:scale-x-100")}
        aria-expanded={mega.open}
        aria-controls={megaId}
        onMouseEnter={mega.enter}
        onMouseLeave={mega.leave}
        onClick={mega.toggle}
      >
        {t("Shop")}
      </button>

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
