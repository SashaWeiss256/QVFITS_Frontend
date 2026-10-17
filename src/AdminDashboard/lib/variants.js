/* Variants */

const code = (s) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8);

/** One variant per colour and size picked; stock already typed in is kept. */
export function buildVariants(base, colorIds, sizes, previous = []) {
  return colorIds.flatMap((colorId) =>
    sizes.map((size) => {
      const had = previous.find((v) => v.colorId === colorId && v.size === size);
      return had ?? { id: `${base}--${colorId}--${size.toLowerCase()}`, sku: `QV-${code(base)}-${code(colorId).slice(0, 3)}-${code(size)}`, colorId, size, stock: 0 };
    }),
  );
}

/** The sizes a product has picked so far; on a saved product, the sizes its variants use. */
export function sizesOf(product, allSizes) {
  return product.sizes ?? allSizes.map((s) => s.label).filter((l) => product.variants.some((v) => v.size === l));
}

/**
 * The patch that adds a colour to a product (and its stock cells), used when
 * a photo is assigned to a colour the product does not list yet.
 */
export function withColor(product, allSizes, colorId) {
  if (product.colorIds.includes(colorId)) return {};
  const colorIds = [...product.colorIds, colorId];
  const sizes = sizesOf(product, allSizes);
  return { colorIds, sizes, variants: buildVariants(product.slug || product.id || "new", colorIds, sizes, product.variants) };
}
