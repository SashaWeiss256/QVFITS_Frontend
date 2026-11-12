/* Catalog Attributes Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { httpCrud } from "../store/httpCrud";
import type { Category, Color, Product, ShopGroup, SizeOption, Term } from "../types";
import type { KitView } from "./productsApi";

/**
 * The building blocks a product is described with, all editable in the
 * admin under Catalog, and all kept on the API (realm: admin):
 *   shop groups  the storefront's "Shop by" groups: Category, Movement,
 *                Edits, and any the admin adds (Categories page)
 *   categories   the Category group's items; a product has one
 *   terms        the items of every other group: tags that products carry
 *                (Running, High support) or edits that open a view (New in)
 *   colours, sizes, and how the shop's filter sidebar is laid out
 * The API makes ids and addresses from names, keeps old addresses for
 * redirects, and refuses to delete anything a product still uses.
 */
const A = routes.adminCatalog;

export const categoriesCrud = httpCrud<Category>(A.categories, { module: "categories", noun: "category", label: (c) => c.name });
export const colorsCrud = httpCrud<Color>(A.colors, { module: "categories", noun: "colour", label: (c) => c.name });
export const sizesCrud = httpCrud<SizeOption>(A.sizes, { module: "size-guide", noun: "size", label: (s) => s.label });
export const groupsCrud = httpCrud<ShopGroup>(A.groups, { module: "categories", noun: "group", label: (g) => g.name });
export const termsCrud = httpCrud<Term>(A.terms, { module: "categories", noun: "item", label: (t) => t.name });

export interface LinkLookup {
  groups: ShopGroup[];
  categories: Category[];
  terms: Term[];
  products: { id: string; slug: string; name: string }[];
}

/**
 * Live groups, categories, terms and pieces (kits too), for building link
 * addresses (utils/shopTargets) and dropping links to anything switched off
 * or deleted. Read from the shop's own public routes.
 */
export async function linkLookup({ signal }: RequestOptions = {}): Promise<LinkLookup> {
  const [facets, pieces, kits] = await Promise.all([
    http.get<{ groups: ShopGroup[]; categoryList: Category[]; terms: Term[] }>(routes.catalog.facets, { signal }),
    http.get<Product[]>(routes.catalog.products, { signal }),
    http.get<KitView[]>(routes.catalog.kits, { signal }),
  ]);
  return {
    groups: facets.groups,
    categories: facets.categoryList,
    terms: facets.terms,
    products: [...pieces.map(({ id, slug, name }) => ({ id, slug, name })), ...kits.map((k) => ({ id: k.id, slug: k.slug, name: k.title }))],
  };
}
