/* Customer Auth Routes */
import { Route } from "react-router-dom";

import { CustomerConfirmEmail, CustomerForgotPassword, CustomerLogin, CustomerResetPassword, CustomerSignup } from "@/CustomerDashboard/CustomerPages";

// Full screen, outside the storefront chrome. The admin's door is separate,
// under /admin (AdminRoutes).
export default function authRoutes() {
  return (
    <>
      <Route path="login" element={<CustomerLogin />} />
      <Route path="signup" element={<CustomerSignup />} />
      <Route path="forgot-password" element={<CustomerForgotPassword />} />
      <Route path="reset-password" element={<CustomerResetPassword />} />
      <Route path="account/confirm" element={<CustomerConfirmEmail />} />
    </>
  );
}
