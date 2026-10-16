/* Facets Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import type { DocumentPatch } from "../store/collectionStore";
import type { Activity, Category, Color, FilterConfig, SizeOption } from "../types";
import { byPosition } from "../store/adminCrud";
import {
  activitiesCrud,
  categoriesCrud,
  colorsCrud,
  filterConfig,
  sizesCrud,
  sortedActivities,
  sortedCategories,
  sortedColors,
  sortedSizes,
} from "./attributesApi";

/**
 * The shop's facets, as the filters, the footer, the menus and the product
 * form read them: active categories in the admin's order, activities,
 * colours with their swatch, sizes, and how the filter sidebar is laid out.
 */
export interface Facets {
  categories: string[];
  categoryList: Category[];
  occasions: { id: string; label: string }[];
  colors: { id: string; name: string; swatch: string }[];
  sizes: string[];
  filters: FilterConfig;
}

export function getFacets({ signal }: RequestOptions = {}) {
  return mockApi<Facets>(() => {
    const active = sortedCategories().filter((c) => c.active);
    const filters = filterConfig.get();
    return {
      categories: active.map((c) => c.name),
      categoryList: active,
      occasions: sortedActivities().map(({ id, label }) => ({ id, label })),
      colors: sortedColors().map((c) => ({ id: c.id, name: c.name, swatch: c.hex })),
      sizes: sortedSizes().map((s) => s.label),
      filters: { ...filters, facets: byPosition(filters.facets) },
    };
  }, 100, signal);
}

/* Admin (realm: admin) */

export const listCategories = ({ signal }: RequestOptions = {}) => mockApi<Category[]>(sortedCategories, 120, signal);
export const listColors = ({ signal }: RequestOptions = {}) => mockApi<Color[]>(sortedColors, 120, signal);
export const listSizes = ({ signal }: RequestOptions = {}) => mockApi<SizeOption[]>(sortedSizes, 120, signal);
export const listActivities = ({ signal }: RequestOptions = {}) => mockApi<Activity[]>(sortedActivities, 120, signal);

export { activitiesCrud, categoriesCrud, colorsCrud, sizesCrud };

export function getFilterConfig({ signal }: RequestOptions = {}) {
  return mockApi(() => filterConfig.get(), 100, signal);
}

export function updateFilterConfig(patch: DocumentPatch<FilterConfig>) {
  return mockApi(() => {
    assertCan("attributes", "edit");
    const doc = filterConfig.update(patch);
    logActivity({ module: "attributes", action: "update", summary: "Updated the shop filters" });
    return doc;
  });
}
