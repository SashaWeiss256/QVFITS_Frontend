/* Site Pages */
import { lazy } from "react";

// One chunk per page, numbered as in src/pages. Sign-in pages live in each
// dashboard's own barrel (CustomerPages, AdminPages).

export const HomePage = lazy(() => import("@/pages/1.home/home"));
export const SeenOnYouPage = lazy(() => import("@/pages/1.home/seen-on-you"));
export const ShopPage = lazy(() => import("@/pages/2.shop/shop"));
export const ProductPage = lazy(() => import("@/pages/3.product/product"));
export const AboutPage = lazy(() => import("@/pages/4.about/about"));
export const SizeGuidePage = lazy(() => import("@/pages/5.size-guide/size-guide"));
export const ContactPage = lazy(() => import("@/pages/6.contact/contact"));
export const CartPage = lazy(() => import("@/pages/7.checkout/cart"));
export const CheckoutPage = lazy(() => import("@/pages/7.checkout/checkout"));
export const OrderConfirmedPage = lazy(() => import("@/pages/7.checkout/order-confirmed"));
export const TrackOrderPage = lazy(() => import("@/pages/8.track-order/track-order"));
export const LegalPage = lazy(() => import("@/pages/9.legal/legal"));
export const NewsletterConfirmPage = lazy(() => import("@/pages/10.newsletter/confirm"));
export const NewsletterUnsubscribePage = lazy(() => import("@/pages/10.newsletter/unsubscribe"));
