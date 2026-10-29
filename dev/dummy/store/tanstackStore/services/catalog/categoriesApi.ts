/* Facets Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import type { DocumentPatch } from "../store/collectionStore";
import type { Category, Color, FilterConfig, Photo, ShopGroup, SizeOption, Term } from "../types";
import { byPosition } from "../store/adminCrud";
import {
  categoriesCrud,
  colorsCrud,
  filterConfig,
  groupsCrud,
  sizesCrud,
  sortedCategories,
  sortedColors,
  sortedGroups,
  sortedSizes,
  sortedTerms,
  termsCrud,
} from "./attributesApi";
import { localPhoto } from "./photos";

/**
 * The shop's facets, as the filters, the shop page, the menus and Vee read
 * them: the live "Shop by" groups in the admin's order, the categories and
 * every other group's terms (with their slugs, for addresses, and pictures
 * resolved), colours with their swatch, sizes, and the filter layout.
 */
export type CategoryView = Category & { photo?: Photo };
export type TermView = Term & { photo?: Photo };

export interface Facets {
  groups: ShopGroup[];
  categoryList: CategoryView[];
  terms: TermView[];
  colors: { id: string; name: string; swatch: string }[];
  sizes: string[];
  filters: FilterConfig;
}

/** A picture as stored: an uploaded photo, a /photos id, or nothing. */
const photoOf = (image: string | Photo | null | undefined) => (image && typeof image === "object" ? image : image ? localPhoto(image) : undefined);
export const categoryView = (c: Category): CategoryView => ({ ...c, photo: photoOf(c.image) });
export const termView = (t: Term): TermView => ({ ...t, photo: photoOf(t.image) });

export function getFacets({ signal }: RequestOptions = {}) {
  return mockApi<Facets>(() => {
    const groups = sortedGroups().filter((g) => g.active);
    const live = new Set(groups.map((g) => g.id));
    const filters = filterConfig.get();
    return {
      groups,
      categoryList: sortedCategories().filter((c) => c.active).map(categoryView),
      terms: sortedTerms().filter((t) => t.active && live.has(t.groupId)).map(termView),
      colors: sortedColors().map((c) => ({ id: c.id, name: c.name, swatch: c.hex })),
      sizes: sortedSizes().map((s) => s.label),
      filters: { ...filters, facets: byPosition(filters.facets), sort: { ...filters.sort, options: byPosition(filters.sort?.options ?? []) } },
    };
  }, 100, signal);
}

/* Admin (realm: admin) */

export const listGroups = ({ signal }: RequestOptions = {}) => mockApi<ShopGroup[]>(sortedGroups, 120, signal);
export const listCategories = ({ signal }: RequestOptions = {}) => mockApi<CategoryView[]>(() => sortedCategories().map(categoryView), 120, signal);
export const listTerms = ({ signal }: RequestOptions = {}) => mockApi<TermView[]>(() => sortedTerms().map(termView), 120, signal);
export const listColors = ({ signal }: RequestOptions = {}) => mockApi<Color[]>(sortedColors, 120, signal);
export const listSizes = ({ signal }: RequestOptions = {}) => mockApi<SizeOption[]>(sortedSizes, 120, signal);

export { categoriesCrud, colorsCrud, groupsCrud, sizesCrud, termsCrud };

export function getFilterConfig({ signal }: RequestOptions = {}) {
  return mockApi(() => filterConfig.get(), 100, signal);
}

export function updateFilterConfig(patch: DocumentPatch<FilterConfig>) {
  return mockApi(() => {
    assertCan("categories", "edit");
    const doc = filterConfig.update(patch);
    logActivity({ module: "categories", action: "update", summary: "Updated the shop's filter and sort" });
    return doc;
  });
}
