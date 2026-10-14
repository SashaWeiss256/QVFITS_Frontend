/* Collections Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import type { Photo } from "../types";
import { photosFor } from "./productsApi";
import { BEST_SELLERS, LOOKS, NEW_RELEASES } from "@/data/shop";

/**
 * Curated groupings the shop chooses by hand: the New Releases and Best
 * Sellers rails (product ids, in order) and the kits ("looks") that pair
 * pieces from the catalogue.
 */
export interface Look {
  id: string;
  title: string;
  note: string;
  items: string[];
  /** The kit's own photo in /photos (look-<id>), the brand's photography. */
  photo?: Photo;
}

export interface Rails {
  newReleases: string[];
  bestSellers: string[];
}

export function getRails({ signal }: RequestOptions = {}) {
  return mockApi<Rails>(() => ({ newReleases: NEW_RELEASES, bestSellers: BEST_SELLERS }), 100, signal);
}

export function listLooks({ signal }: RequestOptions = {}) {
  return mockApi<Look[]>(() => (LOOKS as Look[]).map((l) => ({ ...l, photo: photosFor(l.id)[0] })), 100, signal);
}
