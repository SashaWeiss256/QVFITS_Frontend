/* Dash Check */
// The client does not want em or en dashes anywhere on the site: in copy, in
// data, or in the code that produces it. This fails `npm run lint` on any
// U+2014 or U+2013 under src/ or in index.html, naming each line.
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src", "index.html"];
const EXT = /\.(jsx?|tsx?|json|css|html|md)$/;
const DASH = /[–—]/;

function* files(p) {
  const stat = fs.statSync(p);
  if (stat.isFile()) return void (yield p);
  for (const name of fs.readdirSync(p)) yield* files(path.join(p, name));
}

const hits = [];
for (const root of ROOTS) {
  for (const file of files(root)) {
    if (!EXT.test(file)) continue;
    fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      if (DASH.test(line)) hits.push(`${file}:${i + 1}  ${line.trim().slice(0, 100)}`);
    });
  }
}

if (hits.length) {
  console.error(`Found ${hits.length} em or en dash${hits.length === 1 ? "" : "es"}. Use a comma, colon, full stop or "to" instead:\n`);
  console.error(hits.join("\n"));
  process.exit(1);
}
