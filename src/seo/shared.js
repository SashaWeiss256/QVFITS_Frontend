/* SEO Helpers Shared By The App And The Build Script */

// Plain functions with no imports, so the browser (useSeo) and the post build
// step (scripts/seo-prerender.mjs) describe a page in exactly the same words.

export const BRAND = "QVFITS";
export const DEFAULT_TITLE = "QVFITS | Activewear, Swim & Lounge, Kampala";
export const DEFAULT_DESCRIPTION =
  "Premium seamless and seam-fit activewear, swim and lounge wear. Showroom at THE CUBE, Kisementi, Kampala. Delivery across Uganda.";
export const DEFAULT_IMAGE_PATH = "/og-image.jpg";
export const DEFAULT_IMAGE_ALT = "QVFITS: seamless activewear, swim and lounge wear, Kampala";

/** Fixed pages: what each says in a tab, in search and in a shared link. */
export const PAGES = {
  home: { path: "/", title: null, description: DEFAULT_DESCRIPTION, priority: "1.0", changefreq: "weekly" },
  shop: {
    path: "/shop",
    title: "Shop everything",
    description: "Seamless sets, sports bras, leggings, skorts, swim and lounge wear from QVFITS. Delivered across Uganda or collected from the Kisementi showroom.",
    priority: "0.9",
    changefreq: "daily",
  },
  about: {
    path: "/about",
    title: "Our story",
    description: "Quivogue (QVFITS): Qui for quality, Vogue for fashionable. Premium seamless and seam-fit activewear, swim and lounge wear from THE CUBE, Kisementi, Kampala.",
    priority: "0.6",
    changefreq: "monthly",
  },
  sizeGuide: {
    path: "/size-guide",
    title: "Size guide",
    description: "QVFITS size chart in cm and inches, a size finder, and how each piece fits.",
    priority: "0.6",
    changefreq: "monthly",
  },
  contact: {
    path: "/contact",
    title: "Contact",
    description: "Reach Quivogue (QVFITS) on WhatsApp, by phone or email, or visit the showroom at THE CUBE, G17 Kisementi, Kampala.",
    priority: "0.6",
    changefreq: "monthly",
  },
  delivery: {
    path: "/delivery",
    title: "Delivery",
    description: "How QVFITS delivers across Kampala and Uganda, what it costs, and when free delivery applies.",
    priority: "0.4",
    changefreq: "monthly",
  },
  returns: {
    path: "/returns",
    title: "Exchanges and returns",
    description: "How to exchange a QVFITS piece, and what we can and cannot take back.",
    priority: "0.4",
    changefreq: "monthly",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy policy",
    description: "What QVFITS collects when you shop with us, why, and the choices you have.",
    priority: "0.3",
    changefreq: "yearly",
  },
  terms: {
    path: "/terms",
    title: "Terms of sale",
    description: "The terms that apply when you buy from QVFITS.",
    priority: "0.3",
    changefreq: "yearly",
  },
};

/** The title as it appears in a tab and a shared link. */
export const fullTitle = (title) => (title ? `${title} | ${BRAND}` : DEFAULT_TITLE);

/** Keeps a description to what search and chat apps show, ending on a whole word. */
export function clip(text, max = 158) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length).replace(/[,.;:]+$/, "")}…`;
}

/** An address made whole: https://qvfits.com + /shop. */
export function absolute(site, path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The address a page lives at, without a trailing slash (the root keeps one). */
export function canonicalPath(pathname = "/") {
  const clean = pathname.split(/[?#]/)[0] || "/";
  return clean.length > 1 ? clean.replace(/\/+$/, "") : "/";
}

/**
 * A photo as a 1200 by 630 link preview. Uploads sit on ImageKit and the
 * placeholders on Unsplash; both crop and convert on request, and JPEG is
 * asked for because WhatsApp and some mail apps skip WebP. A photo kept in
 * the visitor's browser (a data: URL) cannot be shared, so the house card
 * is used instead.
 */
export function shareImage(photo, site) {
  const house = absolute(site, DEFAULT_IMAGE_PATH);
  if (!photo || photo.url?.startsWith("data:")) return house;
  if (!photo.url) return absolute(site, `/photos/${photo.id}.jpg`);
  if (/^https:\/\/ik\.imagekit\.io\//.test(photo.url)) return `${photo.url}?tr=w-1200,h-630,fo-auto,f-jpg,q-80`;
  return `${photo.url}?w=1200&h=630&fit=crop&crop=faces,entropy&fm=jpg&q=80&auto=format`;
}

/** A photo at a plain width, for the structured data's image list. */
export function photoUrl(photo, site, width = 1200) {
  if (!photo || photo.url?.startsWith("data:")) return null;
  if (!photo.url) return absolute(site, `/photos/${photo.id}.jpg`);
  if (/^https:\/\/ik\.imagekit\.io\//.test(photo.url)) return `${photo.url}?tr=w-${width},f-jpg,q-80`;
  return `${photo.url}?w=${width}&fm=jpg&q=80&auto=format`;
}

/** A piece in stock when any size of any colour has units on hand; a kit follows its pieces, so it counts as in stock while live. */
export function inStock(product) {
  if (product.type === "kit" && !product.variants?.length) return true;
  return Boolean(product.variants?.some((v) => v.stock > 0));
}

/** The page's title and description: the admin's own SEO words when written, otherwise made from the piece. */
export function productMeta(product) {
  const title = product.seo?.title?.trim() || product.name;
  const made = `${product.name}, ${product.category ?? "activewear"} from QVFITS, Kampala. ${product.blurb ?? ""}`;
  return { title, description: clip(product.seo?.description?.trim() || made) };
}

/** schema.org Product: lets search show the price and stock beside the result. */
export function productJsonLd(product, site, { currency = "UGX" } = {}) {
  const url = absolute(site, `/product/${product.slug}`);
  const images = (product.photos ?? []).map((p) => photoUrl(p, site)).filter(Boolean).slice(0, 5);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productMeta(product).description,
    sku: product.variants?.[0]?.sku,
    brand: { "@type": "Brand", name: BRAND },
    category: product.category,
    material: product.fabric || undefined,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: String(product.price),
      availability: inStock(product) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: BRAND },
    },
  };
  if (images.length) ld.image = images;
  return ld;
}

/** schema.org BreadcrumbList: search shows Home > Shop > Bras > this piece. */
export function breadcrumbJsonLd(crumbs, site) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absolute(site, c.path) })),
  };
}

/** The crumbs for a piece: Home, Shop, its category, itself. */
export function productCrumbs(product) {
  const crumbs = [{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }];
  if (product.category && product.categorySlug) crumbs.push({ name: product.category, path: `/shop/${product.categorySlug}` });
  crumbs.push({ name: product.name, path: `/product/${product.slug}` });
  return crumbs;
}
