/* Products Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { createCollection, type NewRow } from "../store/collectionStore";
import type { Product, ProductFilters, ProductRecord, Variant } from "../types";
import { categories, colors, registerProducts, sortedSizes } from "./attributesApi";
import productSeed from "@/data/products.json";

export { photosFor } from "./photos";

/**
 * The catalogue. Rows are stored normalised (category and colours by id,
 * stock per colour and size); every read returns the expanded view screens
 * use. Public reads see active products only and filter and sort here, as
 * the API will. The admin edits the same rows (realm: admin once on HTTP).
 */
const products = createCollection<ProductRecord>("products", productSeed as unknown as ProductRecord[], { idPrefix: "prd" });
registerProducts(() => products.list());

/* The view */

function sizeOrder() {
  return new Map(sortedSizes().map((s, i) => [s.label, i]));
}

export function toView(r: ProductRecord): Product {
  const order = sizeOrder();
  const stock: Record<string, number> = {};
  for (const v of [...r.variants].sort((a, b) => (order.get(a.size) ?? 99) - (order.get(b.size) ?? 99))) {
    stock[v.size] = (stock[v.size] ?? 0) + v.stock;
  }
  return {
    ...r,
    category: categories.get(r.categoryId)?.name ?? "Uncategorised",
    colors: r.colorIds.map((id) => colors.get(id)?.name).filter((n): n is string => Boolean(n)),
    occasions: r.activityIds,
    stock,
  };
}

const VIEW_ONLY = ["category", "colors", "occasions", "stock"] as const;

/** A patch from a screen may carry view fields; only stored fields are saved. */
function toRecordPatch(patch: Partial<Product>): Partial<ProductRecord> {
  const clean: Record<string, unknown> = { ...patch };
  VIEW_ONLY.forEach((k) => delete clean[k]);
  return clean as Partial<ProductRecord>;
}

const views = () => products.list().map(toView);

/* Storefront */

const FEATURED: Record<string, number> = { Bestseller: 0, New: 1 };
const salePrice = (p: Product) => (p.salePercent ? Math.round(p.price * (1 - p.salePercent / 100)) : p.price);

function matches(p: Product, f: ProductFilters) {
  const q = f.q?.trim().toLowerCase();
  return (
    (!f.category || p.category === f.category) &&
    (!f.size || (p.stock[f.size] ?? 0) > 0) &&
    (!f.color || p.colors.includes(f.color)) &&
    (!f.occasion || f.occasion.split(",").some((o) => p.occasions.includes(o))) &&
    (!f.badge || p.badge === f.badge) &&
    (!f.sale || Boolean(p.salePercent)) &&
    (!f.inStock || Object.values(p.stock).some((n) => n > 0)) &&
    (!f.maxPrice || salePrice(p) <= f.maxPrice) &&
    (!q || [p.name, p.category, p.blurb, ...p.colors].join(" ").toLowerCase().includes(q))
  );
}

function sorted(rows: Product[], sort: ProductFilters["sort"] = "featured") {
  const list = [...rows];
  if (sort === "price-asc") return list.sort((a, b) => salePrice(a) - salePrice(b));
  if (sort === "price-desc") return list.sort((a, b) => salePrice(b) - salePrice(a));
  if (sort === "new") return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || Number(b.badge === "New") - Number(a.badge === "New"));
  return list.sort((a, b) => (FEATURED[a.badge ?? ""] ?? 2) - (FEATURED[b.badge ?? ""] ?? 2));
}

const live = () => views().filter((p) => p.status === "active");

export function listProducts(filters: ProductFilters = {}, { signal }: RequestOptions = {}) {
  return mockApi(() => sorted(live().filter((p) => matches(p, filters)), filters.sort), 200, signal);
}

export function getProduct(slug: string, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    const product = live().find((p) => p.slug === slug);
    if (!product) throw new ApiError("We could not find that piece.", 404);
    return product;
  }, 150, signal);
}

/** Several live products by id, in the order asked; missing ids are skipped. */
export function getProductsByIds(ids: Id[], { signal }: RequestOptions = {}) {
  return mockApi(() => {
    const all = live();
    return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  }, 150, signal);
}

/* Stock, shared with checkout and returns */

/** Moves stock on one variant. Checkout passes -qty, a refund +qty. */
export function moveStock(productId: Id, color: string, size: string, delta: number) {
  const row = products.get(productId);
  if (!row) return;
  const colorId = colors.list().find((c) => c.name === color || c.id === color)?.id ?? color;
  products.update(productId, {
    variants: row.variants.map((v) => (v.colorId === colorId && v.size === size ? { ...v, stock: Math.max(0, v.stock + delta) } : v)),
  });
}

/** Units left of one colour in one size. */
export function variantStock(p: Pick<ProductRecord, "variants">, colorId: Id, size: string) {
  return p.variants.find((v) => v.colorId === colorId && v.size === size)?.stock ?? 0;
}

/* Admin (realm: admin) */

