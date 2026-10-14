/* Site Shell */
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import FitAssistant from "@/components/assistant/FitAssistant";
import Footer from "@/components/layout/footer/Footer";
import Navbar from "@/components/layout/navbar";
import PromoBar from "@/components/layout/PromoBar";
import QueryErrorBoundary from "@/components/layout/QueryErrorBoundary";
import SideDrawer from "@/components/layout/SideDrawer";
import Sticker from "@/components/storefront/Sticker";
import PageLoader from "@/components/ui/PageLoader";

// The storefront chrome from Quivogue: promo bar, sticky header, the side
// drawer, the footer and Vee. The customer account renders inside it too.
export default function SiteLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <PromoBar />
      <Navbar />
      <main>
        {/* Header and footer stay painted while a page chunk loads */}
        <QueryErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </QueryErrorBoundary>
      </main>
      <Footer />
      <SideDrawer />
      <Sticker />
      <FitAssistant />
    </>
  );
}
