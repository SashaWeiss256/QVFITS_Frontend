/* Admin Routes */
import { Route } from "react-router-dom";

import RequireAdmin from "@/AdminDashboard/components/auth/RequireAdmin";
import {
  AdminLayout,
  AdminLogin,
  AdminInvite,
  AdminOverview,
  CatalogProducts,
  CatalogCategories,
  CatalogInventory,
  CatalogReviews,
  SalesOrders,
  SalesCustomers,
  SalesDiscounts,
  SalesTransactions,
  MarketingOffers,
  MarketingNewsletter,
  WebsiteHomeContent,
  WebsiteFaq,
  AdminTeam,
  AdminSettings,
} from "@/AdminDashboard/AdminPages";

export default function adminRoutes() {
  return (
    <>
      {/* The staff door: full screen, outside the guard */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin/invite" element={<AdminInvite />} />

      <Route
        path="admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminOverview />} />

        {/* Catalog */}
        <Route path="products" element={<CatalogProducts />} />
        <Route path="categories" element={<CatalogCategories />} />
        <Route path="inventory" element={<CatalogInventory />} />
        <Route path="reviews" element={<CatalogReviews />} />

        {/* Sales */}
        <Route path="orders" element={<SalesOrders />} />
        <Route path="customers" element={<SalesCustomers />} />
        <Route path="discounts" element={<SalesDiscounts />} />
        <Route path="transactions" element={<SalesTransactions />} />

        {/* Marketing */}
        <Route path="offers" element={<MarketingOffers />} />
        <Route path="newsletter" element={<MarketingNewsletter />} />

        {/* Website */}
        <Route path="website" element={<WebsiteHomeContent />} />
        <Route path="faq" element={<WebsiteFaq />} />

        <Route path="team" element={<AdminTeam />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </>
  );
}
