/* Products Service */
import { matchesSearch } from "@/utils/search";
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan, sessionAdmin } from "../auth/adminSession";
import { createCollection, type NewRow } from "../store/collectionStore";
import type { Order, Photo, Product, ProductFilters, ProductRecord, StockMovement, StockReason, Variant } from "../types";
import { categories, colors, registerProducts, sizes, sortedSizes } from "./attributesApi";
import { readSettings } from "../content/settingsApi";
import { queueEmail } from "../notifications/outboxApi";
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

/* Sales, for best sellers */

// ordersApi registers its table here, so this file can count units sold
// without importing orders (which import this file for stock).
let orderRows: () => Order[] = () => [];
export function registerOrders(rows: () => Order[]) {
  orderRows = rows;
}

/** Statuses that mean the money came in; cancelled and refunded orders don't count. */
export const PAID_STATUSES = new Set(["paid", "packed", "out_for_delivery", "delivered", "exchanged"]);
const SALES_DAYS = 90;

/**
 * Units sold per product in paid orders over the last 90 days, and the set
 * of best sellers: every pinned piece plus the top N by units (Settings).
 */
function salesContext() {
  const since = Date.now() - SALES_DAYS * 86_400_000;
  const units = new Map<string, number>();
  for (const o of orderRows()) {
    if (!PAID_STATUSES.has(o.status) || Date.parse(o.createdAt) < since) continue;
    for (const l of o.lines) units.set(l.productId, (units.get(l.productId) ?? 0) + l.qty);
  }
  const top = new Set(
    [...units.entries()]
      .filter(([id, n]) => n > 0 && products.get(id)?.status === "active")
      .sort((a, b) => b[1] - a[1])
      .slice(0, readSettings().bestsellerCount ?? 8)
      .map(([id]) => id),
  );
  return { units, top };
}

/* The view */

function sizeOrder() {
  return new Map(sortedSizes().map((s, i) => [s.label, i]));
}

export function toView(r: ProductRecord, sales = salesContext()): Product {
  const order = sizeOrder();
  const isBestseller = r.type !== "kit" && (r.pinnedBestseller || sales.top.has(r.id));
  const stock: Record<string, number> = {};
  for (const v of [...r.variants].sort((a, b) => (order.get(a.size) ?? 99) - (order.get(b.size) ?? 99))) {
    stock[v.size] = (stock[v.size] ?? 0) + v.stock;
  }
  return {
    ...r,
    isBestseller,
    unitsSold: sales.units.get(r.id) ?? 0,
    badge: isBestseller ? "Bestseller" : r.isNew ? "New" : null,
    category: r.type === "kit" ? "Kit" : categories.get(r.categoryId)?.name ?? "Uncategorised",
    categorySlug: categories.get(r.categoryId)?.slug ?? "",
    colors: r.colorIds.map((id) => colors.get(id)?.name).filter((n): n is string => Boolean(n)),
    stock,
  };
}

const VIEW_ONLY = ["category", "categorySlug", "colors", "stock", "isBestseller", "unitsSold", "badge"] as const;

/** A patch from a screen may carry view fields; only stored fields are saved. */
function toRecordPatch(patch: Partial<Product>): Partial<ProductRecord> {
  const clean: Record<string, unknown> = { ...patch };
  VIEW_ONLY.forEach((k) => delete clean[k]);
  return clean as Partial<ProductRecord>;
}

// Every product as the shop and the admin read it (names for ids, stock per size, units sold), with the sales counted once for the whole list.
const views = () => {
  const sales = salesContext();
  return products.list().map((r) => toView(r, sales));
};

/* Storefront */

// Featured order: best sellers first, then new arrivals, then the rest.
const FEATURED: Record<string, number> = { Bestseller: 0, New: 1 };
const LABEL_MATCH: Record<string, (p: Product) => boolean> = { New: (p) => p.isNew, Bestseller: (p) => p.isBestseller };
// The price a shopper pays: the sale percent comes off when the piece has one (the shop only shows it while the sale is switched on).
const salePrice = (p: Product) => (p.salePercent ? Math.round(p.price * (1 - p.salePercent / 100)) : p.price);

