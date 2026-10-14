/* Categories Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { COLOR_SWATCHES, OCCASIONS, PRODUCTS, SIZES } from "@/data/shop";

/**
 * The shop's facets: categories (in catalogue order), activities, colours
 * with their swatch, and sizes. Read by the shop filters, the footer and the
 * admin product form.
 */
export interface Facets {
  categories: string[];
  occasions: { id: string; label: string }[];
  colors: { name: string; swatch: string }[];
  sizes: string[];
}

export function getFacets({ signal }: RequestOptions = {}) {
  return mockApi<Facets>(() => ({
    categories: [...new Set((PRODUCTS as { category: string }[]).map((p) => p.category))],
    occasions: OCCASIONS,
    colors: Object.entries(COLOR_SWATCHES as Record<string, string>).map(([name, swatch]) => ({ name, swatch })),
    sizes: SIZES,
  }), 100, signal);
}
