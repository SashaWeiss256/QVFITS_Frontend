/* Catalog Attributes Service */
import { ApiError } from "../api/mock";
import { adminCrud, byPosition } from "../store/adminCrud";
import { createCollection, createDocument } from "../store/collectionStore";
import type { Activity, Category, Color, FilterConfig, ProductRecord, SizeOption } from "../types";
import activitySeed from "@/data/activities.json";
import categorySeed from "@/data/categories.json";
import colorSeed from "@/data/colors.json";
import filterSeed from "@/data/filters.json";
import sizeSeed from "@/data/sizes.json";

/**
 * The building blocks a product is described with: categories, colours
 * (each with its swatch), sizes and activities, plus how the shop's filter
 * sidebar is laid out. All editable in the admin under Catalog.
 */
export const categories = createCollection<Category>("categories", categorySeed as Category[], { idPrefix: "cat" });
export const colors = createCollection<Color>("colors", colorSeed as Color[], { idPrefix: "col" });
export const sizes = createCollection<SizeOption>("sizes", sizeSeed as SizeOption[], { idPrefix: "size" });
export const activities = createCollection<Activity>("activities", activitySeed as Activity[], { idPrefix: "act" });
export const filterConfig = createDocument<FilterConfig>("filters", filterSeed as FilterConfig);

// Set by productsApi, so a delete can check whether anything still uses a row
// without this file importing the products table (which imports this one).
let productRows: () => ProductRecord[] = () => [];
export function registerProducts(rows: () => ProductRecord[]) {
  productRows = rows;
}

const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function inUse(count: number, what: string) {
  if (count) throw new ApiError(`${count} ${count === 1 ? "product uses" : "products use"} this ${what}. Move or edit them first.`, 409);
}

/** New rows get a readable id from their name and go to the end of the list. */
function withIdAndPosition<T extends { id: string; position: number }>(name: (d: Partial<T>) => string | undefined) {
  return (data: Partial<T>, existing: T | null, all: T[]): Partial<T> => {
    if (existing) return data;
    const base = slugify(name(data) ?? "") || "item";
    let id = base;
    for (let n = 2; all.some((r) => r.id === id); n++) id = `${base}-${n}`;
    return { ...data, id, position: data.position ?? all.length };
  };
}

export const categoriesCrud = adminCrud(categories, {
  module: "categories",
  noun: "category",
  label: (c) => c.name,
  prepare: (data, existing, all) => {
    const next = withIdAndPosition<Category>((d) => d.name)(data, existing, all);
    if (data.name && !data.slug) next.slug = slugify(data.name);
    return { parentId: null, active: true, description: "", ...(existing ?? {}), ...next };
  },
  beforeRemove: (c) => inUse(productRows().filter((p) => p.categoryId === c.id).length, "category"),
});

export const colorsCrud = adminCrud(colors, {
  module: "attributes",
  noun: "colour",
  label: (c) => c.name,
  prepare: withIdAndPosition<Color>((d) => d.name),
  beforeRemove: (c) => inUse(productRows().filter((p) => p.colorIds.includes(c.id)).length, "colour"),
});

export const sizesCrud = adminCrud(sizes, {
  module: "attributes",
  noun: "size",
  label: (s) => s.label,
  prepare: withIdAndPosition<SizeOption>((d) => d.label),
  beforeRemove: (s) => inUse(productRows().filter((p) => p.variants.some((v) => v.size === s.label)).length, "size"),
});

export const activitiesCrud = adminCrud(activities, {
  module: "attributes",
  noun: "activity",
  label: (a) => a.label,
  prepare: withIdAndPosition<Activity>((d) => d.label),
  beforeRemove: (a) => inUse(productRows().filter((p) => p.activityIds.includes(a.id)).length, "activity"),
});

/* Lookups the products view and the facets use */

export const sortedCategories = () => byPosition(categories.list());
export const sortedColors = () => byPosition(colors.list());
export const sortedSizes = () => byPosition(sizes.list());
export const sortedActivities = () => byPosition(activities.list());