// Whether a product passes every filter given; an empty filter lets everything through, and a size or "in stock" filter only counts units actually on the shelf.
function matches(p: Product, f: ProductFilters) {
  const q = f.q?.trim();
  return (
    (!f.categoryId || p.categoryId === f.categoryId) &&
    (!f.size || (p.stock[f.size] ?? 0) > 0) &&
    (!f.color || p.colors.includes(f.color)) &&
    (!f.term || f.term.split(",").some((t) => p.termIds.includes(t))) &&
    (!f.badge || (LABEL_MATCH[f.badge]?.(p) ?? p.badge === f.badge)) &&
    (!f.sale || Boolean(p.salePercent)) &&
    (!f.inStock || Object.values(p.stock).some((n) => n > 0)) &&
    (!f.maxPrice || salePrice(p) <= f.maxPrice) &&
    // Every word typed must be found (name, category, description, colours, details, fabric), plural or singular.
    (!q || matchesSearch([p.name, p.category, p.blurb, p.fabric, ...p.colors, ...(p.details ?? [])].join(" "), q))
  );
}

// Sorting works on a copy, so the stored list's order is never changed.
function sorted(rows: Product[], sort: ProductFilters["sort"] = "featured") {
  const list = [...rows];
  if (sort === "price-asc") return list.sort((a, b) => salePrice(a) - salePrice(b));
  if (sort === "price-desc") return list.sort((a, b) => salePrice(b) - salePrice(a));
  if (sort === "new") return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || Number(b.badge === "New") - Number(a.badge === "New"));
  return list.sort((a, b) => (FEATURED[a.badge ?? ""] ?? 2) - (FEATURED[b.badge ?? ""] ?? 2));
}

// The shop's pieces. Kits are listed on their own (listKits), never in the grid.
const live = () => views().filter((p) => p.status === "active" && p.type !== "kit");

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

/** One live kit as stored, for pricing a bag (checkout). */
export function getLiveKit(id: Id) {
  const k = products.get(id);
  return k && k.type === "kit" && k.status === "active" ? k : null;
}

/**
 * Live kits whose every piece is live and has stock in at least one size,
 * so a kit is never offered when a piece can't be sent.
 */
export function listKits({ signal }: RequestOptions = {}) {
  return mockApi<KitView[]>(() => {
    const all = views();
    const piece = (id: string) => all.find((p) => p.id === id && p.status === "active");
    return all
      .filter((k) => k.type === "kit" && k.status === "active")
      .filter((k) => k.kitItems.length >= 2 && k.kitItems.every((id) => Object.values(piece(id)?.stock ?? {}).some((n) => n > 0)))
      .map((k, position) => ({
        id: k.id,
        slug: k.slug,
        title: k.name,
        note: k.blurb,
        items: k.kitItems,
        price: k.price,
        separate: k.kitItems.reduce((n, id) => n + (piece(id)?.price ?? 0), 0),
        photo: k.photos[0],
        position,
        live: true,
      }));
  }, 100, signal);
}

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

/**
 * Staff only: a piece by its address whatever its status, so a draft can be
 * looked at on the real product page before it goes live.
 */
