/* Customer Route Guard */
import { Navigate, useLocation } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";

// A signed-out shopper goes to /login, and the address they wanted rides
// along as ?next= so sign-in returns them there.
export default function RequireCustomer({ children }) {
  const { customer, loading } = useCustomerAuth();
  const { pathname } = useLocation();

  if (loading) return <PageLoader variant="logo" />;
  if (!customer) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />;
  return children;
}
