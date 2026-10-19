/* Api Route Map */

/**
 * Where each qvfits-api module mounts, agreed before the module exists so a
 * service is written against the same path the API will serve
 * (docs/05-backend-integration.md). Only the routes listed in `routes`
 * below are live; every other service still runs on mocks.
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
  adminAuth: {
    setup: "auth/admin/setup",
    login: "auth/admin/login",
    refresh: "auth/admin/refresh",
    logout: "auth/admin/logout",
    me: "auth/admin/me",
    invite: "auth/admin/invite",
    acceptInvite: "auth/admin/accept-invite",
  },
  team: {
    staff: "admin/team/staff",
    roles: "admin/team/roles",
  },
  catalog: {
    facets: "catalog/facets",
    products: "catalog/products",
    productsByIds: "catalog/products/by-ids",
    kits: "catalog/kits",
    reviews: "catalog/reviews",
    sizeChart: "catalog/size-chart",
  },
  adminCatalog: {
    products: "admin/catalog/products",
    stockMovements: "admin/catalog/products/stock-movements",
    groups: "admin/catalog/groups",
    categories: "admin/catalog/categories",
    terms: "admin/catalog/terms",
    colors: "admin/catalog/colors",
    sizes: "admin/catalog/sizes",
    filters: "admin/catalog/filters",
    reviews: "admin/catalog/reviews",
    sizeChart: "admin/catalog/size-chart",
  },
  uploads: "admin/uploads",
};
