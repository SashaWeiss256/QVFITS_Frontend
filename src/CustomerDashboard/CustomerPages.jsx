/* Customer Pages Barrel */
import { lazy } from "react";

// Each page is its own chunk. Folder 1 is the shopper's door; the rest follow
// the account menu order (lib/accountMenuItems.js).

export const CustomerLayout = lazy(() => import("./CustomerLayout"));

// Auth
export const CustomerLogin = lazy(() => import("./pages/1.auth/login"));
export const CustomerSignup = lazy(() => import("./pages/1.auth/signup"));
export const CustomerForgotPassword = lazy(() => import("./pages/1.auth/forgot-password"));

export const AccountProfile = lazy(() => import("./pages/2.profile/profile"));
export const AccountOrders = lazy(() => import("./pages/3.orders/orders"));
export const AccountOrderDetail = lazy(() => import("./pages/3.orders/order-detail"));
export const AccountWishlist = lazy(() => import("./pages/4.wishlist/wishlist"));
export const AccountAddresses = lazy(() => import("./pages/5.addresses/addresses"));
export const AccountSettings = lazy(() => import("./pages/6.settings/settings"));
