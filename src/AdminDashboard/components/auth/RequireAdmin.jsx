/* Admin Route Guard */
import { Navigate, useLocation } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";

// A signed-out visitor goes to the staff door; the address they wanted rides
// along so sign-in returns there.
export default function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return <PageLoader className="min-h-dvh" />;
  if (!admin) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
}