export function getProductPreview(slug: string, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    assertCan("products", "view");
    const row = products.list().find((p) => p.slug === slug);
    if (!row) throw new ApiError("We could not find that piece.", 404);
    return toView(row);
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

// Every change to a size's stock, newest first, so counts never drift
// without a reason. Staff edits, orders, cancellations and returns all land here.
const movements = createCollection<StockMovement>("stock-movements", [], { idPrefix: "mov" });
const KEEP_MOVEMENTS = 1000;

// One line in the stock log: who changed which size of which colour, from how many to how many, and why. No change writes nothing.
function recordMovement(row: ProductRecord, colorId: Id, size: string, from: number, to: number, reason: StockReason, ref?: string) {
  if (from === to) return;
  movements.create({
    at: new Date().toISOString(),
    productId: row.id,
    productName: row.name,
    color: colors.get(colorId)?.name ?? colorId,
    size,
    from,
    to,
    reason,
    ref,
    by: sessionAdmin()?.name ?? (reason === "order" ? "Checkout" : "The shop"),
  });
  const all = movements.list();
  if (all.length > KEEP_MOVEMENTS) movements.replace(all.slice(0, KEEP_MOVEMENTS));
}

/**
 * Moves stock on one variant and records why. Checkout passes -qty
 * ("order"), a cancellation or a received return +qty.
 */
export function moveStock(productId: Id, color: string, size: string, delta: number, reason: StockReason = "correction", ref?: string) {
  const row = products.get(productId);
  if (!row) return;
  const colorId = colors.list().find((c) => c.name === color || c.id === color)?.id ?? color;
  const variant = row.variants.find((v) => v.colorId === colorId && v.size === size);
  if (!variant) return;
  const next = Math.max(0, variant.stock + delta);
  products.update(productId, { variants: row.variants.map((v) => (v === variant ? { ...v, stock: next } : v)) });
  recordMovement(row, colorId, size, variant.stock, next, reason, ref);
  // An order that takes a size down to the low level tells the owner once (gap S4).
  const settings = readSettings();
  const low = settings.lowStockAt;
  if (reason === "order" && variant.stock > low && next <= low && settings.email) {
    queueEmail({
      to: settings.email,
      kind: "low-stock",
      ref,
      subject: `${row.name} is running low`,
      body: `${row.name}, ${colors.get(colorId)?.name ?? colorId} ${size}: ${next === 0 ? "sold out" : `${next} left`} after order ${ref}. Restock under Products, Stock.`,
    });
  }
}

/** The stock log for the admin, newest first. */
export function listStockMovements({ signal }: RequestOptions = {}) {
  return mockApi(() => {
    assertCan("products", "view");
    return [...movements.list()].sort((a, b) => b.at.localeCompare(a.at));
  }, 120, signal);
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

/**
 * The catalogue is set up first: a product needs a category to sit in, and
 * a piece needs colours and sizes to be made in.
 */
function assertSetUp() {
  const missing = [
    !categories.list().some((c) => c.active) && "a category",
    !colors.list().length && "a colour",
    !sizes.list().length && "a size",
  ].filter(Boolean);
  if (missing.length) throw new ApiError(`Add ${missing.join(", ")} first, under Catalog.`, 422);
}

/** What a product needs before shoppers can see it. Drafts can be saved half done. */
function assertPublishable(r: Partial<ProductRecord>) {
  if (r.status !== "active") return;
  if (!r.name?.trim() || !(Number(r.price) > 0)) throw new ApiError("A published product needs a name and a price.", 422);
  if (!r.photos?.length) throw new ApiError("Add at least one photo before publishing.", 422);
  if (r.type === "kit") {
    const pieces = (r.kitItems ?? []).map((id) => products.get(id));
    if (pieces.length < 2) throw new ApiError("A kit needs at least two pieces.", 422);
    if (pieces.some((p) => !p || p.type === "kit")) throw new ApiError("A kit can only hold single pieces.", 422);
    if (pieces.some((p) => p?.status !== "active")) throw new ApiError("Publish every piece in the kit first.", 422);
    return;
  }
  if (!r.categoryId) throw new ApiError("Pick a category before publishing.", 422);
  if (!r.variants?.some((v) => v.stock > 0)) throw new ApiError("Add stock in at least one size before publishing.", 422);
}

export function createProduct(data: NewRow<ProductRecord>) {
  return mockApi(() => {
    assertCan("products", "edit");
    assertSetUp();
    assertPublishable({ ...data, type: data.type ?? "piece" } as Partial<ProductRecord>);
    const now = new Date().toISOString();
    // The address always comes from the name; nobody types one.
    const slug = uniqueSlug(slugify(data.name));
    const row = products.create({
      ...toRecordPatch(data as Partial<Product>),
      type: data.type ?? "piece",
      id: data.id || slug,
      slug,
      status: data.status ?? "draft",
      kitItems: data.type === "kit" ? data.kitItems ?? [] : [],
      // A new piece is new unless the admin says otherwise.
      isNew: data.isNew ?? data.type !== "kit",
      pinnedBestseller: data.pinnedBestseller ?? false,
      variants: data.type === "kit" ? [] : data.variants ?? [],
      photos: data.photos ?? [],
      seo: data.seo ?? { title: "", description: "" },
      createdAt: now,
      updatedAt: now,
    } as NewRow<ProductRecord>);
    // The opening stock of a new piece goes in the stock log as a restock.
    row.variants.forEach((v) => recordMovement(row, v.colorId, v.size, 0, v.stock, "restock"));
    logActivity({ module: "products", action: "create", entityId: row.id, summary: `Added product ${row.name}` });
    return toView(row);
  });
}

export function updateProduct(id: Id, patch: Partial<Product>) {
  return mockApi(() => {
    assertCan("products", "edit");
    const clean = toRecordPatch(patch);
    delete clean.slug;
    const before = products.get(id);
    // The address follows the name while the piece is still a draft that was never
    // published; once it has been live it is frozen, so a shared link never breaks.
    const everLive = before?.status === "active" || before?.slugLocked || clean.status === "active";
    if (before && clean.name && clean.name !== before.name && !everLive) clean.slug = uniqueSlug(slugify(clean.name), id);
    if (everLive) clean.slugLocked = true;
    if (before) assertPublishable({ ...before, ...clean });
    // A piece still in a live kit can't leave the shop, or the kit couldn't be sent.
    if (before && clean.status && clean.status !== "active" && before.type !== "kit") {
      const kit = products.list().find((k) => k.type === "kit" && k.status === "active" && k.kitItems.includes(id));
      if (kit) throw new ApiError(`${before.name} is in the kit ${kit.name}. Take it out of the kit, or unpublish the kit first.`, 409);
    }
    const row = products.update(id, { ...clean, updatedAt: new Date().toISOString() });
    if (!row) throw new ApiError("That product no longer exists.", 404);
    // Stock typed into the product form is logged as a count correction.
    if (before && clean.variants) {
      for (const v of clean.variants) {
        const was = before.variants.find((x) => x.id === v.id)?.stock ?? 0;
        recordMovement(row, v.colorId, v.size, was, v.stock, "correction");
      }
    }
    logActivity({ module: "products", action: "update", entityId: id, summary: `Updated product ${row.name}` });
    return toView(row);
  });
}

// A piece that sits in a kit can't be deleted, or the kit couldn't be sent.
export function removeProduct(id: Id) {
  return mockApi(() => {
    assertCan("products", "delete");
    const row = products.get(id);
    const kit = products.list().find((k) => k.type === "kit" && k.kitItems.includes(id));
    if (kit) throw new ApiError(`${row?.name ?? "This piece"} is in the kit ${kit.name}. Take it out of the kit first.`, 409);
    products.remove(id);
    logActivity({ module: "products", action: "delete", entityId: id, summary: `Deleted product ${row?.name ?? id}` });
  });
}

/** One change applied to many products: publish, archive, badge, sale, category. */
export function bulkUpdateProducts(ids: Id[], patch: Partial<ProductRecord>) {
  return mockApi(() => {
    assertCan("products", "edit");
    const now = new Date().toISOString();
    // Publishing several at once runs the same checks as one at a time, and names the first that fails.
    if (patch.status === "active") {
      for (const id of ids) {
        const row = products.get(id);
        if (!row) continue;
        try {
          assertPublishable({ ...row, ...patch });
        } catch (e) {
          throw new ApiError(`${row.name}: ${(e as Error).message}`, 422);
        }
      }
    }
    ids.forEach((id) => products.update(id, { ...patch, updatedAt: now }));
    logActivity({ module: "products", action: "update", summary: `Updated ${ids.length} products at once` });
    return ids.length;
  });
}

// Several products removed together, as ticked in the list.
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
      pinnedBestseller: false,
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

/* Stock */

export type { StockReason };

/** Sets one variant's stock, with the reason recorded in the stock log and the activity log. */
export function setVariantStock(productId: Id, variantId: Id, stock: number, reason: StockReason) {
  return mockApi(() => {
    assertCan("products", "edit");
    const row = products.get(productId);
    const variant = row?.variants.find((v) => v.id === variantId);
    if (!row || !variant) throw new ApiError("That item no longer exists.", 404);
    const next = Math.max(0, Math.round(stock));
    products.update(productId, { variants: row.variants.map((v) => (v.id === variantId ? { ...v, stock: next } : v)), updatedAt: new Date().toISOString() });
    recordMovement(row, variant.colorId, variant.size, variant.stock, next, reason);
    logActivity({
      module: "products",
      action: "update",
      entityId: variantId,
      summary: `${row.name}, ${colors.get(variant.colorId)?.name ?? variant.colorId} ${variant.size}: ${variant.stock} to ${next} (${reason})`,
    });
    return toView(products.get(productId)!);
  });
}
