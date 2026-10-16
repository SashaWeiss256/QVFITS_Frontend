/* Bag Totals */
import { useCart } from "@/store/context/CartContext";
import { useOffers, useProductsByIds, useSettings } from "@/store/tanstackStore/queries/site";
import { saleOf } from "@/utils/stockLevel";

/**
 * The bag joined to its products, with a subtotal and the delivery fee for a
 * region. A preview only: placing the order prices it again in the service
 * (checkoutApi), in UGX.
 */
export function useBag(region = "kampala") {
  const { lines } = useCart();
  const { data: products = [], isLoading } = useProductsByIds(lines.map((l) => l.productId));
  const { data: settings } = useSettings();
  const { data: offers } = useOffers();

  const priceOf = (p) => saleOf(p, offers?.sale)?.now ?? p.price;
  const rows = lines
    .map((line) => ({ line, product: products.find((p) => p.id === line.productId) }))
    .filter((r) => r.product)
    .map((r) => ({ ...r, unit: priceOf(r.product), total: priceOf(r.product) * r.line.qty }));
  const subtotal = rows.reduce((n, r) => n + r.total, 0);

  let delivery = 0;
  if (settings && region !== "pickup" && subtotal < settings.freeShippingOver) {
    delivery = region === "upcountry" ? settings.upcountryDelivery : settings.kampalaDelivery;
  }

  return { rows, subtotal, delivery, total: subtotal + delivery, settings, isLoading: isLoading && lines.length > 0, empty: !lines.length };
}
