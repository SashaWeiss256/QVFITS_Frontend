/* Admin Routes */
import { Navigate, Route } from "react-router-dom";

import RequireAdmin from "@/AdminDashboard/components/auth/RequireAdmin";
import PermissionGate from "@/AdminDashboard/components/PermissionGate";
import * as P from "@/AdminDashboard/AdminPages";

// Path, permission module (src/data/permissions.json) and page, in sidebar order.
const MODULES = [
  ["reports", "reports", P.Reports],
  ["products", "products", P.Products],
  ["products/new", "products", P.ProductEdit],
  ["products/:id", "products", P.ProductEdit],
  ["categories", "categories", P.Categories],
  ["size-guide", "size-guide", P.SizeGuide],
  ["orders", "orders", P.Orders],
  ["transactions", "transactions", P.Transactions],
  ["customers", "customers", P.Customers],
  ["messages", "messages", P.Messages],
  ["discounts", "discounts", P.Discounts],
  ["offers", "offers", P.Offers],
  ["newsletter", "newsletter", P.Newsletter],
  ["vee", "vee", P.Vee],
  ["team", "team", P.Team],
  ["settings", "settings", P.Settings],
  ["activity", "activity", P.ActivityLog],
];

// Pages that became tabs keep their old addresses working.
const MOVED = [
  ["inventory", "/admin/products?tab=stock"],
  ["reviews", "/admin/products?tab=reviews"],
  ["returns", "/admin/orders?tab=returns"],
  ["collections", "/admin/products?type=kit"],
  // The website content is part of the site's code now, not dashboard data.
  ["website", "/admin"],
  ["pages", "/admin"],
  ["faq", "/admin"],
];

export default function adminRoutes() {
  return (
    <>
      {/* The staff door: full screen, outside the guard */}
      <Route path="admin/login" element={<P.AdminLogin />} />
      <Route path="admin/invite" element={<P.AdminInvite />} />

      <Route
        path="admin"
        element={
          <RequireAdmin>
            <P.AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<PermissionGate perm="overview"><P.Overview /></PermissionGate>} />
        {/* Every module checks the signed-in role before it renders. */}
        {MODULES.map(([path, perm, Page]) => (
          <Route key={path} path={path} element={<PermissionGate perm={perm}><Page /></PermissionGate>} />
        ))}
        {MOVED.map(([path, to]) => <Route key={path} path={path} element={<Navigate to={to} replace />} />)}
      </Route>
    </>
  );
}
