/* Static Link Check */
// The home page, menus and page copy are part of the site's code
// (src/data/*.json), and their links are targets, never typed addresses.
// A target names a page or a label here; categories, items and pieces live on
// the API, and the site drops a link to one that is gone or switched off
// (services/catalog/attributesApi linkLookup). This fails `npm run lint` on a
// page or label that does not exist, naming each and where it sits.
import fs from "node:fs";

const read = (f) => JSON.parse(fs.readFileSync(`src/data/${f}.json`, "utf8"));
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
    if (t.page && !pages.has(t.page)) bad.push(`${file} ${where}: no page "${t.page}"`);
    if (t.label && !LABELS.has(t.label)) bad.push(`${file} ${where}: no label "${t.label}"`);
  }
  for (const [k, v] of Object.entries(value)) if (k !== "target") walk(v, file, `${where}.${k}`);
}

for (const f of ["home", "navigation"]) walk(read(f), f, "");

if (bad.length) {
  console.error(`Found ${bad.length} link target${bad.length === 1 ? "" : "s"} that point at nothing:\n`);
  console.error(bad.join("\n"));
  process.exit(1);
}
