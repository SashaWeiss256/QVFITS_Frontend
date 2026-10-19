/* Facets Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import type { DocumentPatch } from "../store/collectionStore";
import type { Category, Color, FilterConfig, Photo, ShopGroup, SizeOption, Term } from "../types";
import { categoriesCrud, colorsCrud, groupsCrud, sizesCrud, termsCrud } from "./attributesApi";
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

/** A picture as stored: an uploaded photo, a /photos id, or nothing. The API leaves /photos ids for the client to resolve. */
const photoOf = (image: string | Photo | null | undefined) => (image && typeof image === "object" ? image : image ? localPhoto(image) : undefined);
export const categoryView = (c: Category): CategoryView => ({ ...c, photo: photoOf(c.image) });
export const termView = (t: Term): TermView => ({ ...t, photo: photoOf(t.image) });

export async function getFacets({ signal }: RequestOptions = {}): Promise<Facets> {
  const facets = await http.get<Facets>(routes.catalog.facets, { signal });
  return { ...facets, categoryList: facets.categoryList.map(categoryView), terms: facets.terms.map(termView) };
}

/* Admin (realm: admin) */

const ADMIN = { realm: "admin" } as const;

export const listGroups = ({ signal }: RequestOptions = {}) => groupsCrud.list({ signal });
export const listCategories = async ({ signal }: RequestOptions = {}) => (await categoriesCrud.list({ signal })).map(categoryView);
export const listTerms = async ({ signal }: RequestOptions = {}) => (await termsCrud.list({ signal })).map(termView);
export const listColors = ({ signal }: RequestOptions = {}): Promise<Color[]> => colorsCrud.list({ signal });
export const listSizes = ({ signal }: RequestOptions = {}): Promise<SizeOption[]> => sizesCrud.list({ signal });

export { categoriesCrud, colorsCrud, groupsCrud, sizesCrud, termsCrud };

export function getFilterConfig({ signal }: RequestOptions = {}) {
  return http.get<FilterConfig>(routes.adminCatalog.filters, { ...ADMIN, signal });
}

export async function updateFilterConfig(patch: DocumentPatch<FilterConfig>) {
  const doc = await http.patch<FilterConfig>(routes.adminCatalog.filters, patch, ADMIN);
  logActivity({ module: "categories", action: "update", summary: "Updated the shop's filter and sort" });
  return doc;
}
