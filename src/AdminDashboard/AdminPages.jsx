/* Admin Pages */
import { lazy } from "react";

// Each module is its own chunk, so opening the admin downloads only the shell
// and the module in view; shoppers never download any of it. Folders follow
// the sidebar order (lib/constants.jsx) after folder 1, the staff door.

// The staff door: full screen, outside the guard
export const AdminLogin = lazy(() => import("./pages/1.auth/login"));
export const AdminInvite = lazy(() => import("./pages/1.auth/invite"));

export const AdminLayout = lazy(() => import("./AdminLayout"));

export const Overview = lazy(() => import("./pages/2.overview/overview"));

// Catalog
export const Products = lazy(() => import("./pages/3.products/products"));
export const ProductEdit = lazy(() => import("./pages/3.products/product-edit"));
export const Categories = lazy(() => import("./pages/4.categories/categories"));
export const Attributes = lazy(() => import("./pages/5.attributes/attributes"));
export const Inventory = lazy(() => import("./pages/6.inventory/inventory"));
export const Collections = lazy(() => import("./pages/7.collections/collections"));
export const Reviews = lazy(() => import("./pages/8.reviews/reviews"));
export const SizeGuide = lazy(() => import("./pages/9.size-guide/size-guide"));

// Sales
export const Orders = lazy(() => import("./pages/10.orders/orders"));
export const Returns = lazy(() => import("./pages/11.returns/returns"));
export const Customers = lazy(() => import("./pages/12.customers/customers"));
export const Transactions = lazy(() => import("./pages/13.transactions/transactions"));

// Marketing
export const Discounts = lazy(() => import("./pages/14.discounts/discounts"));
export const Offers = lazy(() => import("./pages/15.offers/offers"));
export const Newsletter = lazy(() => import("./pages/16.newsletter/newsletter"));

// Website
export const HomeContent = lazy(() => import("./pages/17.home-content/home-content"));
export const PagesAndMenus = lazy(() => import("./pages/18.pages/pages"));
export const Faq = lazy(() => import("./pages/19.faq/faq"));
export const Messages = lazy(() => import("./pages/20.messages/messages"));

// Admin
export const Team = lazy(() => import("./pages/21.team/team"));
export const Settings = lazy(() => import("./pages/22.settings/settings"));
export const ActivityLog = lazy(() => import("./pages/23.activity/activity"));
