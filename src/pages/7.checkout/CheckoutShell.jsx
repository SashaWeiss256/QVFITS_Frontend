/* Checkout Shell */
import { Link } from "react-router-dom";

import Steps from "./sections/Steps";

// Breadcrumb, the page's h1 (read aloud) and the step indicator around each
// checkout state.
export default function CheckoutShell({ step, children }) {
  return (
    <section className="section section--tight">
      <div className="wrap">
        <p className="crumbs"><Link to="/">Home</Link> / <Link to="/cart">Your bag</Link> / Checkout</p>
        <h1 className="sr-only">Checkout</h1>
        {/* No step indicator while the bag is empty or loading. */}
        {step && <Steps at={step} />}
        {children}
      </div>
    </section>
  );
}
