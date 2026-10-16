/* Size Finder Maths (from Quivogue size-guide.html findSize()) */

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * The nearest size band for whatever measurements were given (cm), then
 * adjusted for a piece's fit: one up if it runs small. The same maths Vee
 * uses. Returns { size, exact, note }.
 */
export function findSize(chart, { bust, waist, hip }, product) {
  const scored = chart
    .map((row) => {
      let dist = 0;
      const test = (v, range) => {
        if (v == null) return;
        if (v < range[0]) dist += range[0] - v;
        else if (v > range[1]) dist += v - range[1];
      };
      test(bust, row.bust);
      test(waist, row.waist);
      test(hip, row.hip);
      return { row, dist };
    })
    .sort((a, b) => a.dist - b.dist);

  let size = scored[0].row.size;
  let note = "";
  if (product) {
    const i = SIZES.indexOf(size);
    if (product.fit === "small" && i > -1 && i < SIZES.length - 1) {
      size = SIZES[i + 1];
      note = `The ${product.name} runs small, so we've moved you up one.`;
    } else if (product.fit === "relaxed") note = `The ${product.name} is cut relaxed. Go down one if you want it neater.`;
    else note = `The ${product.name} is true to size.`;
  }
  return { size, exact: scored[0].dist === 0, note };
}

/** A cm range as cm or inches. */
export function formatRange(range, unit) {
  if (unit === "cm") return `${range[0]} to ${range[1]} cm`;
  return `${(range[0] / 2.54).toFixed(1)} to ${(range[1] / 2.54).toFixed(1)}"`;
}

export const FIT_LABELS = { small: "Runs small", large: "Runs large", relaxed: "Cut relaxed", true: "True to size" };
