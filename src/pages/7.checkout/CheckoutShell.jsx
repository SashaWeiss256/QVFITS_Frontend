/* Checkout Shell */
import BackLink from "@/components/ui/BackLink";
import { Link } from "react-router-dom";

import Steps from "./sections/Steps";
import { t } from "@/i18n/translate";

// Breadcrumb, the page's h1 (read aloud) and the step indicator around each
// checkout state.
export default function CheckoutShell({ step, children }) {
  return (
    <section className="section section--tight">
      <div className="wrap">
        <p className="crumbs"><Link to="/">{t("Home")}</Link> / <Link to="/cart">{t("Your bag")}</Link> / Checkout<BackLink fallback="/cart" /></p>
        <h1 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-[1.05]">{t("Checkout")}</h1>
        {/* No step indicator while the bag is empty or loading. */}
        {step && <Steps at={step} />}
        {children}
      </div>
    </section>
  );
}
