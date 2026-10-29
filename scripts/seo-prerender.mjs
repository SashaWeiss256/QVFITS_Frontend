/* Share Cards And Sitemap, Written At Build */

// Runs after `vite build` (npm run build). WhatsApp, Facebook, X, iMessage and
// LinkedIn read the page's HTML as it is served and never run its scripts, so a
// single-page app would show every link with the home page's card. This step
// copies dist/index.html to dist/product/<slug>/index.html (and each shop
// category, and each fixed page) with that page's own title, description, share
// photo and structured data already in the head. The app still takes over in
// the browser exactly as before. It also writes dist/sitemap.xml.
//
// Where the catalogue comes from:
//   SEO_API=https://qvfits.com/api   the live API (default)
//   SEO_DATA=dummy                   src/data/*.json, for a local run
//   SITE_URL=https://qvfits.com      the public address
// If the API cannot be reached the fixed pages and sitemap are still written
// and the build carries on; products then show the home card until the next
// build. Rebuild (or call this script) after the catalogue changes.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_IMAGE_PATH,
  PAGES,
  absolute,
  breadcrumbJsonLd,
  clip,
  fullTitle,
  photoUrl,
  productCrumbs,
  productJsonLd,
  productMeta,
  inStock,
  shareImage,
} from "../src/seo/shared.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const SITE = (process.env.SITE_URL || "https://qvfits.com").replace(/\/+$/, "");
const API = (process.env.SEO_API || `${SITE}/api`).replace(/\/+$/, "");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* The catalogue */

async function loadCatalogue() {
  if (process.env.SEO_DATA === "dummy") {
    const read = async (f) => JSON.parse(await readFile(path.join(root, "src/data", f), "utf8"));
    const [products, categories] = await Promise.all([read("products.json"), read("categories.json")]);
    const cat = new Map(categories.map((c) => [c.id, c]));
    return {
      categories: categories.filter((c) => c.active !== false),
      products: products
        .filter((p) => p.status === "active" && p.type !== "kit")
        .map((p) => ({ ...p, category: cat.get(p.categoryId)?.name, categorySlug: cat.get(p.categoryId)?.slug })),
    };
  }
  const get = async (route) => {
    const res = await fetch(`${API}/${route}`, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`${route}: ${res.status}`);
    const body = await res.json();
    return Array.isArray(body) ? body : (body.items ?? body.data ?? body.products ?? body.categories ?? []);
  };
  const products = (await get("catalog/products?limit=1000")).filter((p) => (!p.status || p.status === "active") && p.type !== "kit");
  const seen = new Map();
  for (const p of products) if (p.categorySlug && !seen.has(p.categorySlug)) seen.set(p.categorySlug, { slug: p.categorySlug, name: p.category, description: "" });
  return { products, categories: [...seen.values()] };
}

/* Writing a page's head */

// Replaces a tag when the template has it, adds it before </head> when not.
function put(html, pattern, tag) {
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}
const metaTag = (attr, key, content) => `<meta ${attr}="${key}" content="${esc(content)}" />`;
const metaRe = (attr, key) => new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`);

function render(template, { path: pagePath, title, description, image, imageAlt, type = "website", jsonLd, product }) {
  const heading = fullTitle(title);
  const text = clip(description);
  const url = absolute(SITE, pagePath);
  const picture = image ?? absolute(SITE, DEFAULT_IMAGE_PATH);
  const alt = imageAlt ?? heading;
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(heading)}</title>`);
  const set = (attr, key, content) => (html = put(html, metaRe(attr, key), metaTag(attr, key, content)));
  set("name", "description", text);
  html = put(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(url)}" />`);
  set("property", "og:type", type);
  set("property", "og:title", heading);
  set("property", "og:description", text);
  set("property", "og:url", url);
  set("property", "og:image", picture);
  set("property", "og:image:alt", alt);
  set("name", "twitter:title", heading);
  set("name", "twitter:description", text);
  set("name", "twitter:image", picture);
  set("name", "twitter:image:alt", alt);
  // The house card is a PNG; a photo is a JPEG.
  html = html.replace(/<meta property="og:image:type"[^>]*>/, metaTag("property", "og:image:type", picture.endsWith(".png") ? "image/png" : "image/jpeg"));
  if (product) {
    set("property", "product:price:amount", String(product.price));
    set("property", "product:price:currency", "UGX");
    set("property", "product:availability", product.inStock ? "in stock" : "out of stock");
  }
  if (jsonLd) html = html.replace("</head>", `    <script type="application/ld+json" data-seo="page">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n  </head>`);
  return html;
}

async function write(file, html) {
  const out = path.join(dist, file);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
}

/* Build */

const template = await readFile(path.join(dist, "index.html"), "utf8").catch(() => {
  console.error("seo-prerender: dist/index.html not found. Run `vite build` first.");
  process.exit(1);
});

const urls = [];
const addUrl = (loc, { lastmod, priority, changefreq, images = [] } = {}) => urls.push({ loc: absolute(SITE, loc), lastmod, priority, changefreq, images });

// Fixed pages
for (const [key, page] of Object.entries(PAGES)) {
  addUrl(page.path, page);
  if (key === "home") continue;
  await write(`${page.path}/index.html`, render(template, { ...page, jsonLd: breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: page.title, path: page.path }], SITE) }));
}

// The catalogue
let catalogue = { products: [], categories: [] };
try {
  catalogue = await loadCatalogue();
} catch (err) {
  console.warn(`seo-prerender: catalogue not read (${err.message}). Fixed pages and the sitemap were still written; product pages will show the home card until the next build.`);
}

for (const c of catalogue.categories) {
  const page = `/shop/${c.slug}`;
  const description = c.description ? `${c.description} ${PAGES.shop.description}` : `${c.name} from QVFITS, Kampala. ${PAGES.shop.description}`;
  addUrl(page, { priority: "0.8", changefreq: "weekly" });
  await write(`${page}/index.html`, render(template, { path: page, title: c.name, description, jsonLd: breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, { name: c.name, path: page }], SITE) }));
}

for (const p of catalogue.products) {
  const page = `/product/${p.slug}`;
  const { title, description } = productMeta(p);
  addUrl(page, { lastmod: p.updatedAt?.slice(0, 10), priority: "0.7", changefreq: "weekly", images: (p.photos ?? []).map((ph) => photoUrl(ph, SITE)).filter(Boolean).slice(0, 5) });
  await write(
    `${page}/index.html`,
    render(template, {
      path: page,
      title,
      description,
      image: shareImage(p.photos?.[0], SITE),
      imageAlt: `${p.name} by QVFITS`,
      type: "product",
      product: { price: p.price, inStock: inStock(p) },
      jsonLd: [productJsonLd(p, SITE), breadcrumbJsonLd(productCrumbs(p), SITE)],
    }),
  );
}

// Sitemap
const entry = (u) =>
  [
    "  <url>",
    `    <loc>${esc(u.loc)}</loc>`,
    u.lastmod && `    <lastmod>${u.lastmod}</lastmod>`,
    u.changefreq && `    <changefreq>${u.changefreq}</changefreq>`,
    u.priority && `    <priority>${u.priority}</priority>`,
    ...u.images.map((i) => `    <image:image><image:loc>${esc(i)}</image:loc></image:image>`),
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

await write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.map(entry).join("\n")}\n</urlset>\n`,
);

console.log(`seo-prerender: ${Object.keys(PAGES).length - 1} pages, ${catalogue.categories.length} categories, ${catalogue.products.length} products, sitemap with ${urls.length} addresses.`);
