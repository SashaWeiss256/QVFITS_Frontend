/* Products Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import type { NewRow } from "../store/collectionStore";
import type { Photo, Product, ProductFilters, ProductRecord, StockMovement, StockReason } from "../types";

export { photosFor } from "./photos";

/**
 * The catalogue, on the API. Public reads see live pieces only, filtered and
 * sorted by the API; every read returns the expanded view screens use (names
 * for ids, stock per size). The admin edits the same rows (realm: admin); the
 * API checks permissions and the publishing rules, logs every stock change,
 * and keeps a sale from being undone by a product form opened before it.
 */

const P = routes.catalog;
const A = routes.adminCatalog;
const ADMIN = { realm: "admin" } as const;

/* Storefront */

/** A kit as the shop shows it: its pieces, its price and what it saves on buying them one by one. */
export interface KitView {
  id: string;
  slug: string;
  title: string;
  note: string;
  items: string[];
  price: number;
  /** The pieces bought one by one. */
  separate: number;
  photo?: Photo;
  position: number;
  live: boolean;
}

/** Live kits whose every piece is live and has stock in at least one size. */
export function listKits({ signal }: RequestOptions = {}) {
  return http.get<KitView[]>(P.kits, { signal });
}

export function listProducts(filters: ProductFilters = {}, { signal }: RequestOptions = {}) {
  return http.get<Product[]>(P.products, { params: { ...filters }, signal });
}

export function getProduct(slug: string, { signal }: RequestOptions = {}) {
  return http.get<Product>(`${P.products}/${encodeURIComponent(slug)}`, { signal });
}

/** Staff only: a piece by its address whatever its status, so a draft can be looked at on the real product page. */
export function getProductPreview(slug: string, { signal }: RequestOptions = {}) {
  return http.get<Product>(`${A.products}/preview/${encodeURIComponent(slug)}`, { ...ADMIN, signal });
}

/** Several live products by id, in the order asked; missing ids are skipped. */
export function getProductsByIds(ids: Id[], { signal }: RequestOptions = {}) {
  if (!ids.length) return Promise.resolve([] as Product[]);
  return http.get<Product[]>(P.productsByIds, { params: { ids: ids.join(",") }, signal });
}

/** Units left of one colour in one size. */
export function variantStock(p: Pick<ProductRecord, "variants">, colorId: Id, size: string) {
  return p.variants.find((v) => v.colorId === colorId && v.size === size)?.stock ?? 0;
}

/** A colour's id from its name, using the product's own colours (their names and ids line up). */
export function colorIdFor(p: Pick<Product, "colorIds" | "colors">, name: string) {
  const i = p.colors.indexOf(name);
  return i >= 0 ? p.colorIds[i] : name;
}

/* Admin (realm: admin) */

export type { StockReason };

export function listAllProducts({ signal }: RequestOptions = {}) {
  return http.get<Product[]>(A.products, { ...ADMIN, signal });
}

export function getProductById(id: Id, { signal }: RequestOptions = {}) {
  return http.get<Product>(`${A.products}/${id}`, { ...ADMIN, signal });
}

/** The stock log for the admin, newest first. */
export function listStockMovements({ signal }: RequestOptions = {}) {
  return http.get<StockMovement[]>(A.stockMovements, { ...ADMIN, signal });
}

export async function createProduct(data: NewRow<ProductRecord>) {
  const product = await http.post<Product>(A.products, data, ADMIN);
  logActivity({ module: "products", action: "create", entityId: product.id, summary: `Added product ${product.name}` });
  return product;
}

// The form sends the product as it opened it, updatedAt included, so the API can tell whether stock moved since.
export async function updateProduct(id: Id, patch: Partial<Product>) {
  const product = await http.patch<Product>(`${A.products}/${id}`, patch, ADMIN);
  logActivity({ module: "products", action: "update", entityId: id, summary: `Updated product ${product.name}` });
  return product;
}

export async function removeProduct(id: Id) {
  await http.del(`${A.products}/${id}`, ADMIN);
  logActivity({ module: "products", action: "delete", entityId: id, summary: `Deleted product ${id}` });
}

/** One change applied to many products: publish, archive, badge, sale, category. */
export async function bulkUpdateProducts(ids: Id[], patch: Partial<ProductRecord>) {
  const count = await http.post<number>(`${A.products}/bulk-update`, { ids, patch }, ADMIN);
  logActivity({ module: "products", action: "update", summary: `Updated ${count} products at once` });
  return count;
}

export async function bulkRemoveProducts(ids: Id[]) {
  const count = await http.post<number>(`${A.products}/bulk-delete`, { ids }, ADMIN);
  logActivity({ module: "products", action: "delete", summary: `Deleted ${count} products` });
  return count;
}

/** A copy as a draft, stock set to zero, for a new colourway or a similar piece. */
export async function duplicateProduct(id: Id) {
  const copy = await http.post<Product>(`${A.products}/${id}/duplicate`, undefined, ADMIN);
  logActivity({ module: "products", action: "create", entityId: copy.id, summary: `Duplicated ${copy.name.replace(/ \(copy\)$/, "")}` });
  return copy;
}

/** Moves every product in one category to another, so the first can be deleted. */
export async function reassignCategory(fromId: Id, toId: Id) {
  const count = await http.post<number>(`${A.products}/reassign-category`, { from: fromId, to: toId }, ADMIN);
  logActivity({ module: "categories", action: "update", summary: `Moved ${count} products to another category` });
  return count;
}

/** Sets one variant's stock, with the reason recorded in the stock log and the activity log. */
export async function setVariantStock(productId: Id, variantId: Id, stock: number, reason: StockReason) {
  const product = await http.put<Product>(`${A.products}/${productId}/variants/${variantId}/stock`, { stock, reason }, ADMIN);
  const variant = product.variants.find((v) => v.id === variantId);
  logActivity({ module: "products", action: "update", entityId: variantId, summary: `${product.name}, ${variant?.size ?? ""}: stock set to ${variant?.stock ?? stock} (${reason})` });
  return product;
}

/* Photos */

/**
 * Upload one photo (already resized in the browser) to ImageKit through the
 * API. `folder` says what it is for, which decides the permission needed.
 */
export function uploadPhoto(file: Blob, folder: "products" | "categories", fileName = "photo.webp") {
  const form = new FormData();
  form.append("folder", folder);
  form.append("file", file, fileName);
  return http.post<Photo>(routes.uploads, form, ADMIN);
}
