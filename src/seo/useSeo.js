/* Page Title And Description */
import { useEffect } from "react";

const SITE = "QV FITS";
const DEFAULT_DESCRIPTION = "Premium seamless and seam-fit activewear, swim and lounge wear. Showroom at THE CUBE, Kisementi, Kampala.";

/**
 * Sets the tab title and meta description for a page. `noindex` keeps
 * private pages (account, admin, cart) out of search, as robots.txt does.
 */
export function useSeo({ title, description = DEFAULT_DESCRIPTION, noindex = false } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE} | Activewear, Swim & Lounge, Kampala`;
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex" : "index, follow");
  }, [title, description, noindex]);
}

function setMeta(name, content) {
  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
