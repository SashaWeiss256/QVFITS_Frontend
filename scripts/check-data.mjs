/* Static Link Check */
// The home page, menus and page copy are part of the site's code
// (src/data/*.json), and their links are targets, never typed addresses.
// A target names a category, an item, a piece or a page by id; if a seed ever
// drops one, the link would quietly vanish from the shop. This fails
// `npm run lint` instead, naming each dead target and where it sits.
import fs from "node:fs";

const read = (f) => JSON.parse(fs.readFileSync(`src/data/${f}.json`, "utf8"));
const ids = (f) => new Set(read(f).map((x) => x.id));
const known = { categories: ids("categories"), terms: ids("terms"), product: ids("products") };
// The fixed pages a link may open, as listed in utils/shopTargets.js (PAGES).
const source = fs.readFileSync("src/utils/shopTargets.js", "utf8");
const pages = new Set([...source.slice(source.indexOf("export const PAGES"), source.indexOf("];", source.indexOf("export const PAGES"))).matchAll(/path: "([^"]+)"/g)].map((m) => m[1]));
const LABELS = new Set(["new", "bestseller", "sale", "kits"]);

const bad = [];
function walk(value, file, where) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) return value.forEach((v, i) => walk(v, file, `${where}[${i}]`));
  const t = value.target;
  if (t && typeof t === "object") {
    for (const id of t.categories ?? []) if (!known.categories.has(id)) bad.push(`${file} ${where}: no category "${id}"`);
    for (const id of t.terms ?? []) if (!known.terms.has(id)) bad.push(`${file} ${where}: no item "${id}"`);
    if (t.product && !known.product.has(t.product)) bad.push(`${file} ${where}: no product "${t.product}"`);
    if (t.page && !pages.has(t.page)) bad.push(`${file} ${where}: no page "${t.page}"`);
    if (t.label && !LABELS.has(t.label)) bad.push(`${file} ${where}: no label "${t.label}"`);
  }
  for (const [k, v] of Object.entries(value)) if (k !== "target") walk(v, file, `${where}.${k}`);
}

for (const f of ["home", "navigation", "offers", "terms"]) walk(read(f), f, "");

if (bad.length) {
  console.error(`Found ${bad.length} link target${bad.length === 1 ? "" : "s"} that point at nothing:\n`);
  console.error(bad.join("\n"));
  process.exit(1);
}
