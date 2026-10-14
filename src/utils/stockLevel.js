/* Stock Level (from Quivogue js/data.js helpers) */

// Stock counts are per size; 0 means sold out in that size, and the site
// says so rather than hiding it.
export const productSizes = (p) => Object.keys(p.stock);
export const inStock = (p, size) => (p.stock[size] || 0) > 0;
export const anyInStock = (p) => Object.values(p.stock).some((n) => n > 0);
export const lowStock = (p, size) => {
  const n = p.stock[size] || 0;
  return n > 0 && n <= 2;
};

/**
 * A piece is on sale only when the sale is switched on AND that piece carries
 * a salePercent. Neither alone shows a reduced price anywhere.
 */
export function saleOf(product, sale) {
  if (!sale?.live) return null;
  const pct = Number(product.salePercent) || 0;
  if (pct <= 0) return null;
  return { pct, was: product.price, now: Math.round((product.price * (100 - pct)) / 100) };
}
