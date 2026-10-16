/* Collections Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { getContent } from "../content/contentApi";
import { adminCrud, byPosition } from "../store/adminCrud";
import { createCollection } from "../store/collectionStore";
import type { Photo } from "../types";
import { photosFor } from "./photos";
import lookSeed from "@/data/looks.json";

/**
 * Curated groupings the shop chooses by hand: the New Releases and Best
 * Sellers rails (product ids, in order, kept with the home page content) and
 * the kits ("looks") that pair pieces from the catalogue.
 */
export interface Look {
  id: string;
  title: string;
  note: string;
  items: string[];
  position: number;
  live: boolean;
  /** The kit's own photo in /photos (look-<id>), the brand's photography. */
  photo?: Photo;
}

export interface Rails {
  newReleases: string[];
  bestSellers: string[];
}

export async function getRails({ signal }: RequestOptions = {}): Promise<Rails> {
  const { rails } = await getContent({ signal });
  return { newReleases: rails.newReleases.productIds, bestSellers: rails.bestSellers.productIds };
}

const looks = createCollection<Look>("looks", lookSeed as Look[], { idPrefix: "look" });

export function listLooks({ signal }: RequestOptions = {}) {
  return mockApi<Look[]>(
    () => byPosition(looks.list()).filter((l) => l.live).map((l) => ({ ...l, photo: l.photo ?? photosFor(l.id)[0] })),
    100,
    signal,
  );
}

/* Admin (realm: admin) */

export const looksCrud = adminCrud(looks, {
  module: "collections",
  noun: "kit",
  label: (l) => l.title,
  prepare: (data, existing, all) => (existing ? data : { live: true, items: [], note: "", ...data, position: all.length }),
});

export const listAllLooks = ({ signal }: RequestOptions = {}) =>
  mockApi(() => byPosition(looks.list()).map((l) => ({ ...l, photo: l.photo ?? photosFor(l.id)[0] })), 120, signal);
