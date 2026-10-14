/* Products Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { createCollection, type NewRow } from "../store/collectionStore";
import type { Photo, Product, ProductFilters } from "../types";
import { PRODUCT_IMAGES } from "@/data/productImages";
import { PHOTO_DIMS, PRODUCTS } from "@/data/shop";

/**
 * The catalogue. Public reads filter and sort here, as the API will; the
 * admin edits the same rows through the collection store (realm: admin for
 * create / update / remove once on HTTP).
 */

type Dims = [number, number, number[]];

/** The local photos for an id on disk: <id> and <id>-2 (hero, campaign). */
export function photosFor(id: string): Photo[] {
  const dims = PHOTO_DIMS as unknown as Record<string, Dims>;
  return [id, `${id}-2`]
    .filter((key) => dims[key])
    .map((key) => {
      const [width, height, widths] = dims[key];
      return { id: key, width, height, widths };
    });
}

/** A product's stock photos on Unsplash, cropped to the card's 3:4 on request. */
function stockPhotosFor(id: string): Photo[] {
  const ids = (PRODUCT_IMAGES as Record<string, string[]>)[id] ?? [];
  return ids.map((photoId) => ({
    id: photoId,
    url: `https://images.unsplash.com/photo-${photoId}`,
    width: 1200,
    height: 1600,
    widths: [400, 800, 1200],
  }));
}

const seed: Product[] = (PRODUCTS as Omit<Product, "slug" | "photos">[]).map((p) => ({
  ...p,
  slug: p.id,
  photos: stockPhotosFor(p.id),
}));

const products = createCollection<Product>("products", seed, { idPrefix: "prd" });

const FEATURED: Record<string, number> = { Bestseller: 0, New: 1 };

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
    (!q || [p.name, p.category, p.blurb, ...p.colors].join(" ").toLowerCase().includes(q))
  );
}

function sorted(rows: Product[], sort: ProductFilters["sort"] = "featured") {
  const list = [...rows];
  if (sort === "price-asc") return list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return list.sort((a, b) => b.price - a.price);
  if (sort === "new") return list.sort((a, b) => Number(b.badge === "New") - Number(a.badge === "New"));
  return list.sort((a, b) => (FEATURED[a.badge ?? ""] ?? 2) - (FEATURED[b.badge ?? ""] ?? 2));
}

export function listProducts(filters: ProductFilters = {}, { signal }: RequestOptions = {}) {
  return mockApi(() => sorted(products.list().filter((p) => matches(p, filters)), filters.sort), 200, signal);
}

export function getProduct(slug: string, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    const product = products.list().find((p) => p.slug === slug);
    if (!product) throw new ApiError("We could not find that piece.", 404);
    return product;
  }, 150, signal);
}

/** Several products by id, in the order asked; missing ids are skipped. */
export function getProductsByIds(ids: Id[], { signal }: RequestOptions = {}) {
  return mockApi(() => ids.map((id) => products.get(id)).filter((p): p is Product => Boolean(p)), 150, signal);
}

/* Admin (realm: admin) */

export function listAllProducts({ signal }: RequestOptions = {}) {
  return mockApi(() => products.list(), 200, signal);
}

export function createProduct(data: NewRow<Product>) {
  return mockApi(() => products.create({ ...data, slug: data.slug || slugify(data.name) }));
}

export function updateProduct(id: Id, patch: Partial<Product>) {
  return mockApi(() => products.update(id, patch));
}

export function removeProduct(id: Id) {
  return mockApi(() => products.remove(id));
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
