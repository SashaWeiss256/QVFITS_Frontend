/* Domain Types */

/**
 * The contract with qvfits-api (docs/05-backend-integration.md). Mocks return
 * exactly these shapes, so a service moves to HTTP without a screen changing.
 * All money is UGX, as whole shillings.
 */

import type { Id } from "./api/types";

export type { Id };

/* Catalog */

export type Size = "XS" | "S" | "M" | "L" | "XL" | (string & {});
export type Badge = "New" | "Bestseller" | (string & {});

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
}

export interface Product {
  id: Id;
  /** The URL part, /product/:slug. Same as id for the seeded catalogue. */
  slug: string;
  name: string;
  category: string;
  price: number;
  salePercent?: number;
  colors: string[];
  badge?: Badge;
  occasions: string[];
  blurb: string;
  details: string[];
  fit?: "small" | "true" | "large";
  fitNote?: string;
  fabric?: string;
  /** Units on hand per size. 0 = sold out in that size. */
  stock: Record<Size, number>;
  photos: Photo[];
}

export interface ProductFilters {
  category?: string;
  size?: Size;
  color?: string;
  occasion?: string;
  badge?: string;
  sale?: boolean;
  inStock?: boolean;
  q?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "new";
}

export interface Review {
  name: string;
  text: string;
  stars?: number;
  when?: string;
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
  freeShippingOver: number;
  kampalaDelivery: number;
  upcountryDelivery: number;
  /** Days after delivery an unworn piece can be exchanged. */
  exchangeDays: number;
  ratesUpdated: string;
  currencies: Currency[];
}

export interface FaqItem {
  q: string;
  a: string;
}

/* Cart and orders */

export interface CartLine {
  productId: Id;
  size: Size;
  color: string;
  qty: number;
}

export type DeliveryRegion = "kampala" | "upcountry" | "pickup";
export type PaymentMethod = "mtn" | "airtel" | "card" | "whatsapp";

export type OrderStatus =
  | "pending"
  | "paid"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "exchanged";

export interface OrderLine extends CartLine {
  name: string;
  price: number;
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
  total: number;
  payment: PaymentMethod;
  status: OrderStatus;
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
  createdAt: string;
}

export type AdminRole = "owner" | "staff";

export interface AdminUser {
  id: Id;
  name: string;
  email: string;
  role: AdminRole;
}

/* Marketing */

export interface Subscriber {
  id: Id;
  email: string;
  createdAt: string;
}

export interface Discount {
  id: Id;
  code: string;
  percent: number;
  active: boolean;
}
