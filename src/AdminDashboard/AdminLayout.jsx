/* Admin Shell */
import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import QueryErrorBoundary from "@/components/layout/QueryErrorBoundary";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useOverview } from "@/store/tanstackStore/queries/admin";
import { useSeo } from "@/seo/useSeo";
import AdminHeader from "./components/header/AdminHeader";
import AdminSidebar from "./components/sidebar/AdminSidebar";

// The admin's own app: no storefront chrome, same Quivogue tokens and type.
export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut, can } = useAdminAuth();
  // Counts beside Orders, Returns, Reviews and Messages in the sidebar.
  const { data: overview } = useOverview(30, can("overview"));
  const badges = overview ? { orders: overview.pending, returns: overview.inbox.returns, reviews: overview.inbox.reviews, messages: overview.inbox.messages } : {};
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const { pathname } = useLocation();
  useSeo({ title: "Admin", noindex: true });

  // The main pane scrolls, not the window, so reset it per module.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-cream">
      <AdminSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} badges={badges} />
      <main ref={mainRef} className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <AdminHeader onOpenMenu={() => setMenuOpen(true)} onSignOut={handleSignOut} />
        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          {/* Each module is its own chunk; the shell stays put while one loads */}
          <QueryErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </QueryErrorBoundary>
        </div>
      </main>
    </div>
  );
}
