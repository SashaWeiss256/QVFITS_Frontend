/* Cart Page, Step 1 (port of Quivogue cart.html) */
import { Link } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useSeo } from "@/seo/useSeo";
import BagEmpty from "./sections/BagEmpty";
import BagRow from "./sections/BagRow";
import Steps from "./sections/Steps";
import OrderSummary from "./sections/OrderSummary";
import { useCheckoutBag } from "./useCheckoutBag";

export default function CartPage() {
  useSeo({ title: "Your bag", noindex: true });
  const bag = useCheckoutBag();

  return (
    <section className="section section--tight">
      <div className="wrap">
        <p className="crumbs"><Link to="/">Home</Link> / Your bag</p>
        <h1 className="sr-only">Your bag</h1>
        {/* Empty state takes precedence; show the checkout skeleton only for a non-empty bag still resolving. */}
        {bag.empty ? (
          <BagEmpty />
        ) : bag.isLoading ? (
          <PageLoader />
        ) : (
          <>
            <Steps at={1} />
            <div className="cart-layout">
              <div>
                <div className="cart-list">{bag.rows.map((r) => <BagRow key={`${r.line.productId}-${r.line.size}-${r.line.color}`} row={r} />)}</div>
                <Link className="link-arrow mt-[18px] inline-flex min-h-11 items-center" to="/shop">← Keep shopping</Link>
              </div>
              {/* Region defaults to Kampala here; the delivery step picks the real one. */}
              <OrderSummary bag={bag}>
                <Link className="btn btn--primary btn--block mt-3.5" to="/checkout">Continue to delivery</Link>
                <p className="mt-3 text-center text-[.78rem] text-ink-4">Delivery and payment come next. Nothing is charged yet.</p>
              </OrderSummary>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
