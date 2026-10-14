/* Admin Pages Barrel */
import { lazy } from "react";

// Each module is its own chunk, so opening the admin downloads only the shell
// and the module in view; shoppers never download any of it. Folder 1 is the
// staff door; the rest follow the sidebar order (lib/constants.jsx).

export const AdminLayout = lazy(() => import("./AdminLayout"));

// Auth
export const AdminLogin = lazy(() => import("./pages/1.auth/admin-login"));
export const AdminInvite = lazy(() => import("./pages/1.auth/admin-invite"));

export const AdminOverview = lazy(() => import("./pages/2.overview/overview"));

// Catalog
export const CatalogProducts = lazy(() => import("./pages/3.catalog/products/products"));
export const CatalogCategories = lazy(() => import("./pages/3.catalog/categories/categories"));
export const CatalogInventory = lazy(() => import("./pages/3.catalog/inventory/inventory"));
export const CatalogReviews = lazy(() => import("./pages/3.catalog/reviews/reviews"));

// Sales
export const SalesOrders = lazy(() => import("./pages/4.sales/orders/orders"));
export const SalesCustomers = lazy(() => import("./pages/4.sales/customers/customers"));
export const SalesDiscounts = lazy(() => import("./pages/4.sales/discounts/discounts"));
export const SalesTransactions = lazy(() => import("./pages/4.sales/transactions/transactions"));

// Marketing
export const MarketingOffers = lazy(() => import("./pages/5.marketing/offers/offers"));
export const MarketingNewsletter = lazy(() => import("./pages/5.marketing/newsletter/newsletter"));

// Website
export const WebsiteHomeContent = lazy(() => import("./pages/6.website/home-content/home-content"));
export const WebsiteFaq = lazy(() => import("./pages/6.website/faq/faq"));

export const AdminTeam = lazy(() => import("./pages/7.team/team"));
export const AdminSettings = lazy(() => import("./pages/8.settings/settings"));
