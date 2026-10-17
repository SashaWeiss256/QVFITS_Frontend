/* Nav Links */
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { useNavigation } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

// Laptops and desktops only (CSS hides it below 1024px). "Shop" opens the
// mega menu on hover or click; the rest are plain links, edited in the
// admin under Website, Pages and navigation.
export default function NavLinks({ mega, megaId }) {
  const { pathname, search } = useLocation();
  const { data: nav } = useNavigation();
  // Compare with the query too, since a link may carry one (/shop/sets?show=new).
  const here = pathname + search;

  return (
    <nav className="nav" aria-label="Main">
      <button
        type="button"
        // Only the bare /shop marks Shop active; a filtered edit marks its own link.
        className={cn("nav__shop", pathname === "/shop" && !search && "is-active")}
        aria-expanded={mega.open}
        aria-controls={megaId}
        onMouseEnter={mega.enter}
        onMouseLeave={mega.leave}
        onClick={mega.toggle}
      >
        Shop <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {nav?.header.map((item) => (
        <Link key={item.href} to={item.href} className={cn(here === item.href && "is-active")} aria-current={here === item.href ? "page" : undefined}>
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
