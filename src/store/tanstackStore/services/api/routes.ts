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
  shop: {
    settings: "shop/settings",
    shippingZones: "shop/shipping-zones",
    paymentMethods: "shop/payment-methods",
  },
  customerAuth: {
    signup: "auth/customer/signup",
    login: "auth/customer/login",
    refresh: "auth/customer/refresh",
    logout: "auth/customer/logout",
    me: "auth/customer/me",
    confirmEmail: "auth/customer/confirm-email",
    forgotPassword: "auth/customer/forgot-password",
    resetPassword: "auth/customer/reset-password",
  },
  account: {
    profile: "account",
    addresses: "account/addresses",
    wishlist: "account/wishlist",
    bag: "account/bag",
    recentlyViewed: "account/recently-viewed",
    orders: "account/orders",
    returns: "account/returns",
    export: "account/export",
  },
  checkout: {
    quote: "checkout/quote",
    orders: "checkout/orders",
  },
  guestOrders: {
    track: "orders/track",
    cancel: "orders/cancel",
    return: "orders/return",
  },
  adminSales: {
    orders: "admin/orders",
    sales: "admin/orders/sales",
    returns: "admin/returns",
    transactions: "admin/transactions",
    outbox: "admin/outbox",
    customers: "admin/customers",
    discounts: "admin/discounts",
    settings: "admin/settings",
    shippingZones: "admin/settings/shipping-zones",
    paymentMethods: "admin/settings/payment-methods",
  },
  newsletter: {
    consent: "newsletter/consent",
    subscribe: "newsletter/subscribe",
    confirm: "newsletter/confirm",
    unsubscribe: "newsletter/unsubscribe",
    mine: "account/newsletter",
  },
  adminNewsletter: {
    subscribers: "admin/newsletter/subscribers",
    settings: "admin/newsletter/settings",
    campaigns: "admin/newsletter/campaigns",
  },
  site: {
    offers: "site/offers",
    menuFeature: "site/menu-feature",
    contact: "site/contact",
    veeQuestions: "site/vee/questions",
  },
  adminSite: {
    messages: "admin/messages",
    veeQuestions: "admin/vee/questions",
    offers: "admin/content/offers",
    menuFeature: "admin/content/menu-feature",
    activity: "admin/activity",
  },
};
