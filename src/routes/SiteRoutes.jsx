/* Site Routes */
import { Route } from "react-router-dom";

import NotFound from "@/pages/not-found";
import SiteLayout from "./SiteLayout";
import accountRoutes from "./AccountRoutes";
import {
  HomePage,
  SeenOnYouPage,
  ShopPage,
  ProductPage,
  AboutPage,
  SizeGuidePage,
  ContactPage,
  CartPage,
  CheckoutPage,
  OrderConfirmedPage,
  NewsletterConfirmPage,
  NewsletterUnsubscribePage,
  TrackOrderPage,
  LegalPage,
} from "./pages";

// Returned as a fragment so App keeps one <Routes>. The customer account
// shares the storefront chrome, so its routes mount inside this layout.
export default function siteRoutes() {
  return (
    <Route element={<SiteLayout />}>
      <Route index element={<HomePage />} />
      {/* /shop/bras, /shop/for/pilates, /shop/bras/running, /shop/new (utils/shopTargets) */}
      <Route path="shop/*" element={<ShopPage />} />
      <Route path="product/:slug" element={<ProductPage />} />
      <Route path="seen-on-you" element={<SeenOnYouPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="size-guide" element={<SizeGuidePage />} />
      <Route path="contact" element={<ContactPage />} />

      {/* Bag and orders; checkout never requires an account */}
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="order/:ref" element={<OrderConfirmedPage />} />
      <Route path="track-order" element={<TrackOrderPage />} />
      <Route path="newsletter/confirm" element={<NewsletterConfirmPage />} />
      <Route path="newsletter/unsubscribe" element={<NewsletterUnsubscribePage />} />

      {/* Legal */}
      {["privacy", "terms", "returns", "delivery"].map((doc) => (
        <Route key={doc} path={doc} element={<LegalPage />} />
      ))}

      {accountRoutes()}

      {/* Inside the layout, so a lost visitor still has the header and footer */}
      <Route path="*" element={<NotFound />} />
    </Route>
  );
}