const slugify = (name: string) => name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function uniqueSlug(base: string, selfId?: Id) {
  const taken = new Set(products.list().filter((p) => p.id !== selfId).map((p) => p.slug));
  let slug = base || "piece";
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

/** Every colour picked gets a variant per size picked, keeping stock already entered. */
export function buildVariants(sku: string, colorIds: Id[], sizes: string[], previous: Variant[] = []): Variant[] {
  return colorIds.flatMap((colorId) =>
    sizes.map((size) => {
      const had = previous.find((v) => v.colorId === colorId && v.size === size);
      return had ?? { id: `${sku}--${colorId}--${slugify(size)}`, sku: `${sku}-${colorId.slice(0, 3).toUpperCase()}-${size}`, colorId, size, stock: 0 };
    }),
  );
}

export function listAllProducts({ signal }: RequestOptions = {}) {
  return mockApi(views, 200, signal);
}

export function getProductById(id: Id, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    const row = products.get(id);
    if (!row) throw new ApiError("That product no longer exists.", 404);
    return toView(row);
  }, 120, signal);
}

export function createProduct(data: NewRow<ProductRecord>) {
  return mockApi(() => {
    assertCan("products", "edit");
    const now = new Date().toISOString();
    const slug = uniqueSlug(slugify(data.slug || data.name));
    const row = products.create({
      ...toRecordPatch(data as Partial<Product>),
      id: data.id || slug,
      slug,
      status: data.status ?? "draft",
      variants: data.variants ?? [],
      photos: data.photos ?? [],
      seo: data.seo ?? { title: "", description: "" },
      createdAt: now,
      updatedAt: now,
    } as NewRow<ProductRecord>);
    logActivity({ module: "products", action: "create", entityId: row.id, summary: `Added product ${row.name}` });
    return toView(row);
  });
}

export function updateProduct(id: Id, patch: Partial<Product>) {
  return mockApi(() => {
    assertCan("products", "edit");
    const clean = toRecordPatch(patch);
    if (clean.slug !== undefined) clean.slug = uniqueSlug(slugify(clean.slug || clean.name || ""), id);
    const row = products.update(id, { ...clean, updatedAt: new Date().toISOString() });
    if (!row) throw new ApiError("That product no longer exists.", 404);
    logActivity({ module: "products", action: "update", entityId: id, summary: `Updated product ${row.name}` });
    return toView(row);
  });
}

export function removeProduct(id: Id) {
  return mockApi(() => {
    assertCan("products", "delete");
    const row = products.get(id);
    products.remove(id);
    logActivity({ module: "products", action: "delete", entityId: id, summary: `Deleted product ${row?.name ?? id}` });
  });
}

/** One change applied to many products: publish, archive, badge, sale, category. */
export function bulkUpdateProducts(ids: Id[], patch: Partial<ProductRecord>) {
  return mockApi(() => {
    assertCan("products", "edit");
    const now = new Date().toISOString();
    ids.forEach((id) => products.update(id, { ...patch, updatedAt: now }));
    logActivity({ module: "products", action: "update", summary: `Updated ${ids.length} products at once` });
    return ids.length;
  });
}

export function bulkRemoveProducts(ids: Id[]) {
  return mockApi(() => {
    assertCan("products", "delete");
    ids.forEach((id) => products.remove(id));
    logActivity({ module: "products", action: "delete", summary: `Deleted ${ids.length} products` });
    return ids.length;
  });
}

/** A copy as a draft, stock set to zero, for a new colourway or a similar piece. */
export function duplicateProduct(id: Id) {
  return mockApi(() => {
    assertCan("products", "edit");
    const src = products.get(id);
    if (!src) throw new ApiError("That product no longer exists.", 404);
    const slug = uniqueSlug(`${src.slug}-copy`);
    const now = new Date().toISOString();
    const row = products.create({
      ...src,
      id: slug,
      slug,
      name: `${src.name} (copy)`,
      status: "draft",
      variants: src.variants.map((v) => ({ ...v, id: v.id.replace(src.id, slug), stock: 0 })),
      createdAt: now,
      updatedAt: now,
    });
    logActivity({ module: "products", action: "create", entityId: row.id, summary: `Duplicated ${src.name}` });
    return toView(row);
  });
}

/** Moves every product in one category to another, so the first can be deleted. */
export function reassignCategory(fromId: Id, toId: Id) {
  return mockApi(() => {
    assertCan("products", "edit");
    const moved = products.list().filter((p) => p.categoryId === fromId);
    moved.forEach((p) => products.update(p.id, { categoryId: toId }));
    logActivity({ module: "categories", action: "update", summary: `Moved ${moved.length} products to another category` });
    return moved.length;
  });
}

/* Inventory */

export type StockReason = "restock" | "sale" | "damaged" | "correction" | "return";

/** Sets one variant's stock, with the reason recorded in the activity log. */
export function setVariantStock(productId: Id, variantId: Id, stock: number, reason: StockReason) {
  return mockApi(() => {
    assertCan("inventory", "edit");
    const row = products.get(productId);
    const variant = row?.variants.find((v) => v.id === variantId);
    if (!row || !variant) throw new ApiError("That item no longer exists.", 404);
    const next = Math.max(0, Math.round(stock));
    products.update(productId, { variants: row.variants.map((v) => (v.id === variantId ? { ...v, stock: next } : v)), updatedAt: new Date().toISOString() });
    logActivity({
      module: "inventory",
      action: "update",
      entityId: variantId,
      summary: `${row.name}, ${colors.get(variant.colorId)?.name ?? variant.colorId} ${variant.size}: ${variant.stock} to ${next} (${reason})`,
    });
    return toView(products.get(productId)!);
  });
}
