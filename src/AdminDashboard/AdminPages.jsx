/* Admin Pages */
import { lazy } from "react";

// Each module is its own chunk, so opening the admin downloads only the shell
// and the module in view; shoppers never download any of it. Folders follow
// the sidebar order (lib/constants.jsx) after folder 1, the staff door.

// The staff door: full screen, outside the guard
export const AdminLogin = lazy(() => import("./pages/1.auth/login"));
export const AdminInvite = lazy(() => import("./pages/1.auth/invite"));
export const AdminSetup = lazy(() => import("./pages/1.auth/setup"));

export const AdminLayout = lazy(() => import("./AdminLayout"));

export const Overview = lazy(() => import("./pages/2.overview/overview"));
export const Reports = lazy(() => import("./pages/3.reports/reports"));

// Catalog
export const Products = lazy(() => import("./pages/4.products/products"));
export const ProductEdit = lazy(() => import("./pages/4.products/product-edit"));
export const Categories = lazy(() => import("./pages/5.categories/categories"));
export const SizeGuide = lazy(() => import("./pages/6.size-guide/size-guide"));

// Sales
export const Orders = lazy(() => import("./pages/7.orders/orders"));
export const Transactions = lazy(() => import("./pages/8.transactions/transactions"));
export const Customers = lazy(() => import("./pages/9.customers/customers"));
export const Messages = lazy(() => import("./pages/10.messages/messages"));

// Marketing
export const Discounts = lazy(() => import("./pages/11.discounts/discounts"));
export const Offers = lazy(() => import("./pages/12.offers/offers"));
export const Newsletter = lazy(() => import("./pages/13.newsletter/newsletter"));
export const Vee = lazy(() => import("./pages/14.vee/vee"));

// Admin
export const Team = lazy(() => import("./pages/15.team/team"));
export const Settings = lazy(() => import("./pages/16.settings/settings"));
export const ActivityLog = lazy(() => import("./pages/17.activity/activity"));
