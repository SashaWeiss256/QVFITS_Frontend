/* Site Pages Barrel */
import { lazy } from "react";

// One chunk per page. Route files import from here so they export nothing
// but their route builders.

export const HomePage = lazy(() => import("@/pages/1.home/home"));
export const ShopPage = lazy(() => import("@/pages/2.shop/shop"));
export const ProductPage = lazy(() => import("@/pages/2.shop/product"));
export const AboutPage = lazy(() => import("@/pages/3.about/about"));
export const SizeGuidePage = lazy(() => import("@/pages/4.size-guide/size-guide"));
export const ContactPage = lazy(() => import("@/pages/5.contact/contact"));
export const CartPage = lazy(() => import("@/pages/6.cart/cart"));
export const CheckoutPage = lazy(() => import("@/pages/6.cart/checkout"));
export const OrderConfirmedPage = lazy(() => import("@/pages/6.cart/order-confirmed"));
export const TrackOrderPage = lazy(() => import("@/pages/6.cart/track-order"));
export const PrivacyPage = lazy(() => import("@/pages/7.legal/privacy"));
export const TermsPage = lazy(() => import("@/pages/7.legal/terms"));
export const ReturnsPage = lazy(() => import("@/pages/7.legal/returns"));
export const DeliveryPage = lazy(() => import("@/pages/7.legal/delivery"));
