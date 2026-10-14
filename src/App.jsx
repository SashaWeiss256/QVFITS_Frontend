/* Root Application */
import { Suspense } from "react";
import { BrowserRouter, Routes } from "react-router-dom";

import AppProviders from "./AppProviders";
import ScrollToTop from "./components/layout/ScrollToTop";
import PageLoader from "./components/ui/PageLoader";
import adminRoutes from "./routes/AdminRoutes";
import authRoutes from "./routes/AuthRoutes";
import siteRoutes from "./routes/SiteRoutes";

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <ScrollToTop />
        {/* Catches chunks rendered outside a layout: the sign-in doors and the admin shell */}
        <Suspense fallback={<PageLoader className="min-h-dvh" />}>
          <Routes>
            {adminRoutes()}
            {authRoutes()}
            {siteRoutes()}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
