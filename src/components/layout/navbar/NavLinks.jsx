/* Nav Links */
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/utils/cn";
import { NAV_ITEMS } from "./navbarMenu";

// A link is active when its path and query both match, so "Shop", "New" and
// "Best Sellers" light up on their own views.
export default function NavLinks() {
  const { pathname, search } = useLocation();
  const here = pathname + search;

  return (
    <nav className="nav" aria-label="Main">
      {NAV_ITEMS.map((item) => (
        <Link key={item.path} to={item.path} className={cn(here === item.path && "is-active")} aria-current={here === item.path ? "page" : undefined}>
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
