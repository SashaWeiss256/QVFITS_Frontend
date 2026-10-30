/* Site Shell */
import { Fragment, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { m } from "motion/react";

import FitAssistant from "@/components/assistant/FitAssistant";
import CookieConsent from "@/components/layout/CookieConsent";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import QueryErrorBoundary from "@/components/layout/QueryErrorBoundary";
import SideDrawer from "@/components/layout/SideDrawer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { useLocale } from "@/i18n/LocaleProvider";
import PageLoader from "@/components/ui/PageLoader";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { useContentGuard } from "@/utils/contentGuard";
import { t } from "@/i18n/translate";

// The storefront chrome from Quivogue: sticky header, the side
// drawer, the footer and Vee. No pop ups: the cookie notice is the only one. The customer account renders inside it too.
export default function SiteLayout() {
  const { pathname } = useLocation();
  const { lang } = useLocale();
  useMagnetic();
  useContentGuard();
  return (
    <>
      {/* The whole shop draws again when the language changes */}
      <Fragment key={lang}>
      <SmoothScroll />
      <a href="#main" className="skip-link">
        {t("Skip to content")}
      </a>
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
      <FitAssistant />
      <CookieConsent />
      </Fragment>
    </>
  );
}
