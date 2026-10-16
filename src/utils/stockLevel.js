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

/**
 * The product as one colourway sees it: stock per size for that colour only,
 * so the size picker never offers a size that is sold out in the colour
 * chosen. Without variants (older rows), the product is returned unchanged.
 */
export function forColor(product, colorId) {
  if (!colorId || !product.variants?.length) return product;
  const stock = Object.fromEntries(Object.keys(product.stock).map((size) => [size, 0]));
  for (const v of product.variants) if (v.colorId === colorId) stock[v.size] = (stock[v.size] ?? 0) + v.stock;
  return { ...product, stock };
}

/**
 * The first colour and size that can actually be sold, for one-tap adds
 * (the card's Add, a whole kit). Colours keep the product's order; a
 * product's colour names and ids line up one to one.
 */
export function firstAvailable(product) {
  const v = product.variants?.find((x) => x.stock > 0);
  if (v) return { color: product.colors[product.colorIds.indexOf(v.colorId)] ?? product.colors[0], size: v.size };
  const size = productSizes(product).find((s) => inStock(product, s));
  return size ? { color: product.colors[0], size } : null;
}
