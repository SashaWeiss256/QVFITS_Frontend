/* Scroll To Top */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { glideTo, scrollTop } from "@/utils/smoothScroll";

// A new page starts at the top, or at its #anchor once the section has
// rendered (/shop#kits from the mega menu). Filter changes keep the scroll.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      scrollTop();
      return undefined;
    }
    let tries = 0;
    const find = setInterval(() => {
      const el = document.getElementById(hash.slice(1));
      if (el || ++tries > 30) {
        clearInterval(find);
        if (el) glideTo(el);
      }
    }, 100);
    return () => clearInterval(find);
  }, [pathname, hash]);

  return null;
}
