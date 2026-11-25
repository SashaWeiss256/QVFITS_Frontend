/* Bag Check */
import { forColorName, inStock, productSizes } from "./stockLevel";

/**
 * What stops a bag going to checkout: a line with no size (the shopper must
 * always pick one), a size the piece no longer comes in, or one sold out in
 * that colour. `rows` are { line, product } (useCheckoutBag). Lines whose
 * product hasn't loaded are left alone; the server checks them again.
 */
export function bagProblems(rows) {
  const out = [];
  for (const { line, product: p } of rows) {
    if (!p) continue;
    const shown = forColorName(p, line.color);
    if (!line.size) out.push({ line, product: p, message: `Choose a size for ${p.name}` });
    else if (!productSizes(shown).includes(line.size)) out.push({ line, product: p, message: `${p.name} no longer comes in ${line.size}. Choose another size.` });
    else if (!inStock(shown, line.size)) out.push({ line, product: p, message: `${p.name} is sold out in ${line.size}. Choose another size.` });
  }
  return out;
}

/** The same key a bag row is rendered and scrolled to by. */
export const lineKey = (line) => `${line.productId}-${line.size ?? "nosize"}-${line.color}-${line.kitId ?? ""}`;
