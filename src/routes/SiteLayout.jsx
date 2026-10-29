/* Site Shell */
import { Fragment, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { m } from "motion/react";

import FitAssistant from "@/components/assistant/FitAssistant";
import CookieConsent from "@/components/layout/CookieConsent";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import PromoBar from "@/components/layout/PromoBar";
import QueryErrorBoundary from "@/components/layout/QueryErrorBoundary";
import SideDrawer from "@/components/layout/SideDrawer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import WelcomeModal from "@/components/storefront/WelcomeModal";
import { useLocale } from "@/i18n/LocaleProvider";
import Sticker from "@/components/storefront/Sticker";
import PageLoader from "@/components/ui/PageLoader";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { t } from "@/i18n/translate";

// The storefront chrome from Quivogue: promo bar, sticky header, the side
// drawer, the footer and Vee. The customer account renders inside it too.
export default function SiteLayout() {
  const { pathname } = useLocation();
  const { lang } = useLocale();
  useMagnetic();
  return (
    <>
      {/* The whole shop draws again when the language changes; the welcome sits outside so it keeps its place */}
      <WelcomeModal />
      <Fragment key={lang}>
      <SmoothScroll />
      <a href="#main" className="skip-link">
        {t("Skip to content")}
      </a>
      <PromoBar />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* Header and footer stay painted while a page chunk loads */}
        <QueryErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageLoader />}>
            {/* Each page arrives with a short fade and rise, so moving between them feels like turning a page */}
            <m.div key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <Outlet />
            </m.div>
          </Suspense>
        </QueryErrorBoundary>
      </main>
      <Footer />
      <SideDrawer />
      <Sticker />
      <FitAssistant />
      <CookieConsent />
      </Fragment>
    </>
  );
}
