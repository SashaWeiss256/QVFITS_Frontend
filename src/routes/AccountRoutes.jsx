/* Account Routes */
import { Navigate, Route } from "react-router-dom";

import RequireCustomer from "@/CustomerDashboard/components/auth/RequireCustomer";
import {
  CustomerLayout,
  AccountProfile,
  AccountOrders,
  AccountOrderDetail,
  AccountWishlist,
  AccountAddresses,
  AccountSettings,
} from "@/CustomerDashboard/CustomerPages";

export default function accountRoutes() {
  return (
    <>
      <Route
        path="account"
        element={
          <RequireCustomer>
            <CustomerLayout />
          </RequireCustomer>
        }
      >
        <Route index element={<AccountProfile />} />
        <Route path="orders" element={<AccountOrders />} />
        <Route path="orders/:id" element={<AccountOrderDetail />} />
        <Route path="wishlist" element={<AccountWishlist />} />
        <Route path="addresses" element={<AccountAddresses />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>
      {/* One address for saved pieces, as in Belioras */}
      <Route path="wishlist" element={<Navigate to="/account/wishlist" replace />} />
    </>
  );
}
