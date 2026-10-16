/* Domain Types */

/**
 * The contract with qvfits-api (docs/05-backend-integration.md). Mocks return
 * exactly these shapes, so a service moves to HTTP without a screen changing.
 * The seeds in src/data/*.json are stored rows; services return views that
 * expand ids into names where a screen needs them. All money is UGX, as whole
 * shillings.
 */

import type { Id } from "./api/types";

export type { Id };

/* Attributes: managed under Catalog, read by the shop filters */

export interface Category {
  id: Id;
  name: string;
  slug: string;
  parentId: Id | null;
  /** A photo id in /photos for the category tile. */
  image?: string;
  description: string;
  position: number;
  active: boolean;
}

export interface Color {
  id: Id;
  name: string;
  hex: string;
  position: number;
}

export interface SizeOption {
  id: Id;
  label: string;
  group: "apparel" | "shoe" | (string & {});
  position: number;
}

export interface Activity {
  id: Id;
  label: string;
  position: number;
}

export type FacetId = "category" | "size" | "color" | "activity" | "price";

export interface FilterConfig {
  facets: { id: FacetId; label: string; visible: boolean; position: number }[];
}

/* Catalog */

export type Size = "XS" | "S" | "M" | "L" | "XL" | (string & {});
export type Badge = "New" | "Bestseller" | (string & {});
export type ProductStatus = "draft" | "active" | "archived";

/**
 * One photo. Local: its id in /photos and the WebP widths on disk. Remote:
 * `url` on an image CDN that resizes on request (Unsplash today, Spaces once
 * the API lands); `widths` are the sizes to ask it for.
 */
export interface Photo {
  id: string;
  url?: string;
  width: number;
  height: number;
  widths: number[];
  /** The colourway this photo shows, if any. */
  colorId?: Id | null;
}

/** One sellable unit: a colour in a size, with its own SKU and stock. */
export interface Variant {
  id: Id;
  sku: string;
  colorId: Id;
  size: Size;
  stock: number;
}

/** A product as stored (src/data/products.json and the API's table). */
export interface ProductRecord {
  id: Id;
  /** The URL part, /product/:slug. */
  slug: string;
  name: string;
  status: ProductStatus;
  categoryId: Id;
  price: number;
  compareAtPrice?: number | null;
  salePercent?: number | null;
  badge?: Badge | null;
  colorIds: Id[];
  activityIds: Id[];
  blurb: string;
  details: string[];
  fit?: "small" | "true" | "large" | "relaxed" | null;
  fitNote?: string;
  fabric?: string;
  care?: string;
  variants: Variant[];
  photos: Photo[];
  seo: { title: string; description: string };
  createdAt: string;
  updatedAt: string;
}

/**
 * A product as screens read it: the record plus names for its ids, and stock
 * per size summed across colours, so the shop never joins tables itself.
 */
export interface Product extends ProductRecord {
  category: string;
  colors: string[];
  occasions: string[];
  /** Units on hand per size, across every colour. 0 = sold out in that size. */
  stock: Record<Size, number>;
}

export interface ProductFilters {
  category?: string;
  size?: Size;
  color?: string;
  occasion?: string;
  badge?: string;
  sale?: boolean;
  inStock?: boolean;
  maxPrice?: number;
  q?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "new";
}

export type ReviewStatus = "pending" | "approved" | "hidden";

export interface Review {
  id: Id;
  productId: Id | null;
  name: string;
  text: string;
  stars: number;
  status: ReviewStatus;
  createdAt: string;
  badge?: string;
}

export interface SizeRow {
  size: Size;
  [measure: string]: string | number | number[];
}

/* Shop settings and content */

export interface Currency {
  code: string;
  label: string;
  /** How much of this currency one shilling buys. */
  perUGX: number;
  decimals: number;
  display?: "code" | "symbol" | "narrowSymbol";
}

export interface ShopSettings {
  brand: string;
  wordmark: string;
  tagline: string;
  blurb: string;
  address: string;
  addressNote?: string;
  mapsUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  instagramHandle: string;
  tiktok?: string;
  tiktokHandle?: string;
  opensAt: string;
  currency: "UGX";
  /** Free delivery from this subtotal, unless a zone sets its own. */
  freeShippingOver: number;
  /** Days after delivery an unworn piece can be exchanged. */
  exchangeDays: number;
  /** A size at or under this many units counts as low stock. */
  lowStockAt: number;
  ratesUpdated: string;
  currencies: Currency[];
  assistant: { endpoint: string | null; name: string; greeting: string };
  /** Read only, on reads: the active delivery zones, so every page that shows a fee has them. */
  zones?: ShippingZone[];
}

