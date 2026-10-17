/* Collections Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import type { Product } from "../types";
import { listKits, listProducts, type KitView } from "./productsApi";

/**
 * The shop's automatic groupings. Nothing here is picked by hand any more:
 *   New releases  the newest pieces marked New arrival
 *   Best sellers  pinned pieces and the top sellers by units sold
 *   Kits          kit products (Products, type Kit), via listKits
 * The home page keeps only the rails' words (Home page editor).
 */
export type Look = KitView;
export { listKits as listLooks };

export interface Rails {
  newReleases: string[];
  bestSellers: string[];
}

const RAIL = 8;

export async function getRails({ signal }: RequestOptions = {}): Promise<Rails> {
  const pieces = await listProducts({}, { signal });
  return mockApi(() => ({
    newReleases: pieces.filter((p) => p.isNew).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, RAIL).map((p) => p.id),
    bestSellers: pieces
      .filter((p) => p.isBestseller)
      .sort((a: Product, b: Product) => Number(b.pinnedBestseller) - Number(a.pinnedBestseller) || b.unitsSold - a.unitsSold)
      .slice(0, RAIL)
      .map((p) => p.id),
  }), 0, signal);
}
