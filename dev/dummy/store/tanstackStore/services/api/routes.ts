/* Api Route Map */

/**
 * Where each qvfits-api module mounts, agreed before the module exists so a
 * service is written against the same path the API will serve
 * (docs/05-backend-integration.md). Nothing answers on these yet; every
 * service still runs on mocks.
 */
export const API_NAMESPACES = {
  auth: "auth", // customer and admin sign-in
  catalog: "catalog", // products, categories, collections, reviews, size chart
  checkout: "checkout",
  payments: "payments", // gateway sessions and the webhook
  orders: "orders",
  customers: "customers",
  content: "content", // hero, looks, FAQ, shop details, delivery fees, rates
  marketing: "marketing", // offers, discount codes, newsletter
  assistant: "assistant",
  reports: "reports",
};

/** Live endpoints. Everything absent from here is still a mock. */
export const routes = {
  health: "health",
};
