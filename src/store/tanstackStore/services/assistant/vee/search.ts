/* Vee: Search */
import { anyInStock } from "@/utils/stockLevel";
import type { VeeContext } from "./context";
import { findBudget, findCategory, findColors, findOccasion, words } from "./language";

/**
 * Scores every piece against what was said. A piece only counts if something
 * the shopper said actually matched it; a bestseller badge breaks ties but is
 * never a reason on its own.
 */
export function search(t: string, ctx: VeeContext, limit = 3) {
  const cat = findCategory(t);
  const occ = findOccasion(t);
  const colors = findColors(t, ctx.swatches);
  const budget = findBudget(t);

  const scored = ctx.products
    .map((p) => {
      let s = 0;
      let signal = 0;
      if (cat && p.category === cat) { s += 5; signal++; }
      if (occ && p.occasions.includes(occ)) { s += 4; signal++; }
      if (colors.length && colors.some((c) => p.colors.includes(c))) { s += 3; signal++; }
      if (budget && p.price <= budget) s += 2;
      if (budget && p.price > budget) s -= 6;
      if (!anyInStock(p)) s -= 3;
      const hay = `${p.name} ${p.blurb} ${p.details.join(" ")}`.toLowerCase();
      words(t).filter((w) => w.length > 4).forEach((w) => {
        if (hay.includes(w)) { s += 1; signal++; }
      });
      if (signal && p.badge === "Bestseller") s += 1;
      return { p, s, signal };
    })
    .filter((x) => x.signal > 0 && x.s > 0)
    .sort((a, b) => b.s - a.s);

  return { items: scored.slice(0, limit).map((x) => x.p), cat, colors, budget, total: scored.length };
}
