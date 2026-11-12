/* Dummy Data Mode */
import fs from "node:fs";
import path from "node:path";

/**
 * `npm run dev:dummy`: the whole site (storefront, account and admin) runs on
 * the sample data in the browser, the way the original QVfits repo did before
 * the backend existed. No server is needed.
 *
 * How: dev/dummy mirrors src/. While this mode is on, any file the app imports
 * from src/ that also exists in dev/dummy is swapped for the dev/dummy copy.
 * dev/dummy/store is the original mock store (services read src/data with a
 * short fake delay, edits are kept in the browser's storage), plus the few
 * utils and data files that store expects.
 *
 * `npm run build:dummy` does the same for a production build, so the site can
 * be previewed on a host (Netlify) before the API is live.
 *
 * Nothing in src/ changes. `npm run dev` and `npm run build` use Joshua's live
 * store exactly as before; delete dev/ to remove this mode entirely.
 */
export default function dummyData() {
  const root = path.resolve(import.meta.dirname, "..");
  const SRC = path.join(root, "src") + path.sep;
  const DUMMY = path.join(root, "dev", "dummy") + path.sep;

  return {
    name: "qvfits-dummy-data",
    enforce: "pre",
    configResolved(config) {
      if (process.env.VITE_DUMMY_DATA === "1") config.logger.info("\n  Dummy data mode: the site runs on src/data, no backend needed.\n");
    },
    async resolveId(source, importer, options) {
      if (process.env.VITE_DUMMY_DATA !== "1") return null;
      // "@/..." paths are looked up in dev/dummy first, so files that exist
      // only there (the staff list, say) resolve too.
      // Vite's alias step may already have turned "@/x" into ".../src/x".
      const fromSrc = source.startsWith("@/") ? source.slice(2) : source.startsWith(SRC) ? source.slice(SRC.length) : null;
      if (fromSrc !== null) {
        const base = DUMMY + fromSrc.split("?")[0];
        for (const ext of ["", ".ts", ".tsx", ".js", ".jsx", ".json", "/index.ts", "/index.js"]) {
          if (fs.existsSync(base + ext) && fs.statSync(base + ext).isFile()) return base + ext;
        }
      }
      let resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      // A dev/dummy file importing a neighbour that only exists in src/ (./stockLevel, say).
      if (!resolved && importer?.startsWith(DUMMY) && source.startsWith(".")) {
        resolved = await this.resolve(source, SRC + importer.slice(DUMMY.length), { ...options, skipSelf: true });
      }
      if (!resolved || resolved.external) return resolved;
      const [file, query = ""] = resolved.id.split("?");
      if (!file.startsWith(SRC)) return resolved;
      const swap = DUMMY + file.slice(SRC.length);
      return fs.existsSync(swap) ? swap + (query ? `?${query}` : "") : resolved;
    },
  };
}
