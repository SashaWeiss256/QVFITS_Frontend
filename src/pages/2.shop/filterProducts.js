/* Filter And Sort (from Quivogue shop.html filtered()) */
import { anyInStock, inStock, productSizes, saleOf } from "@/utils/stockLevel";

const RANK = { Bestseller: 2, New: 1 };
const SORTERS = {
  featured: (a, b) => (RANK[b.badge] || 0) - (RANK[a.badge] || 0) || a.name.localeCompare(b.name),
  new: (a, b) => (b.badge === "New") - (a.badge === "New") || a.name.localeCompare(b.name),
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  az: (a, b) => a.name.localeCompare(b.name),
};

/**
 * The whole catalogue in, the rail out. Within a group the choices are OR
 * (Sets or Bras), across groups AND (Sets in size M). With "in stock only",
 * a size only counts if that size is actually in stock.
 */
export function filterProducts(products, state, sale) {
  const q = state.query.toLowerCase();
  const list = products.filter((p) => {
    if (q && ![p.name, p.category, p.blurb, ...p.colors].join(" ").toLowerCase().includes(q)) return false;
    if (state.sale && !saleOf(p, sale)) return false;
    if (state.badge && p.badge !== state.badge) return false;
    if (state.cats.length && !state.cats.includes(p.category)) return false;
    if (state.colors.length && !state.colors.some((c) => p.colors.includes(c))) return false;
    if (state.occs.length && !state.occs.some((o) => p.occasions.includes(o))) return false;
    if (state.maxPrice != null && p.price > state.maxPrice) return false;
    if (state.inStock && !anyInStock(p)) return false;
    if (state.sizes.length) {
      const sizes = productSizes(p);
      if (!state.sizes.some((s) => sizes.includes(s) && (!state.inStock || inStock(p, s)))) return false;
    }
    return true;
  });
  return list.sort(SORTERS[state.sort] ?? SORTERS.featured);
}

export function priceBounds(products) {
  const prices = products.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
