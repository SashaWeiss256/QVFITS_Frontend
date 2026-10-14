/* Scroll To Top */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// A new page starts at the top. Filter changes (?c=, ?q=) keep the scroll.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
}