export interface ShippingZone {
  id: Id;
  name: string;
  description: string;
  fee: number;
  /** Free delivery from this subtotal; null uses the shop-wide threshold. */
  freeOver: number | null;
  /** Collected from the showroom, so no address is needed. */
  collect: boolean;
  etaDays: string;
  active: boolean;
  position: number;
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  short: string;
  instructions: string;
  active: boolean;
  position: number;
}

export interface FaqItem {
  id: Id;
  q: string;
  a: string;
  group: string;
  position: number;
}

/* Cart and orders */

export interface CartLine {
  productId: Id;
  size: Size;
  color: string;
  qty: number;
}

/** A shipping zone id: kampala, upcountry, pickup, or one the admin adds. */
export type DeliveryRegion = string;
export type PaymentMethod = "mtn" | "airtel" | "card" | "whatsapp" | (string & {});

export type OrderStatus =
  | "pending"
  | "paid"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "exchanged"
  | "refunded";

export type PaymentStatus = "unpaid" | "paid" | "partially_refunded" | "refunded";

export interface OrderLine extends CartLine {
  name: string;
  price: number;
  colorId?: Id;
}

export interface OrderEvent {
  status: OrderStatus;
  at: string;
  by: string;
  note?: string;
}

export interface OrderNote {
  id: Id;
  text: string;
  by: string;
  at: string;
}

export interface Order {
  id: Id;
  /** What the customer quotes: QV-XXXXXX. */
  ref: string;
  customerId?: Id;
  name: string;
  phone: string;
  email?: string;
  region: DeliveryRegion;
  address?: string;
  note?: string;
  lines: OrderLine[];
  subtotal: number;
  delivery: number;
  discount: number;
  discountCode?: string;
  total: number;
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  history: OrderEvent[];
  notes: OrderNote[];
  /** Entered by staff for a WhatsApp or showroom sale. */
  source?: "web" | "manual";
  createdAt: string;
}

export interface CheckoutInput {
  name: string;
  phone: string;
  email?: string;
  region: DeliveryRegion;
  address?: string;
  note?: string;
  payment: PaymentMethod;
  lines: CartLine[];
  discountCode?: string;
}

export type TransactionType = "payment" | "refund";
export type TransactionStatus = "pending" | "succeeded" | "failed";

export interface Transaction {
  id: Id;
  orderId: Id;
  orderRef: string;
  type: TransactionType;
  method: PaymentMethod;
  amount: number;
  status: TransactionStatus;
  /** The gateway's or mobile money reference. */
  reference: string;
  note?: string;
  createdAt: string;
}

export type ReturnStatus = "requested" | "approved" | "rejected" | "received" | "refunded" | "exchanged";

export interface ReturnRequest {
  id: Id;
  orderId: Id;
  orderRef: string;
  customerId?: Id;
  name: string;
  lines: { productId: Id; name: string; size: Size; color: string; qty: number; price: number }[];
  reason: string;
  resolution: "refund" | "exchange";
  status: ReturnStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/* People */

export interface Address {
  id: Id;
  label: string;
  region: DeliveryRegion;
  address: string;
  phone: string;
}

export interface Customer {
  id: Id;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  wishlist: Id[];
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export type PermissionAction = "view" | "edit" | "delete";

/** One admin module the permission matrix covers. */
export interface PermissionModule {
  id: string;
  label: string;
  actions: PermissionAction[];
}

export type PermissionMap = Record<string, PermissionAction[]>;

export interface Role {
  id: Id;
  name: string;
  description: string;
  /** Owner, Manager and Staff ship with the shop and cannot be deleted. */
  system: boolean;
  permissions: PermissionMap;
}

export type AdminRole = "owner" | "manager" | "staff" | (string & {});

export interface StaffMember {
  id: Id;
  name: string;
  email: string;
  roleId: AdminRole;
  /** Per-person changes on top of the role, module by module. */
  overrides: PermissionMap;
  status: "active" | "invited" | "suspended";
  lastSeenAt: string | null;
  createdAt: string;
}

/** The signed-in admin, with the permissions their role and overrides give. */
export interface AdminUser {
  id: Id;
  name: string;
  email: string;
  role: AdminRole;
  permissions: PermissionMap;
}

export interface ActivityEntry {
  id: Id;
  actorId: Id | null;
  actorName: string;
  module: string;
  action: "create" | "update" | "delete" | (string & {});
  entityId: Id | null;
  summary: string;
  at: string;
}

/* Marketing */

export interface Subscriber {
  id: Id;
  email: string;
  createdAt: string;
}

export type DiscountType = "percent" | "fixed" | "free_shipping";

export interface Discount {
  id: Id;
  code: string;
  description: string;
  type: DiscountType;
  /** Percent off, or shillings off for a fixed code; ignored for free shipping. */
  value: number;
  minSpend: number;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  usedCount: number;
  appliesTo: { scope: "all" | "categories" | "products"; ids: Id[] };
  active: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: Id;
  name: string;
  phone?: string;
  email?: string;
  topic?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}
