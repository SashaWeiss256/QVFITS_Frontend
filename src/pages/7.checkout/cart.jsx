/* Cart Page, Step 1 (port of Quivogue cart.html) */
import { useState } from "react";
import BackLink from "@/components/ui/BackLink";
import { Link, useNavigate } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useSeo } from "@/seo/useSeo";
import { bagProblems, lineKey } from "@/utils/bagCheck";
import { glideTo } from "@/utils/smoothScroll";
import BagEmpty from "./sections/BagEmpty";
import BagRow from "./sections/BagRow";
import Steps from "./sections/Steps";
import CartLayout from "./CartLayout";
import OrderSummary from "./sections/OrderSummary";
import { useCheckoutBag } from "./useCheckoutBag";
import { t } from "@/i18n/translate";

export default function CartPage() {
  useSeo({ title: "Your bag", noindex: true });
  const bag = useCheckoutBag();
  const navigate = useNavigate();
  // Shown once Continue is tapped with a line that has no size (or one sold out); it updates as they fix it.
  const [tried, setTried] = useState(false);
  const problems = bagProblems(bag.rows);

  const toDelivery = () => {
    if (!problems.length) return navigate("/checkout");
    setTried(true);
    const row = document.getElementById(`bag-${lineKey(problems[0].line)}`);
    if (row) glideTo(row);
    row?.querySelector("select")?.focus({ preventScroll: true });
  };

  return (
    <section className="section section--tight">
      <div className="wrap">
        <p className="crumbs"><Link to="/">{t("Home")}</Link> / Your bag<BackLink fallback="/shop" /></p>
        <h1 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-[1.05]">{t("Your bag")}</h1>
        {/* Empty state takes precedence; show the checkout skeleton only for a non-empty bag still resolving. */}
        {bag.empty ? (
          <BagEmpty />
        ) : bag.isLoading ? (
          <PageLoader variant="form" />
        ) : (
          <>
            <Steps at={1} />
            <CartLayout>
              <div>
                <div className="border-t border-line">{bag.rows.map((r) => <BagRow key={lineKey(r.line)} row={r} />)}</div>
                <Link className="link-arrow mt-[18px] inline-flex min-h-11 items-center" to="/shop">← Keep shopping</Link>
              </div>
              {/* Region defaults to Kampala here; the delivery step picks the real one. */}
              <OrderSummary bag={bag}>
                {/* Every line needs a size the shopper chose, in stock, before delivery. */}
                {tried && problems.length > 0 && (
                  <ul role="alert" className="m-0 mt-3.5 list-none space-y-1 border-l-2 border-warn p-0 pl-3 text-[0.84rem] text-warn">
                    {problems.map((x) => <li key={lineKey(x.line)}>{x.message}</li>)}
                  </ul>
                )}
                <button type="button" className="btn btn--primary btn--block mt-3.5" onClick={toDelivery}>{t("Continue to delivery")}</button>
                <p className="mt-3 text-[.78rem] text-ink-4">{t("Delivery and payment come next. Nothing is charged yet.")}</p>
              </OrderSummary>
            </CartLayout>
          </>
        )}
      </div>
    </section>
  );
}
