/* Page Title, Description And Share Card */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { DEFAULT_DESCRIPTION, DEFAULT_IMAGE_ALT, DEFAULT_IMAGE_PATH, absolute, canonicalPath, clip, fullTitle } from "./shared";
import { SITE_URL } from "./site";

/**
 * Describes the page to everything that reads it: the tab, search results and
 * the card shown when the link is shared (WhatsApp, Instagram, iMessage, X,
 * Facebook, LinkedIn).
 *
 *   title        the page's own name; the brand is added after it
 *   description  one or two sentences, kept to what search shows
 *   image        a full address for the share card (defaults to the house card)
 *   imageAlt     what the card shows, for screen readers
 *   type         "website" (default) or "product"
 *   product      { price, currency, inStock } for a product, so a share shows the price
 *   jsonLd       structured data: one object or a list of them
 *   noindex      keeps private pages (account, bag, search results) out of search
 *
 * The canonical address is always the path without its query, so a filtered or
 * sorted shop counts as the one page it belongs to. Link previews are read
 * before any script runs, so scripts/seo-prerender.mjs also writes these same
 * tags into each product and shop page at build time.
 */
export function useSeo({ title, description = DEFAULT_DESCRIPTION, image, imageAlt, type = "website", product, jsonLd, noindex = false } = {}) {
  const { pathname } = useLocation();
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";
  const price = product ? `${product.price}|${product.currency ?? "UGX"}|${product.inStock}` : "";

  useEffect(() => {
    const heading = fullTitle(title);
    const text = clip(description);
    const url = absolute(SITE_URL, canonicalPath(pathname));
    const picture = image ?? absolute(SITE_URL, DEFAULT_IMAGE_PATH);
    const alt = imageAlt ?? (image ? heading : DEFAULT_IMAGE_ALT);

    document.title = heading;
    meta("name", "description", text);
    meta("name", "robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    link("canonical", url);

    meta("property", "og:type", type === "product" ? "product" : "website");
    meta("property", "og:title", heading);
    meta("property", "og:description", text);
    meta("property", "og:url", url);
    meta("property", "og:image", picture);
    meta("property", "og:image:alt", alt);
    // The house card is 1200 by 630; a product photo is cropped to the same.
    meta("property", "og:image:width", "1200");
    meta("property", "og:image:height", "630");
    meta("name", "twitter:card", "summary_large_image");
    meta("name", "twitter:title", heading);
    meta("name", "twitter:description", text);
    meta("name", "twitter:image", picture);
    meta("name", "twitter:image:alt", alt);

    if (price) {
      const [amount, currency, stocked] = price.split("|");
      meta("property", "product:price:amount", amount);
      meta("property", "product:price:currency", currency);
      meta("property", "product:availability", stocked === "true" ? "in stock" : "out of stock");
    }

    let script = null;
    if (ld) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seo = "page";
      script.textContent = ld;
      document.head.appendChild(script);
    }

    return () => {
      script?.remove();
      // Product tags belong to one page; the next page sets its own or none.
      for (const p of ["product:price:amount", "product:price:currency", "product:availability"]) document.head.querySelector(`meta[property="${p}"]`)?.remove();
    };
  }, [title, description, image, imageAlt, type, price, ld, noindex, pathname]);
}

function meta(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function link(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}
